<?php

namespace Micodigo\AnioEscolar;

use Exception;
use PDO;
use PDOException;

trait AnioEscolarGestionTrait
{
  public function crear(PDO $conexion, array $datos): array
  {
    $validacion = $this->validarDatosAnio($conexion, $datos, false, null);
    if (!$validacion['valido']) {
      return ['errores' => $validacion['errores']];
    }

    if ($this->existeConEstado($conexion, ['activo', 'incompleto'])) {
      return ['errores' => ['estado' => ['Ya existe un año escolar activo o incompleto.']]];
    }

    $momentosEntrada = $datos['momentos'] ?? null;
    if ($momentosEntrada !== null && !is_array($momentosEntrada)) {
      return ['errores' => ['momentos' => ['El formato de los momentos académicos es inválido.']]];
    }

    $momentosPrevalidados = $momentosEntrada ?? $this->generarMomentosAutomaticos($validacion['datos']);
    $momentosValidados = $this->validarMomentos($momentosPrevalidados, $validacion['datos']);
    if (!$momentosValidados['valido']) {
      return ['errores' => $momentosValidados['errores']];
    }

    if (!$this->momentosTablaDisponible($conexion)) {
      return ['errores' => ['momentos' => ['La tabla "momentos" no existe en la base de datos. Ejecute las migraciones pendientes antes de registrar un año escolar.']]];
    }

    try {
      $conexion->beginTransaction();

      $idAnio = $this->insertarAnio($conexion, $validacion['datos']);
      foreach ($momentosValidados['momentos'] as $momento) {
        $this->insertarMomento($conexion, $idAnio, $momento);
      }

      $conexion->commit();

      return ['datos' => $this->consultarPorId($conexion, $idAnio)];
    } catch (PDOException $excepcion) {
      if ($conexion->inTransaction()) {
        $conexion->rollBack();
      }
      throw $excepcion;
    }
  }

  public function actualizar(PDO $conexion, int $idAnio, array $datos): array
  {
    $actual = $this->consultarPorId($conexion, $idAnio);
    if ($actual === null) {
      return ['errores' => ['id_anio_escolar' => ['El año escolar solicitado no existe.']]];
    }

    $entrada = [
      'fecha_inicio' => $datos['fecha_inicio'] ?? $actual['fecha_inicio'],
      'fecha_fin' => $datos['fecha_fin'] ?? $actual['fecha_fin'],
      'fecha_limite_inscripcion' => $datos['fecha_limite_inscripcion'] ?? $actual['fecha_limite_inscripcion'],
      'estado' => $datos['estado'] ?? $actual['estado'],
    ];

    $validacion = $this->validarDatosAnio($conexion, $entrada, true, $idAnio);
    if (!$validacion['valido']) {
      return ['errores' => $validacion['errores']];
    }

    $momentosEntrada = $datos['momentos'] ?? $actual['momentos'];
    if (!is_array($momentosEntrada)) {
      return ['errores' => ['momentos' => ['El formato de los momentos académicos es inválido.']]];
    }

    $momentosNormalizados = array_map(function ($momento) {
      return [
        'id' => isset($momento['id']) ? $momento['id'] : ($momento['id_momento'] ?? null),
        'orden' => isset($momento['orden']) ? $momento['orden'] : ($momento['momento_orden'] ?? null),
        'nombre' => $momento['nombre'] ?? $momento['momento_nombre'] ?? null,
        'fecha_inicio' => $momento['fecha_inicio'] ?? $momento['momento_inicio'] ?? null,
        'fecha_fin' => $momento['fecha_fin'] ?? $momento['momento_fin'] ?? ($momento['fecha_final'] ?? null),
        'fecha_final' => $momento['fecha_fin'] ?? $momento['momento_fin'] ?? ($momento['fecha_final'] ?? null),
        'estado' => $momento['estado'] ?? $momento['momento_estado'] ?? 'activo',
      ];
    }, $momentosEntrada);

    $momentosValidados = $this->validarMomentos($momentosNormalizados, $validacion['datos']);
    if (!$momentosValidados['valido']) {
      return ['errores' => $momentosValidados['errores']];
    }

    $estadoDestino = strtolower($validacion['datos']['estado'] ?? 'incompleto');
    if (in_array($estadoDestino, ['activo', 'incompleto'], true)) {
      if ($this->existeConEstado($conexion, ['activo', 'incompleto'], $idAnio)) {
        return ['errores' => ['estado' => ['Ya existe un año escolar activo o incompleto.']]];
      }
    }

    if (!$this->momentosTablaDisponible($conexion)) {
      return ['errores' => ['momentos' => ['La tabla "momentos" no existe en la base de datos. Ejecute las migraciones pendientes antes de actualizar un año escolar.']]];
    }

    try {
      $conexion->beginTransaction();

      $this->actualizarAnio($conexion, $idAnio, $validacion['datos']);
      $this->sincronizarMomentos($conexion, $idAnio, $momentosValidados['momentos']);

      $conexion->commit();

      return ['datos' => $this->consultarPorId($conexion, $idAnio)];
    } catch (PDOException $excepcion) {
      if ($conexion->inTransaction()) {
        $conexion->rollBack();
      }
      throw $excepcion;
    }
  }

