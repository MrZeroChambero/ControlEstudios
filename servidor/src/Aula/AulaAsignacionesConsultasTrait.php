<?php

namespace Micodigo\Aula;

use PDO;

trait AulaAsignacionesConsultasTrait
{
  protected function obtenerMomentosPorAnio(PDO $conexion, int $anioId): array
  {
    $sql = 'SELECT id_momento,
                   fk_anio_escolar,
                   nombre_momento,
                   fecha_inicio,
                   fecha_fin,
                   estado_momento
            FROM momentos
            WHERE fk_anio_escolar = ?
            ORDER BY CAST(nombre_momento AS UNSIGNED)';

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$anioId]);

    $momentos = $sentencia->fetchAll(PDO::FETCH_ASSOC) ?: [];

    return array_map(function (array $fila): array {
      return [
        'id' => (int) $fila['id_momento'],
        'anio_id' => (int) $fila['fk_anio_escolar'],
        'orden' => (int) $fila['nombre_momento'],
        'nombre' => 'Momento ' . $fila['nombre_momento'],
        'fecha_inicio' => $fila['fecha_inicio'],
        'fecha_fin' => $fila['fecha_fin'],
        'estado' => $fila['estado_momento'],
      ];
    }, $momentos);
  }

  protected function obtenerMomentosActivos(PDO $conexion, int $anioId): array
  {
    $todos = $this->obtenerMomentosPorAnio($conexion, $anioId);
    return array_values(array_filter($todos, fn(array $momento): bool => $momento['estado'] === 'activo'));
  }

  protected function obtenerPersonalPorId(PDO $conexion, int $idPersonal): ?array
  {
    $sql = 'SELECT per.id_personal,
                   per.estado AS estado_personal,
                   per.fk_funcion,
                   fp.tipo AS tipo_funcion,
                   fp.nombre AS nombre_funcion,
                   p.primer_nombre,
                   p.segundo_nombre,
                   p.primer_apellido,
                   p.segundo_apellido,
                   p.cedula,
                   p.estado AS estado_persona
            FROM personal per
            INNER JOIN funcion_personal fp ON fp.id_funcion_personal = per.fk_funcion
            INNER JOIN personas p ON p.id_persona = per.fk_persona
            WHERE per.id_personal = ?
            LIMIT 1';

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$idPersonal]);

    $registro = $sentencia->fetch(PDO::FETCH_ASSOC);
    if (!$registro) {
      return null;
    }

    return [
      'id_personal' => (int) $registro['id_personal'],
      'estado_personal' => $registro['estado_personal'],
      'estado_persona' => $registro['estado_persona'],
      'tipo_funcion' => $registro['tipo_funcion'],
      'nombre_funcion' => $registro['nombre_funcion'],
      'fk_funcion' => (int) $registro['fk_funcion'],
      'primer_nombre' => $registro['primer_nombre'],
      'segundo_nombre' => $registro['segundo_nombre'],
      'primer_apellido' => $registro['primer_apellido'],
      'segundo_apellido' => $registro['segundo_apellido'],
      'cedula' => $registro['cedula'],
    ];
  }

  protected function personalTieneAsignacionActiva(PDO $conexion, int $anioId, int $personalId, int $aulaIdActual): bool
  {
    $sql = 'SELECT 1
            FROM imparte i
            INNER JOIN aula a ON a.id_aula = i.fk_aula
            WHERE i.tipo_docente = "aula"
              AND i.fk_personal = ?
              AND a.fk_anio_escolar = ?
              AND a.id_aula <> ?
            LIMIT 1';

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$personalId, $anioId, $aulaIdActual]);

    return (bool) $sentencia->fetchColumn();
  }

  protected function obtenerComponentesPorIds(PDO $conexion, array $componentes): array
  {
    if (empty($componentes)) {
      return [];
    }

    $placeholders = implode(',', array_fill(0, count($componentes), '?'));
    $sql = "SELECT id_componente,
                   fk_area,
                   nombre_componente,
                   especialista,
                   estado_componente
            FROM componentes_aprendizaje
            WHERE id_componente IN ($placeholders)";

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute($componentes);

    $registros = $sentencia->fetchAll(PDO::FETCH_ASSOC) ?: [];

    return array_map(function (array $fila): array {
      return [
        'id_componente' => (int) $fila['id_componente'],
        'fk_area' => (int) $fila['fk_area'],
        'nombre_componente' => $fila['nombre_componente'],
        'especialista' => $fila['especialista'],
        'estado' => $fila['estado_componente'],
      ];
    }, $registros);
  }

  protected function obtenerAreasConComponentes(PDO $conexion): array
  {
    $sql = 'SELECT a.id_area_aprendizaje,
                   a.nombre_area,
                   a.estado_area,
                   c.id_componente,
                   c.nombre_componente,
                   c.especialista,
                   c.estado_componente
            FROM areas_aprendizaje a
            LEFT JOIN componentes_aprendizaje c ON c.fk_area = a.id_area_aprendizaje
            WHERE a.estado_area = "activo"
            ORDER BY a.nombre_area, c.nombre_componente';

    $sentencia = $conexion->query($sql);
    $lista = $sentencia !== false ? $sentencia->fetchAll(PDO::FETCH_ASSOC) : [];

    $agrupado = [];
    foreach ($lista as $fila) {
      $areaId = (int) $fila['id_area_aprendizaje'];
      if (!isset($agrupado[$areaId])) {
        $agrupado[$areaId] = [
          'id' => $areaId,
          'nombre' => $fila['nombre_area'],
          'estado' => $fila['estado_area'],
          'componentes' => [],
        ];
      }

      if (!empty($fila['id_componente']) && $fila['estado_componente'] === 'activo') {
        $agrupado[$areaId]['componentes'][] = [
          'id' => (int) $fila['id_componente'],
          'nombre' => $fila['nombre_componente'],
          'especialista' => $fila['especialista'],
          'requiere_especialista' => $this->determinarSiRequiereEspecialista($fila['especialista'] ?? null),
        ];
      }
    }

    return array_values($agrupado);
  }

  protected function determinarSiRequiereEspecialista(?string $valor): bool
  {
    if ($valor === null) {
      return false;
    }

    $normalizado = strtolower(trim($valor));
    if ($normalizado === '' || $normalizado === 'no') {
      return false;
    }

    if ($normalizado === 'si' || $normalizado === 'sí') {
      return true;
    }

    return str_contains($normalizado, 'especial');
  }

  protected function obtenerDocentesDisponibles(PDO $conexion, int $anioId): array
  {
    $sqlAsignacion = 'SELECT i.fk_personal,
                             MIN(a.id_aula) AS id_aula,
                             MIN(gs.grado) AS grado,
                             MIN(gs.seccion) AS seccion
                      FROM imparte i
                      INNER JOIN aula a ON a.id_aula = i.fk_aula
                      INNER JOIN grado_seccion gs ON gs.id_grado_seccion = a.fk_grado_seccion
                      WHERE i.tipo_docente = "aula" AND a.fk_anio_escolar = ?
                      GROUP BY i.fk_personal';

    $asignacionStmt = $conexion->prepare($sqlAsignacion);
    $asignacionStmt->execute([$anioId]);
    $asignaciones = $asignacionStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    $mapaAsignaciones = [];
    foreach ($asignaciones as $fila) {
      $mapaAsignaciones[(int) $fila['fk_personal']] = [
        'aula_id' => (int) $fila['id_aula'],
        'grado' => $fila['grado'],
        'seccion' => $fila['seccion'],
      ];
    }

    $sql = 'SELECT per.id_personal,
                   per.estado AS estado_personal,
                   fp.nombre AS funcion,
                   p.primer_nombre,
                   p.segundo_nombre,
                   p.primer_apellido,
                   p.segundo_apellido,
                   p.cedula
            FROM personal per
            INNER JOIN funcion_personal fp ON fp.id_funcion_personal = per.fk_funcion
            INNER JOIN personas p ON p.id_persona = per.fk_persona
            WHERE per.estado = "activo"
              AND p.estado = "activo"
              AND fp.tipo = "Docente"
            ORDER BY p.primer_nombre, p.primer_apellido';

    $sentencia = $conexion->query($sql);
    $registros = $sentencia !== false ? $sentencia->fetchAll(PDO::FETCH_ASSOC) : [];

    return array_map(function (array $fila) use ($mapaAsignaciones): array {
      $idPersonal = (int) $fila['id_personal'];
      $asignacion = $mapaAsignaciones[$idPersonal] ?? null;
      return [
        'id_personal' => $idPersonal,
        'nombre_completo' => $this->construirNombreCompleto($fila),
        'cedula' => $fila['cedula'],
        'funcion' => $fila['funcion'],
        'ocupado' => $asignacion !== null,
        'aula' => $asignacion,
      ];
    }, $registros);
  }

  protected function obtenerEspecialistasDisponibles(PDO $conexion): array
  {
    $sql = 'SELECT per.id_personal,
                   per.estado AS estado_personal,
                   fp.nombre AS funcion,
                   p.primer_nombre,
                   p.segundo_nombre,
                   p.primer_apellido,
                   p.segundo_apellido,
                   p.cedula
            FROM personal per
            INNER JOIN funcion_personal fp ON fp.id_funcion_personal = per.fk_funcion
            INNER JOIN personas p ON p.id_persona = per.fk_persona
            WHERE per.estado = "activo"
              AND p.estado = "activo"
              AND fp.tipo = "Especialista"
            ORDER BY p.primer_nombre, p.primer_apellido';

    $sentencia = $conexion->query($sql);
    $registros = $sentencia !== false ? $sentencia->fetchAll(PDO::FETCH_ASSOC) : [];

    return array_map(function (array $fila): array {
      return [
        'id_personal' => (int) $fila['id_personal'],
        'nombre_completo' => $this->construirNombreCompleto($fila),
        'cedula' => $fila['cedula'],
        'funcion' => $fila['funcion'],
      ];
    }, $registros);
  }

  protected function construirNombreCompleto(array $datos): string
  {
    $partes = [
      $datos['primer_nombre'] ?? '',
      $datos['segundo_nombre'] ?? '',
      $datos['primer_apellido'] ?? '',
      $datos['segundo_apellido'] ?? '',
    ];

    $partes = array_filter(array_map('trim', $partes));
    return implode(' ', $partes);
  }

  protected function obtenerAsignacionesDocentes(PDO $conexion, array $aulaIds): array
  {
    if (empty($aulaIds)) {
      return [];
    }

    $placeholders = implode(',', array_fill(0, count($aulaIds), '?'));
    $sql = "SELECT i.fk_aula,
                   i.fk_personal,
                   MIN(i.clases_totales) AS clases_totales,
                   GROUP_CONCAT(DISTINCT i.fk_componente ORDER BY i.fk_componente) AS componentes,
                   MIN(p.primer_nombre) AS primer_nombre,
                   MIN(p.segundo_nombre) AS segundo_nombre,
                   MIN(p.primer_apellido) AS primer_apellido,
                   MIN(p.segundo_apellido) AS segundo_apellido
            FROM imparte i
            INNER JOIN personal per ON per.id_personal = i.fk_personal
            INNER JOIN personas p ON p.id_persona = per.fk_persona
            WHERE i.tipo_docente = 'aula'
              AND i.fk_aula IN ($placeholders)
            GROUP BY i.fk_aula, i.fk_personal";

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute($aulaIds);

    $filas = $sentencia->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $resultado = [];

    foreach ($filas as $fila) {
      $aulaId = (int) $fila['fk_aula'];
      $componentes = [];
      if (!empty($fila['componentes'])) {
        $componentes = array_map('intval', explode(',', $fila['componentes']));
      }

      $resultado[$aulaId] = [
        'id_personal' => (int) $fila['fk_personal'],
        'nombre_completo' => $this->construirNombreCompleto($fila),
        'componentes' => $componentes,
        'clases_totales' => $fila['clases_totales'] !== null ? (int) $fila['clases_totales'] : null,
      ];
    }

    return $resultado;
  }

  protected function obtenerAsignacionesEspecialistas(PDO $conexion, array $aulaIds): array
  {
    if (empty($aulaIds)) {
      return [];
    }

    $placeholders = implode(',', array_fill(0, count($aulaIds), '?'));
    $sql = "SELECT i.fk_aula,
             i.fk_componente,
             i.fk_personal,
             MIN(i.clases_totales) AS clases_totales,
             MIN(p.primer_nombre) AS primer_nombre,
             MIN(p.segundo_nombre) AS segundo_nombre,
             MIN(p.primer_apellido) AS primer_apellido,
             MIN(p.segundo_apellido) AS segundo_apellido,
             MIN(c.nombre_componente) AS nombre_componente,
             MIN(c.especialista) AS especialista
            FROM imparte i
            INNER JOIN personal per ON per.id_personal = i.fk_personal
            INNER JOIN personas p ON p.id_persona = per.fk_persona
            INNER JOIN componentes_aprendizaje c ON c.id_componente = i.fk_componente
            WHERE i.tipo_docente = 'Especialista'
              AND i.fk_aula IN ($placeholders)
            GROUP BY i.fk_aula, i.fk_componente, i.fk_personal";

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute($aulaIds);

    $filas = $sentencia->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $resultado = [];

    foreach ($filas as $fila) {
      $aulaId = (int) $fila['fk_aula'];
      $componenteId = (int) $fila['fk_componente'];
      $resultado[$aulaId][$componenteId] = [
        'componente' => [
          'id' => $componenteId,
          'nombre' => $fila['nombre_componente'],
          'requiere_especialista' => $this->determinarSiRequiereEspecialista($fila['especialista'] ?? null),
        ],
        'personal' => [
          'id_personal' => (int) $fila['fk_personal'],
          'nombre_completo' => $this->construirNombreCompleto($fila),
        ],
        'clases_totales' => $fila['clases_totales'] !== null ? (int) $fila['clases_totales'] : null,
      ];
    }

    return $resultado;
  }

  protected function construirResumenGestion(PDO $conexion, array $anio, array $momentos, array $aulas): array
  {
    $aulaIds = array_map(fn(array $aula): int => (int) $aula['id_aula'], $aulas);
    $docentes = $this->obtenerAsignacionesDocentes($conexion, $aulaIds);
    $especialistas = $this->obtenerAsignacionesEspecialistas($conexion, $aulaIds);
    $areas = $this->obtenerAreasConComponentes($conexion);
    $docentesDisponibles = $this->obtenerDocentesDisponibles($conexion, (int) $anio['id_anio_escolar']);
    $especialistasDisponibles = $this->obtenerEspecialistasDisponibles($conexion);

    $componentesCatalogo = [];
    foreach ($areas as $area) {
      foreach ($area['componentes'] as $componente) {
        $componentesCatalogo[$componente['id']] = $componente;
      }
    }

    $aulasRespuesta = array_map(function (array $aula) use ($docentes, $especialistas, $componentesCatalogo): array {
      $aulaId = (int) $aula['id_aula'];
      $docente = $docentes[$aulaId] ?? null;
      $especialistasAsignados = $especialistas[$aulaId] ?? [];
      $componentesDocente = $docente['componentes'] ?? [];
      $componentesDocenteSet = array_fill_keys($componentesDocente, true);

      $pendientesEspecialistas = 0;
      foreach ($componentesCatalogo as $componenteId => $componente) {
        if (!empty($componente['requiere_especialista']) && !isset($especialistasAsignados[$componenteId])) {
          $pendientesEspecialistas++;
        }
      }

      return [
        'id' => $aulaId,
        'grado' => $aula['grado'],
        'seccion' => $aula['seccion'],
        'estado' => $aula['estado'],
        'docente' => $docente,
        'componentes_docente' => array_values($componentesDocente),
        'especialistas' => array_values($especialistasAsignados),
        'pendientes' => [
          'docente' => $docente === null,
          'especialistas' => $pendientesEspecialistas,
        ],
      ];
    }, $aulas);

    usort($aulasRespuesta, fn(array $a, array $b): int => ($a['grado'] <=> $b['grado']) ?: strcmp($a['seccion'], $b['seccion']));

    return [
      'anio' => [
        'id' => (int) $anio['id_anio_escolar'],
        'estado' => $anio['estado'],
        'fecha_inicio' => $anio['fecha_inicio'],
        'fecha_fin' => $anio['fecha_fin'],
      ],
      'momentos' => $momentos,
      'areas' => $areas,
      'aulas' => $aulasRespuesta,
      'docentes' => $docentesDisponibles,
      'especialistas' => $especialistasDisponibles,
    ];
  }

  protected function obtenerResumenGestionGeneral(PDO $conexion): array
  {
    $anio = $this->obtenerAnioActivoOIncompleto($conexion);
    if ($anio === null) {
      return [
        'anio' => null,
        'momentos' => [],
        'areas' => $this->obtenerAreasConComponentes($conexion),
        'aulas' => [],
        'docentes' => [],
        'especialistas' => $this->obtenerEspecialistasDisponibles($conexion),
      ];
    }

    $momentos = $this->obtenerMomentosPorAnio($conexion, (int) $anio['id_anio_escolar']);
    $aulas = $this->obtenerAulasPorAnio($conexion, (int) $anio['id_anio_escolar']);

    return $this->construirResumenGestion($conexion, $anio, $momentos, $aulas);
  }
}
