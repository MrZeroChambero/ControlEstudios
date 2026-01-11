<?php

namespace Micodigo\RendimientoAcademico;

use PDO;

trait RendimientoAcademicoConsultasTrait
{
  protected function obtenerComponenteDetalle(PDO $conexion, int $componenteId): ?array
  {
    $sql = "SELECT c.id_componente, c.nombre_componente, c.estado_componente, c.evalua, c.especialista, c.fk_area, a.nombre_area\n            FROM componentes_aprendizaje c\n            INNER JOIN areas_aprendizaje a ON a.id_area_aprendizaje = c.fk_area\n           WHERE c.id_componente = ?\n           LIMIT 1";

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$componenteId]);
    $fila = $sentencia->fetch(PDO::FETCH_ASSOC);

    if (!$fila) {
      return null;
    }

    return [
      'id_componente' => (int) $fila['id_componente'],
      'nombre_componente' => $fila['nombre_componente'] ?? '',
      'estado_componente' => $fila['estado_componente'] ?? null,
      'evalua' => $fila['evalua'] ?? null,
      'especialista' => $fila['especialista'] ?? null,
      'fk_area' => (int) ($fila['fk_area'] ?? 0),
      'nombre_area' => $fila['nombre_area'] ?? null,
    ];
  }

  protected function obtenerAsignacionDocente(
    PDO $conexion,
    int $personalId,
    int $componenteId,
    int $momentoId,
    int $anioId,
    ?int $aulaId = null
  ): ?array {
    $parametros = [
      ':personal' => $personalId,
      ':componente' => $componenteId,
      ':momento' => $momentoId,
      ':anio' => $anioId,
    ];

    $filtroAula = '';
    if ($aulaId !== null) {
      $filtroAula = ' AND i.fk_aula = :aula';
      $parametros[':aula'] = $aulaId;
    }

    $sql = <<<SQL
SELECT
  i.id_imparte,
  i.fk_aula,
  i.fk_personal,
  i.fk_momento,
  i.fk_componente,
  i.tipo_docente,
  a.estado AS estado_aula
FROM imparte i
INNER JOIN aula a ON a.id_aula = i.fk_aula
WHERE i.fk_personal = :personal
  AND i.fk_componente = :componente
  AND i.fk_momento = :momento
  AND a.fk_anio_escolar = :anio
  {$filtroAula}
LIMIT 1
SQL;

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute($parametros);
    $fila = $sentencia->fetch(PDO::FETCH_ASSOC);

    return $fila ?: null;
  }

  protected function obtenerComponentesDisponiblesUsuario(
    PDO $conexion,
    array $usuario,
    int $momentoId,
    int $anioId
  ): array {
    $parametros = [
      ':momento' => $momentoId,
      ':anio' => $anioId,
    ];

    $filtroDocente = '';
    if (!$this->usuarioPuedeSupervisarTodasLasAulas($usuario)) {
      $parametros[':personal'] = (int) ($usuario['id_personal'] ?? 0);
      $filtroDocente = ' AND i.fk_personal = :personal';
    }

    $sql = <<<SQL
SELECT DISTINCT
  c.id_componente,
  c.nombre_componente,
  c.estado_componente,
  c.evalua,
  c.especialista,
  ar.nombre_area,
  MIN(i.tipo_docente) AS tipo_docente
FROM imparte i
INNER JOIN aula a ON a.id_aula = i.fk_aula
INNER JOIN componentes_aprendizaje c ON c.id_componente = i.fk_componente
INNER JOIN areas_aprendizaje ar ON ar.id_area_aprendizaje = c.fk_area
WHERE i.fk_momento = :momento
  AND a.fk_anio_escolar = :anio
  AND a.estado = 'activo'
  AND c.estado_componente = 'activo'
  AND c.evalua = 'si'
  {$filtroDocente}
GROUP BY c.id_componente, c.nombre_componente, c.estado_componente, c.evalua, c.especialista, ar.nombre_area
ORDER BY ar.nombre_area ASC, c.nombre_componente ASC
SQL;

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute($parametros);

    $componentes = [];
    while ($fila = $sentencia->fetch(PDO::FETCH_ASSOC)) {
      $componentes[] = [
        'id_componente' => (int) $fila['id_componente'],
        'nombre_componente' => $fila['nombre_componente'] ?? '',
        'estado_componente' => $fila['estado_componente'] ?? null,
        'evalua' => $fila['evalua'] ?? null,
        'especialista' => $fila['especialista'] ?? null,
        'nombre_area' => $fila['nombre_area'] ?? null,
        'tipo_docente' => $fila['tipo_docente'] ?? null,
        'asignado_al_usuario' => !$this->usuarioPuedeSupervisarTodasLasAulas($usuario),
      ];
    }

    if ($this->usuarioPuedeSupervisarTodasLasAulas($usuario)) {
      return $componentes;
    }

    // Ordena con prioridad a los componentes asignados directamente al docente.
    usort($componentes, static function (array $a, array $b): int {
      return strcmp($a['nombre_componente'], $b['nombre_componente']);
    });

    return $componentes;
  }

  protected function obtenerAulasParaComponente(
    PDO $conexion,
    array $usuario,
    int $componenteId,
    int $momentoId,
    int $anioId
  ): array {
    $parametros = [
      ':componente' => $componenteId,
      ':momento' => $momentoId,
      ':anio' => $anioId,
    ];

    $filtroDocente = '';
    if (!$this->usuarioPuedeSupervisarTodasLasAulas($usuario)) {
      $parametros[':personal'] = (int) ($usuario['id_personal'] ?? 0);
      $filtroDocente = ' AND i.fk_personal = :personal';
    }

    $sql = <<<SQL
SELECT
  a.id_aula,
  a.estado,
  a.cupos,
  gs.grado,
  gs.seccion,
  MIN(i.tipo_docente) AS tipo_docente,
  COUNT(DISTINCT CASE WHEN ins.estado_inscripcion = 'activo' THEN ins.id_inscripcion END) AS estudiantes_activos
FROM imparte i
INNER JOIN aula a ON a.id_aula = i.fk_aula
INNER JOIN grado_seccion gs ON gs.id_grado_seccion = a.fk_grado_seccion
LEFT JOIN inscripciones ins ON ins.fk_aula = a.id_aula
WHERE i.fk_componente = :componente
  AND i.fk_momento = :momento
  AND a.fk_anio_escolar = :anio
  AND a.estado = 'activo'
  {$filtroDocente}
GROUP BY a.id_aula, a.estado, a.cupos, gs.grado, gs.seccion
ORDER BY gs.grado ASC, gs.seccion ASC
SQL;

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute($parametros);

    $aulas = [];
    while ($fila = $sentencia->fetch(PDO::FETCH_ASSOC)) {
      $planGeneral = $this->obtenerPlanificacionGeneral($conexion, (int) $fila['id_aula'], $componenteId, $momentoId);
      $aulas[] = [
        'id_aula' => (int) $fila['id_aula'],
        'estado' => $fila['estado'] ?? null,
        'cupos' => isset($fila['cupos']) ? (int) $fila['cupos'] : null,
        'grado' => $fila['grado'] ?? null,
        'seccion' => $fila['seccion'] ?? null,
        'tipo_docente' => $fila['tipo_docente'] ?? null,
        'estudiantes_activos' => (int) $fila['estudiantes_activos'],
        'planificacion_general' => $planGeneral,
      ];
    }

    return $aulas;
  }

  protected function obtenerDetalleAula(PDO $conexion, int $aulaId): ?array
  {
    $sql = <<<SQL
SELECT
  a.id_aula,
  a.fk_anio_escolar,
  a.fk_grado_seccion,
  a.cupos,
  a.estado,
  gs.grado,
  gs.seccion
FROM aula a
INNER JOIN grado_seccion gs ON gs.id_grado_seccion = a.fk_grado_seccion
WHERE a.id_aula = ?
LIMIT 1
SQL;

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$aulaId]);
    $fila = $sentencia->fetch(PDO::FETCH_ASSOC);

    if (!$fila) {
      return null;
    }

    return [
      'id_aula' => (int) $fila['id_aula'],
      'fk_anio_escolar' => (int) $fila['fk_anio_escolar'],
      'fk_grado_seccion' => (int) $fila['fk_grado_seccion'],
      'cupos' => isset($fila['cupos']) ? (int) $fila['cupos'] : null,
      'estado' => $fila['estado'] ?? null,
      'grado' => $fila['grado'] ?? null,
      'seccion' => $fila['seccion'] ?? null,
    ];
  }

  protected function obtenerInscripcionesActivasPorAula(PDO $conexion, int $aulaId): array
  {
    $sql = <<<SQL
SELECT
  ins.id_inscripcion,
  ins.fk_estudiante,
  ins.estado_inscripcion,
  est.id_persona,
  per.primer_nombre,
  per.segundo_nombre,
  per.primer_apellido,
  per.segundo_apellido
FROM inscripciones ins
INNER JOIN estudiantes est ON est.id_estudiante = ins.fk_estudiante
INNER JOIN personas per ON per.id_persona = est.id_persona
WHERE ins.fk_aula = ?
  AND ins.estado_inscripcion = 'activo'
  AND est.estado = 'activo'
ORDER BY per.primer_apellido ASC, per.primer_nombre ASC
SQL;

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$aulaId]);

    $inscripciones = [];
    while ($fila = $sentencia->fetch(PDO::FETCH_ASSOC)) {
      $nombre = $this->construirNombrePersona([
        'primer_nombre' => $fila['primer_nombre'] ?? '',
        'segundo_nombre' => $fila['segundo_nombre'] ?? '',
        'primer_apellido' => $fila['primer_apellido'] ?? '',
        'segundo_apellido' => $fila['segundo_apellido'] ?? '',
      ]);

      $inscripciones[] = [
        'id_inscripcion' => (int) $fila['id_inscripcion'],
        'fk_estudiante' => (int) $fila['fk_estudiante'],
        'estado_inscripcion' => $fila['estado_inscripcion'] ?? null,
        'nombre_estudiante' => $nombre,
      ];
    }

    return $inscripciones;
  }

  protected function obtenerPlanificacionGeneral(PDO $conexion, int $aulaId, int $componenteId, int $momentoId): ?array
  {
    $sql = <<<SQL
SELECT id_planificacion, fk_personal, fk_aula, fk_componente, fk_momento, tipo, estado, reutilizable
  FROM planificaciones
 WHERE fk_aula = ?
   AND fk_componente = ?
   AND fk_momento = ?
   AND tipo = 'aula'
   AND estado = 'activo'
 ORDER BY id_planificacion DESC
 LIMIT 1
SQL;

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$aulaId, $componenteId, $momentoId]);
    $plan = $sentencia->fetch(PDO::FETCH_ASSOC);

    if (!$plan) {
      return null;
    }

    $plan['id_planificacion'] = (int) $plan['id_planificacion'];
    $plan['fk_personal'] = (int) $plan['fk_personal'];
    $plan['fk_aula'] = (int) $plan['fk_aula'];
    $plan['fk_componente'] = (int) $plan['fk_componente'];
    $plan['fk_momento'] = (int) $plan['fk_momento'];

    return $plan;
  }

  protected function obtenerPlanificacionesIndividuales(
    PDO $conexion,
    array $inscripcionIds,
    int $componenteId,
    int $momentoId
  ): array {
    if (!$inscripcionIds) {
      return [];
    }

    $placeholders = $this->construirMarcadores($inscripcionIds);

    $sql = <<<SQL
SELECT
  p.id_planificacion,
  p.fk_personal,
  p.fk_aula,
  p.fk_componente,
  p.fk_momento,
  p.tipo,
  p.estado,
  pi.fk_estudiante AS fk_inscripcion
FROM planificaciones p
INNER JOIN planificaciones_individuales pi ON pi.fk_planificacion = p.id_planificacion
WHERE p.fk_componente = :componente
  AND p.fk_momento = :momento
  AND p.tipo = 'individual'
  AND p.estado = 'activo'
  AND pi.fk_estudiante IN ({$placeholders})
SQL;

    $parametros = [
      ':componente' => $componenteId,
      ':momento' => $momentoId,
    ];
    $sentencia = $conexion->prepare($sql);
    $sentencia->execute(array_merge($parametros, $inscripcionIds));

    $planes = [];
    while ($fila = $sentencia->fetch(PDO::FETCH_ASSOC)) {
      $inscripcionId = (int) $fila['fk_inscripcion'];
      $planes[$inscripcionId] = [
        'id_planificacion' => (int) $fila['id_planificacion'],
        'fk_personal' => (int) $fila['fk_personal'],
        'fk_aula' => isset($fila['fk_aula']) ? (int) $fila['fk_aula'] : null,
        'fk_componente' => (int) $fila['fk_componente'],
        'fk_momento' => (int) $fila['fk_momento'],
        'tipo' => $fila['tipo'] ?? 'individual',
        'estado' => $fila['estado'] ?? null,
      ];
    }

    return $planes;
  }

  protected function obtenerIndicadoresPorPlanificacion(PDO $conexion, int $planificacionId): array
  {
    $sql = <<<SQL
SELECT
  i.id_indicador,
  i.fk_competencia,
  i.nombre_indicador,
  i.aspecto,
  i.orden,
  comp.id_competencia,
  comp.descripcion_competencia,
  comp.nombre_competencia
FROM plan_competencias pc
INNER JOIN competencias comp ON comp.id_competencia = pc.fk_competencias
INNER JOIN indicadores i ON i.fk_competencia = comp.id_competencia
WHERE pc.fk_planificacion = ?
  AND i.ocultar = 'no'
ORDER BY comp.id_competencia ASC, i.orden ASC, i.id_indicador ASC
SQL;

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$planificacionId]);

    $indicadores = [];
    while ($fila = $sentencia->fetch(PDO::FETCH_ASSOC)) {
      $indicadores[] = [
        'id_indicador' => (int) $fila['id_indicador'],
        'fk_competencia' => (int) $fila['fk_competencia'],
        'nombre_indicador' => $fila['nombre_indicador'] ?? '',
        'aspecto' => $fila['aspecto'] ?? null,
        'orden' => isset($fila['orden']) ? (int) $fila['orden'] : null,
        'competencia' => [
          'id_competencia' => (int) $fila['id_competencia'],
          'nombre' => (string) ($fila['nombre_competencia'] ?? ''),
          'descripcion' => $fila['descripcion_competencia'] ?? null,
        ],
      ];
    }

    return $indicadores;
  }

  protected function construirMatrizIndicadores(
    PDO $conexion,
    array $inscripciones,
    int $componenteId,
    int $momentoId,
    int $aulaId
  ): array {
    if (!$inscripciones) {
      return [
        'plan_general' => null,
        'planes_individuales' => [],
        'por_estudiante' => [],
        'indicadores_unicos' => [],
        'permitidos_por_estudiante' => [],
        'sin_plan' => [],
      ];
    }

    $inscripcionIds = array_column($inscripciones, 'id_inscripcion');
    $planGeneral = $this->obtenerPlanificacionGeneral($conexion, $aulaId, $componenteId, $momentoId);
    $planesIndividuales = $this->obtenerPlanificacionesIndividuales($conexion, $inscripcionIds, $componenteId, $momentoId);

    $indicadoresPlanGeneral = $planGeneral ? $this->obtenerIndicadoresPorPlanificacion($conexion, $planGeneral['id_planificacion']) : [];

    $indicadoresPorPlanIndividual = [];
    foreach ($planesIndividuales as $inscripcionId => $plan) {
      $indicadoresPorPlanIndividual[$inscripcionId] = $this->obtenerIndicadoresPorPlanificacion($conexion, $plan['id_planificacion']);
    }

    $porEstudiante = [];
    $permitidos = [];
    $unionIndicadores = [];
    $sinPlan = [];

    foreach ($inscripciones as $registro) {
      $inscripcionId = (int) $registro['id_inscripcion'];
      $estudianteId = (int) $registro['fk_estudiante'];

      if (isset($planesIndividuales[$inscripcionId])) {
        $plan = $planesIndividuales[$inscripcionId];
        $indicadores = $indicadoresPorPlanIndividual[$inscripcionId] ?? [];
        $origen = 'individual';
      } elseif ($planGeneral) {
        $plan = $planGeneral;
        $indicadores = $indicadoresPlanGeneral;
        $origen = 'general';
      } else {
        $plan = null;
        $indicadores = [];
        $origen = null;
      }

      if ($plan === null || !$indicadores) {
        $sinPlan[] = [
          'id_inscripcion' => $inscripcionId,
          'id_estudiante' => $estudianteId,
        ];
        continue;
      }

      $idsIndicadores = [];
      foreach ($indicadores as $indicador) {
        $indicadorId = (int) $indicador['id_indicador'];
        $idsIndicadores[] = $indicadorId;

        if (!isset($unionIndicadores[$indicadorId])) {
          $unionIndicadores[$indicadorId] = $indicador;
        }
      }

      $porEstudiante[$estudianteId] = [
        'planificacion' => [
          'id_planificacion' => (int) $plan['id_planificacion'],
          'tipo' => $plan['tipo'] ?? 'aula',
          'origen' => $origen,
          'estado' => $plan['estado'] ?? null,
          'id_inscripcion' => $inscripcionId,
        ],
        'indicadores' => $indicadores,
        'indicadores_ids' => $idsIndicadores,
        'id_inscripcion' => $inscripcionId,
      ];

      $permitidos[$estudianteId] = $idsIndicadores;
    }

    return [
      'plan_general' => $planGeneral,
      'planes_individuales' => $planesIndividuales,
      'por_estudiante' => $porEstudiante,
      'indicadores_unicos' => array_values($unionIndicadores),
      'permitidos_por_estudiante' => $permitidos,
      'sin_plan' => $sinPlan,
    ];
  }

  protected function obtenerEvaluacionesPrevias(
    PDO $conexion,
    int $componenteId,
    int $momentoId,
    array $estudianteIds,
    array $indicadorIds
  ): array {
    if (!$estudianteIds || !$indicadorIds) {
      return [];
    }

    $marcadoresEstudiantes = $this->construirMarcadores($estudianteIds);
    $marcadoresIndicadores = $this->construirMarcadores($indicadorIds);

    $sql = <<<SQL
SELECT
  e.id_evaluar,
  e.fk_estudiante,
  e.fk_indicador,
  e.fk_literal,
  l.literal
FROM evaluar e
LEFT JOIN literal l ON l.id_literal = e.fk_literal
WHERE e.fk_estudiante IN ({$marcadoresEstudiantes})
  AND e.fk_indicador IN ({$marcadoresIndicadores})
SQL;

    $parametros = array_merge($estudianteIds, $indicadorIds);
    $sentencia = $conexion->prepare($sql);
    $sentencia->execute($parametros);

    $evaluaciones = [];
    while ($fila = $sentencia->fetch(PDO::FETCH_ASSOC)) {
      $estudianteId = (int) $fila['fk_estudiante'];
      $indicadorId = (int) $fila['fk_indicador'];
      $literalId = (int) $fila['fk_literal'];
      $codigoLiteral = $fila['literal'] ?? null;

      $evaluaciones[$estudianteId][$indicadorId] = [
        'id_evaluar' => (int) $fila['id_evaluar'],
        'fk_estudiante' => $estudianteId,
        'fk_indicador' => $indicadorId,
        'fk_literal' => $literalId,
        'literal' => $codigoLiteral,
        'letra' => $codigoLiteral ? $this->letraDesdeLiteralCodigo($codigoLiteral) : null,
        'fk_planificacion' => null,
        'fk_inscripcion' => null,
        'fk_momento' => $momentoId,
        'fk_componente' => $componenteId,
        'registrado_por' => null,
        'actualizado_por' => null,
        'fecha_creacion' => null,
        'fecha_actualizacion' => null,
        'usuario_actualizo' => null,
      ];
    }

    return $evaluaciones;
  }

  protected function construirMarcadores(array $valores): string
  {
    return implode(',', array_fill(0, count($valores), '?'));
  }
}