  public function eliminar(PDO $conexion, int $idAnio): array
  {
    $anio = $this->consultarPorId($conexion, $idAnio);
    if ($anio === null) {
      return ['errores' => ['id_anio_escolar' => ['El año escolar solicitado no existe.']]];
    }

    $estadoActual = strtolower($anio['estado'] ?? '');
    if ($estadoActual !== 'inactivo') {
      return ['errores' => ['estado' => ['Solo se pueden eliminar años escolares desactivados.']]];
    }

    if ($this->tieneGradosSeccionAsociados($conexion, $idAnio)) {
      return ['errores' => ['relaciones' => ['No se puede eliminar el año escolar porque tiene grados y secciones asociados.']]];
    }

    if ($this->tieneImparticionesAsociadas($conexion, $idAnio)) {
      return ['errores' => ['relaciones' => ['No se puede eliminar el año escolar porque existen clases impartidas asociadas a este año escolar.']]];
    }

    if ($this->tieneAulasAsociadas($conexion, $idAnio)) {
      return ['errores' => ['relaciones' => ['No se puede eliminar el año escolar porque tiene aulas asociadas.']]];
    }

    try {
      $conexion->beginTransaction();
      if ($this->momentosTablaDisponible($conexion)) {
        $this->eliminarMomentos($conexion, $idAnio);
      }
      $sql = 'DELETE FROM anios_escolares WHERE id_anio_escolar = ?';
      $this->ejecutarAccion($conexion, $sql, [$idAnio]);
      $conexion->commit();

      return ['datos' => ['id_anio_escolar' => $idAnio]];
    } catch (PDOException $excepcion) {
      if ($conexion->inTransaction()) {
        $conexion->rollBack();
      }
      throw $excepcion;
    }
  }

