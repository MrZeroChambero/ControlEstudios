<?php

namespace Micodigo\AnioEscolar;

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
    if (!$this->existePorId($conexion, $idAnio)) {
      return ['errores' => ['id_anio_escolar' => ['El año escolar solicitado no existe.']]];
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

    try {
      $conexion->beginTransaction();

      if ($accionNormalizada === 'activar') {
        $this->desactivarOtrosAnios($conexion, $idAnio);
        $tieneAulas = $this->tieneAulasAsociadas($conexion, $idAnio);
        $estadoFinal = $tieneAulas ? 'activo' : 'incompleto';
        $this->actualizarEstado($conexion, $idAnio, $estadoFinal);
      } elseif ($accionNormalizada === 'desactivar') {
        $this->actualizarEstado($conexion, $idAnio, 'inactivo');
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

    return in_array($estado, ['activo', 'finalizado'], true) ? $estado : 'activo';
  }

  private function obtenerSiguienteIdAnio(PDO $conexion): int
  {
    $sql = 'SELECT MAX(id_anio_escolar) FROM anios_escolares FOR UPDATE';
    $valor = $this->ejecutarValor($conexion, $sql) ?? 0;
    $maximo = is_numeric($valor) ? (int) $valor : 0;
    return $maximo + 1;
  }
}