  public function cambiarEstado(PDO $conexion, int $idAnio, ?string $accion = null): array
  {
    $anio = $this->consultarPorId($conexion, $idAnio);
    if ($anio === null) {
      return ['errores' => ['id_anio_escolar' => ['El año escolar solicitado no existe.']]];
    }

    $accionNormalizada = $this->normalizarAccionEstado($accion, $anio['estado'] ?? 'incompleto');
    if ($accionNormalizada === null) {
      return ['errores' => ['accion' => ['La acción solicitada es inválida.']]];
    }

    $resumenDocentes = null;
    if ($accionNormalizada === 'activar') {
      if ($this->existeConEstado($conexion, ['activo', 'incompleto'], $idAnio)) {
        return ['errores' => ['estado' => ['Ya existe un año escolar activo o incompleto. Debes desactivarlo antes de activar otro.']]];
      }

      $fechaInicio = $anio['fecha_inicio'] ?? null;
      if ($this->existeAnioPosterior($conexion, $fechaInicio, $idAnio)) {
        return ['errores' => ['estado' => ['No se puede activar este año escolar porque existe otro año registrado con fechas posteriores.']]];
      }

      $estadoActual = strtolower($anio['estado'] ?? '');
      if ($estadoActual === 'inactivo') {
        if ($this->existeAnioPosteriorConEstado($conexion, $fechaInicio, ['activo', 'incompleto'], $idAnio)) {
          return ['errores' => ['estado' => ['No se puede activar este año escolar mientras exista uno posterior con estado activo o incompleto.']]];
        }
      }

      if (!$this->momentosTablaDisponible($conexion)) {
        return ['errores' => ['momentos' => ['No se puede activar el año escolar porque la tabla de momentos no está disponible. Ejecute las migraciones pendientes.']]];
      }

      $primerMomento = $this->obtenerPrimerMomentoConfigurado($conexion, $idAnio);
      if ($primerMomento === null) {
        return ['errores' => ['momentos' => ['Debes configurar al menos el primer momento escolar antes de activar el año.']]];
      }

      if (($primerMomento['estado'] ?? null) !== 'activo') {
        return ['errores' => ['momentos' => ['El primer momento escolar debe estar en estado activo antes de activar el año.']]];
      }

      $resumenDocentes = $this->obtenerResumenAsignacionesDocentes($conexion, $idAnio);
      $totalAulas = $resumenDocentes['total_aulas'];
      $aulasConDocente = $resumenDocentes['aulas_con_docente'];

      if ($totalAulas > 0 && $aulasConDocente < $totalAulas) {
        $faltantes = $resumenDocentes['aulas_sin_docente'];
        $errores = [
          'docentes' => [
            'Debes asignar un docente titular de aula a cada grado y sección antes de activar el año escolar.',
          ],
        ];

        if (!empty($faltantes)) {
          $listado = array_map(function (array $aula): string {
            return $aula['descripcion'] ?? sprintf('Aula #%d', $aula['id_aula'] ?? 0);
          }, $faltantes);

          $errores['docentes'][] = 'Aulas pendientes: ' . implode(', ', $listado);
          $errores['aulas_sin_docente'] = $faltantes;
        }

        return ['errores' => $errores];
      }

      $dependencias = $this->obtenerDependenciasInactivas($conexion, $idAnio);
      if (!empty($dependencias)) {
        return ['errores' => $dependencias];
      }
    } elseif ($accionNormalizada === 'desactivar') {
      $bloqueos = $this->obtenerBloqueosDesactivacion($conexion, $idAnio);
      if (!empty($bloqueos)) {
        return ['errores' => $bloqueos];
      }
    }

    try {
      $conexion->beginTransaction();

      if ($accionNormalizada === 'activar') {
        if ($resumenDocentes === null) {
          $resumenDocentes = $this->obtenerResumenAsignacionesDocentes($conexion, $idAnio);
        }

        $this->desactivarOtrosAnios($conexion, $idAnio);
        $this->actualizarEstado($conexion, $idAnio, 'activo');
        $this->activarPrimerMomento($conexion, $idAnio);
      } elseif ($accionNormalizada === 'desactivar') {
        $this->actualizarEstado($conexion, $idAnio, 'inactivo');
      }

      $conexion->commit();
      $datos = $this->consultarPorId($conexion, $idAnio);
      if ($resumenDocentes !== null) {
        $datos['resumen_docentes'] = $resumenDocentes;
      }

      return ['datos' => $datos];
    } catch (PDOException $excepcion) {
      if ($conexion->inTransaction()) {
        $conexion->rollBack();
      }
      throw $excepcion;
    }
  }

  private function activarPrimerMomento(PDO $conexion, int $idAnio): void
  {
    if (!$this->momentosTablaDisponible($conexion)) {
      return;
    }

    try {
      $idMomento = $this->ejecutarValor(
        $conexion,
        'SELECT id_momento FROM momentos WHERE fk_anio_escolar = ? ORDER BY nombre_momento ASC, fecha_inicio ASC, id_momento ASC LIMIT 1',
        [$idAnio]
      );

      if ($idMomento === null || $idMomento === false) {
        return;
      }

      $idMomento = (int) $idMomento;
      if ($idMomento <= 0) {
        return;
      }

      $this->ejecutarAccion(
        $conexion,
        'UPDATE momentos SET estado_momento = "activo" WHERE id_momento = ?',
        [$idMomento]
      );
    } catch (Exception $excepcion) {
      if ($this->esErrorTablaMomentosInexistente($excepcion)) {
        return;
      }
      throw $excepcion;
    }
  }

  private function normalizarAccionEstado(?string $accion, string $estadoActual): ?string
  {
    if ($accion === null || $accion === '') {
      return $estadoActual === 'activo' ? 'desactivar' : 'activar';
    }

    $accionLimpia = strtolower(trim($accion));
    return in_array($accionLimpia, ['activar', 'desactivar'], true) ? $accionLimpia : null;
  }

  private function insertarAnio(PDO $conexion, array $datos): int
  {
    $id = $this->obtenerSiguienteIdAnio($conexion);

    $sql = 'INSERT INTO anios_escolares (id_anio_escolar, fecha_inicio, fecha_fin, limite_inscripcion, estado)
            VALUES (:id, :inicio, :fin, :limite, :estado)';

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([
      ':id' => $id,
      ':inicio' => $datos['fecha_inicio'],
      ':fin' => $datos['fecha_fin'],
      ':limite' => $datos['fecha_limite_inscripcion'],
      ':estado' => $datos['estado'] ?? 'incompleto',
    ]);

    return $id;
  }

  private function insertarMomento(PDO $conexion, int $idAnio, array $momento): void
  {
    $orden = $this->obtenerOrdenMomentoComoCadena($momento);
    $estado = $this->normalizarEstadoMomentoBD($momento);
    $fin = $momento['fecha_fin'] ?? $momento['fecha_final'] ?? null;

    $existe = $this->ejecutarValor(
      $conexion,
      'SELECT COUNT(*) FROM momentos WHERE fk_anio_escolar = ? AND nombre_momento = ?',
      [$idAnio, $orden]
    );

    if ((int) $existe > 0) {
      throw new \RuntimeException('Ya existe un momento con ese orden para el año escolar.');
    }

    $sql = 'INSERT INTO momentos (fk_anio_escolar, nombre_momento, fecha_inicio, fecha_fin, estado_momento)
            VALUES (:anio, :orden, :inicio, :fin, :estado)';

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([
      ':anio' => $idAnio,
      ':orden' => $orden,
      ':inicio' => $momento['fecha_inicio'],
      ':fin' => $fin,
      ':estado' => $estado,
    ]);
  }

  private function actualizarAnio(PDO $conexion, int $idAnio, array $datos): void
  {
    $sql = 'UPDATE anios_escolares
            SET fecha_inicio = :inicio,
                fecha_fin = :fin,
                limite_inscripcion = :limite,
                estado = :estado
            WHERE id_anio_escolar = :id';

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([
      ':inicio' => $datos['fecha_inicio'],
      ':fin' => $datos['fecha_fin'],
      ':limite' => $datos['fecha_limite_inscripcion'],
      ':estado' => $datos['estado'] ?? 'incompleto',
      ':id' => $idAnio,
    ]);
  }

  private function sincronizarMomentos(PDO $conexion, int $idAnio, array $momentos): void
  {
    if (!$this->momentosTablaDisponible($conexion)) {
      return;
    }

    foreach ($momentos as $momento) {
      if (!empty($momento['id'])) {
        $orden = $this->obtenerOrdenMomentoComoCadena($momento);
        $estado = $this->normalizarEstadoMomentoBD($momento);
        $fin = $momento['fecha_fin'] ?? $momento['fecha_final'] ?? null;

        $existe = $this->ejecutarValor(
          $conexion,
          'SELECT COUNT(*) FROM momentos WHERE fk_anio_escolar = ? AND nombre_momento = ? AND id_momento <> ?',
          [$idAnio, $orden, $momento['id']]
        );

        if ((int) $existe > 0) {
          throw new \RuntimeException('Ya existe otro momento con ese orden para el año escolar.');
        }

        $sql = 'UPDATE momentos
                SET nombre_momento = :orden,
                    fecha_inicio = :inicio,
                    fecha_fin = :fin,
                    estado_momento = :estado
                WHERE id_momento = :id AND fk_anio_escolar = :anio';

        $sentencia = $conexion->prepare($sql);
        $sentencia->execute([
          ':orden' => $orden,
          ':inicio' => $momento['fecha_inicio'],
          ':fin' => $fin,
          ':estado' => $estado,
          ':id' => $momento['id'],
          ':anio' => $idAnio,
        ]);
        continue;
      }

      $this->insertarMomento($conexion, $idAnio, $momento);
    }
  }

  private function eliminarMomentos(PDO $conexion, int $idAnio): void
  {
    $sql = 'DELETE FROM momentos WHERE fk_anio_escolar = ?';
    $this->ejecutarAccion($conexion, $sql, [$idAnio]);
  }

  private function actualizarEstado(PDO $conexion, int $idAnio, string $estado): void
  {
    $estadoNormalizado = $this->normalizarEstado($estado);
    $sql = 'UPDATE anios_escolares SET estado = ? WHERE id_anio_escolar = ?';
    $this->ejecutarAccion($conexion, $sql, [$estadoNormalizado, $idAnio]);
  }

  private function desactivarOtrosAnios(PDO $conexion, int $idMantener): void
  {
    $sql = 'UPDATE anios_escolares SET estado = "inactivo" WHERE id_anio_escolar <> ? AND estado = "activo"';
    $this->ejecutarAccion($conexion, $sql, [$idMantener]);
  }

  private function obtenerPrimerMomentoConfigurado(PDO $conexion, int $idAnio): ?array
  {
    $momentos = $this->consultarMomentosPorAnio($conexion, $idAnio);
    if (empty($momentos)) {
      return null;
    }

    foreach ($momentos as $momento) {
      if ((int) ($momento['orden'] ?? 0) === 1) {
        return $momento;
      }
    }

    return null;
  }

  private function obtenerDependenciasInactivas(PDO $conexion, int $idAnio): array
  {
    $errores = [];

    $aulas = $this->ejecutarConsulta(
      $conexion,
      "SELECT a.id_aula, a.estado, gs.grado, gs.seccion
         FROM aula a
    LEFT JOIN grado_seccion gs ON gs.id_grado_seccion = a.fk_grado_seccion
        WHERE a.fk_anio_escolar = ?
          AND a.estado IS NOT NULL
          AND LOWER(a.estado) <> 'activo'",
      [$idAnio]
    );

    if (!empty($aulas)) {
      $errores['dependencias'][] = 'Existen aulas asociadas al año escolar que no están en estado activo.';
      $errores['aulas_inactivas'] = array_map(function (array $fila): array {
        $grado = $fila['grado'] ?? null;
        $seccion = $fila['seccion'] ?? null;
        $descripcion = trim(sprintf(
          'Gr %s - Secc %s',
          $grado !== null ? $grado : 'N/D',
          $seccion !== null ? $seccion : 'N/D'
        ));

        return [
          'id_aula' => isset($fila['id_aula']) ? (int) $fila['id_aula'] : 0,
          'grado' => $grado,
          'seccion' => $seccion,
          'estado' => $fila['estado'] ?? null,
          'descripcion' => $descripcion,
        ];
      }, $aulas);
    }

    $personal = $this->ejecutarConsulta(
      $conexion,
      "SELECT i.tipo_docente, per.id_personal, per.estado AS estado_personal,
              p.estado AS estado_persona, p.primer_nombre, p.segundo_nombre,
              p.primer_apellido, p.segundo_apellido
         FROM imparte i
         INNER JOIN aula a ON a.id_aula = i.fk_aula
         INNER JOIN personal per ON per.id_personal = i.fk_personal
         INNER JOIN personas p ON p.id_persona = per.fk_persona
        WHERE a.fk_anio_escolar = ?
          AND (LOWER(per.estado) <> 'activo' OR LOWER(p.estado) <> 'activo')",
      [$idAnio]
    );

    if (!empty($personal)) {
      $agrupado = [];
      foreach ($personal as $fila) {
        $idPersonal = isset($fila['id_personal']) ? (int) $fila['id_personal'] : 0;
        if (!isset($agrupado[$idPersonal])) {
          $nombre = trim(implode(' ', array_filter([
            $fila['primer_nombre'] ?? '',
            $fila['segundo_nombre'] ?? '',
            $fila['primer_apellido'] ?? '',
            $fila['segundo_apellido'] ?? '',
          ])));

          $agrupado[$idPersonal] = [
            'id_personal' => $idPersonal,
            'nombre' => $nombre !== '' ? $nombre : sprintf('Personal #%d', $idPersonal),
            'estado_personal' => $fila['estado_personal'] ?? null,
            'estado_persona' => $fila['estado_persona'] ?? null,
            'roles' => [],
          ];
        }

        $rol = $fila['tipo_docente'] ?? '';
        if ($rol !== '' && !in_array($rol, $agrupado[$idPersonal]['roles'], true)) {
          $agrupado[$idPersonal]['roles'][] = $rol;
        }
      }

      $errores['dependencias'][] = 'Hay docentes o especialistas asociados que no están activos.';
      $errores['personal_inactivo'] = array_values($agrupado);
    }

    $componentes = $this->ejecutarConsulta(
      $conexion,
      "SELECT DISTINCT c.id_componente, c.nombre_componente, c.estado_componente
         FROM imparte i
         INNER JOIN aula a ON a.id_aula = i.fk_aula
         INNER JOIN componentes_aprendizaje c ON c.id_componente = i.fk_componente
        WHERE a.fk_anio_escolar = ?
          AND LOWER(c.estado_componente) <> 'activo'",
      [$idAnio]
    );

    if (!empty($componentes)) {
      $errores['dependencias'][] = 'Los componentes asociados a las clases deben encontrarse activos.';
      $errores['componentes_inactivos'] = array_map(function (array $fila): array {
        return [
          'id_componente' => isset($fila['id_componente']) ? (int) $fila['id_componente'] : 0,
          'nombre' => $fila['nombre_componente'] ?? sprintf('Componente #%d', (int) ($fila['id_componente'] ?? 0)),
          'estado' => $fila['estado_componente'] ?? null,
        ];
      }, $componentes);
    }

    return $errores;
  }

  private function obtenerBloqueosDesactivacion(PDO $conexion, int $idAnio): array
  {
    $errores = [];
    $relaciones = [];

    $inscripciones = (int) $this->ejecutarValor(
      $conexion,
      "SELECT COUNT(*)
         FROM inscripciones ins
         INNER JOIN aula a ON a.id_aula = ins.fk_aula
        WHERE a.fk_anio_escolar = ?
          AND ins.estado_inscripcion IN ('activo', 'en_proceso')",
      [$idAnio]
    );

    if ($inscripciones > 0) {
      $relaciones[] = sprintf('Existen %d inscripciones activas o en proceso asociadas al año escolar.', $inscripciones);
      $errores['inscripciones'] = $inscripciones;
    }

    $asignaciones = (int) $this->ejecutarValor(
      $conexion,
      "SELECT COUNT(DISTINCT i.fk_aula)
         FROM imparte i
         INNER JOIN aula a ON a.id_aula = i.fk_aula
        WHERE a.fk_anio_escolar = ?",
      [$idAnio]
    );

    if ($asignaciones > 0) {
      $relaciones[] = 'Existen asignaciones de docentes o especialistas asociadas al año escolar.';
      $errores['asignaciones_docentes'] = $asignaciones;
    }

    if (!empty($relaciones)) {
      $errores['dependencias'] = $relaciones;
    }

    return $errores;
  }

  private function obtenerOrdenMomentoComoCadena(array $momento): string
  {
    $candidatos = [
      $momento['orden'] ?? null,
      $momento['nombre_momento'] ?? null,
      $momento['nombre'] ?? null,
    ];

    foreach ($candidatos as $valor) {
      if ($valor === null || $valor === '') {
        continue;
      }

      if (is_numeric($valor)) {
        $numero = (int) $valor;
        if ($numero >= 1 && $numero <= 3) {
          return (string) $numero;
        }
      }

      if (is_string($valor) && preg_match('/([1-3])/', $valor, $coincidencia)) {
        return $coincidencia[1];
      }
    }

    throw new \RuntimeException('El orden del momento es inválido. Debe estar entre 1 y 3.');
  }

  private function normalizarEstadoMomentoBD(array $momento): string
  {
    $estado = $momento['estado'] ?? $momento['estado_momento'] ?? null;
    $estado = is_string($estado) ? strtolower(trim($estado)) : null;

    if (in_array($estado, ['planificado', 'incompleto'], true)) {
      $estado = 'pendiente';
    }

    $permitidos = ['activo', 'pendiente', 'finalizado'];
    if ($estado === null || $estado === '') {
      return 'pendiente';
    }

    return in_array($estado, $permitidos, true) ? $estado : 'pendiente';
  }

  private function obtenerSiguienteIdAnio(PDO $conexion): int
  {
    $sql = 'SELECT MAX(id_anio_escolar) FROM anios_escolares FOR UPDATE';
    $valor = $this->ejecutarValor($conexion, $sql) ?? 0;
    $maximo = is_numeric($valor) ? (int) $valor : 0;
    return $maximo + 1;
  }
}
