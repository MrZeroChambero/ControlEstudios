<?php

namespace Micodigo\Horarios;

use PDO;

trait HorariosConsultasTrait
{
  public function consultarHorarioPorId(PDO $conexion, int $idHorario): ?array
  {
    $sql = 'SELECT h.id_horario,
                   h.fk_aula,
                   h.fk_momento,
                   h.fk_componente,
                   h.fk_personal,
                   h.grupo,
                   h.dia_semana,
                   h.hora_inicio,
                   h.hora_fin,
                   a.fk_anio_escolar,
                   a.fk_grado_seccion,
                   a.estado AS estado_aula,
                   gs.grado,
                   gs.seccion,
                   m.nombre_momento,
                   m.estado_momento,
                   m.fk_anio_escolar AS momento_anio,
                   comp.nombre_componente,
                   comp.especialista,
                   per.estado AS estado_personal,
                   c.tipo AS tipo_funcion,
                   c.nombre_cargo AS nombre_funcion,
                   personas.primer_nombre,
                   personas.segundo_nombre,
                   personas.primer_apellido,
                   personas.segundo_apellido,
                   ae.fecha_inicio AS anio_fecha_inicio,
                   ae.fecha_fin AS anio_fecha_fin
                FROM horarios h
                INNER JOIN aula a ON a.id_aula = h.fk_aula
                LEFT JOIN anios_escolares ae ON ae.id_anio_escolar = a.fk_anio_escolar
            LEFT JOIN grado_seccion gs ON gs.id_grado_seccion = a.fk_grado_seccion
            INNER JOIN momentos m ON m.id_momento = h.fk_momento
            INNER JOIN componentes_aprendizaje comp ON comp.id_componente = h.fk_componente
            INNER JOIN personal per ON per.id_personal = h.fk_personal
            LEFT JOIN cargos c ON c.id_cargo = per.fk_cargo
            INNER JOIN personas ON personas.id_persona = per.fk_persona
            WHERE h.id_horario = ?
            LIMIT 1';

    $registro = $this->ejecutarConsultaUnica($conexion, $sql, [$idHorario]);
    if ($registro === null) {
      return null;
    }

    $registro['estudiantes'] = $this->consultarEstudiantesPorHorario($conexion, $idHorario);
    $registro['hora_inicio_texto'] = $this->formatearHora((float) $registro['hora_inicio']);
    $registro['hora_fin_texto'] = $this->formatearHora((float) $registro['hora_fin']);
    $registro['codigo_bloque'] = $this->obtenerCodigoBloqueDesdeHoras(
      (float) $registro['hora_inicio'],
      (float) $registro['hora_fin']
    );

    return $registro;
  }

  public function consultarHorarios(PDO $conexion, array $criterios = []): array
  {
    $parametros = [];
    $filtros = [];

    if (!empty($criterios['fk_aula'])) {
      $filtros[] = 'h.fk_aula = ?';
      $parametros[] = (int) $criterios['fk_aula'];
    }

    if (!empty($criterios['fk_momento'])) {
      $filtros[] = 'h.fk_momento = ?';
      $parametros[] = (int) $criterios['fk_momento'];
    }

    if (!empty($criterios['dia_semana'])) {
      $filtros[] = 'h.dia_semana = ?';
      $parametros[] = strtolower($criterios['dia_semana']);
    }

    $sql = 'SELECT h.id_horario,
                   h.fk_aula,
                   h.fk_momento,
                   h.fk_componente,
                   h.fk_personal,
                   h.grupo,
                   h.dia_semana,
                   h.hora_inicio,
                   h.hora_fin,
                   a.fk_anio_escolar,
                   a.fk_grado_seccion,
                   gs.grado,
                   gs.seccion,
                   m.nombre_momento,
                   m.estado_momento,
                   comp.nombre_componente,
                   comp.especialista,
                   per.estado AS estado_personal,
                   c.tipo AS tipo_funcion,
                   c.nombre_cargo AS nombre_funcion,
                   personas.primer_nombre,
                   personas.segundo_nombre,
                   personas.primer_apellido,
                   personas.segundo_apellido,
                   ae.fecha_inicio AS anio_fecha_inicio,
                   ae.fecha_fin AS anio_fecha_fin
                FROM horarios h
                INNER JOIN aula a ON a.id_aula = h.fk_aula
                LEFT JOIN anios_escolares ae ON ae.id_anio_escolar = a.fk_anio_escolar
            LEFT JOIN grado_seccion gs ON gs.id_grado_seccion = a.fk_grado_seccion
            INNER JOIN momentos m ON m.id_momento = h.fk_momento
            INNER JOIN componentes_aprendizaje comp ON comp.id_componente = h.fk_componente
            INNER JOIN personal per ON per.id_personal = h.fk_personal
            LEFT JOIN cargos c ON c.id_cargo = per.fk_cargo
            INNER JOIN personas ON personas.id_persona = per.fk_persona';

    if (!empty($filtros)) {
      $sql .= ' WHERE ' . implode(' AND ', $filtros);
    }

    $sql .= ' ORDER BY FIELD(h.dia_semana, "lunes","martes","miercoles","jueves","viernes"), h.hora_inicio ASC';

    $registros = $this->ejecutarConsulta($conexion, $sql, $parametros);

    if (empty($registros)) {
      return [];
    }

    $ids = array_map(fn($fila) => (int) $fila['id_horario'], $registros);
    $estudiantesPorHorario = $this->consultarEstudiantesPorHorarios($conexion, $ids);

    return array_map(function (array $fila) use ($estudiantesPorHorario) {
      $id = (int) $fila['id_horario'];
      $fila['estudiantes'] = $estudiantesPorHorario[$id] ?? [];
      $fila['hora_inicio_texto'] = $this->formatearHora((float) $fila['hora_inicio']);
      $fila['hora_fin_texto'] = $this->formatearHora((float) $fila['hora_fin']);
      $fila['codigo_bloque'] = $this->obtenerCodigoBloqueDesdeHoras(
        (float) $fila['hora_inicio'],
        (float) $fila['hora_fin']
      );
      return $fila;
    }, $registros);
  }

  protected function consultarEstudiantesPorHorario(PDO $conexion, int $idHorario): array
  {
    $sql = 'SELECT ge.fk_estudiante AS id_estudiante,
                   p.primer_nombre,
                   p.segundo_nombre,
                   p.primer_apellido,
                   p.segundo_apellido,
                   e.cedula_escolar
            FROM grupos_estudiantiles ge
            INNER JOIN estudiantes e ON e.id_estudiante = ge.fk_estudiante
            INNER JOIN personas p ON p.id_persona = e.id_persona
            WHERE ge.fk_horario = ?
            ORDER BY p.primer_apellido, p.primer_nombre';

    $registros = $this->ejecutarConsulta($conexion, $sql, [$idHorario]);

    return array_map(function (array $fila) {
      return [
        'id_estudiante' => (int) $fila['id_estudiante'],
        'nombre' => trim($fila['primer_nombre'] . ' ' . ($fila['segundo_nombre'] ?? '') . ' ' . $fila['primer_apellido'] . ' ' . ($fila['segundo_apellido'] ?? '')),
        'cedula_escolar' => $fila['cedula_escolar'],
      ];
    }, $registros);
  }

  protected function consultarEstudiantesPorHorarios(PDO $conexion, array $ids): array
  {
    if (empty($ids)) {
      return [];
    }

    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    $sql = 'SELECT ge.fk_horario,
                   ge.fk_estudiante,
                   p.primer_nombre,
                   p.primer_apellido,
                   e.cedula_escolar
            FROM grupos_estudiantiles ge
            INNER JOIN estudiantes e ON e.id_estudiante = ge.fk_estudiante
            INNER JOIN personas p ON p.id_persona = e.id_persona
            WHERE ge.fk_horario IN (' . $placeholders . ')';

    $registros = $this->ejecutarConsulta($conexion, $sql, $ids);

    $agrupado = [];
    foreach ($registros as $fila) {
      $idHorario = (int) $fila['fk_horario'];
      if (!isset($agrupado[$idHorario])) {
        $agrupado[$idHorario] = [];
      }

      $agrupado[$idHorario][] = [
        'id_estudiante' => (int) $fila['fk_estudiante'],
        'nombre' => trim($fila['primer_nombre'] . ' ' . $fila['primer_apellido']),
        'cedula_escolar' => $fila['cedula_escolar'],
      ];
    }

    return $agrupado;
  }

  protected function consultarAulaActiva(PDO $conexion, int $idAula): ?array
  {
    $sql = 'SELECT a.id_aula,
                   a.fk_anio_escolar,
                   a.fk_grado_seccion,
                   a.estado,
                   gs.grado,
                   gs.seccion
            FROM aula a
            LEFT JOIN grado_seccion gs ON gs.id_grado_seccion = a.fk_grado_seccion
            WHERE a.id_aula = ?
            LIMIT 1';

    $aula = $this->ejecutarConsultaUnica($conexion, $sql, [$idAula]);
    if ($aula === null) {
      return null;
    }

    if (($aula['estado'] ?? null) !== 'activo') {
      return null;
    }

    return $aula;
  }

  protected function consultarMomentoActivo(PDO $conexion, int $idMomento): ?array
  {
    $sql = 'SELECT m.id_momento,
                   m.fk_anio_escolar,
                   m.nombre_momento,
                   m.estado_momento,
                   m.fecha_inicio,
                   m.fecha_fin
            FROM momentos m
            WHERE m.id_momento = ?
            LIMIT 1';

    $momento = $this->ejecutarConsultaUnica($conexion, $sql, [$idMomento]);
    if ($momento === null) {
      return null;
    }

    $estado = strtolower($momento['estado_momento'] ?? '');
    $permitidos = ['activo', 'pendiente', 'planificado', 'incompleto'];
    if (!in_array($estado, $permitidos, true)) {
      return null;
    }

    return $momento;
  }

  protected function consultarAsignacionDocente(PDO $conexion, int $aulaId, int $momentoId, int $componenteId, int $personalId): ?array
  {
    $sql = 'SELECT i.id_imparte,
                   i.tipo_docente,
                   i.clases_totales,
                   per.estado AS estado_personal,
                   c.tipo AS tipo_funcion,
                   c.nombre_cargo
            FROM imparte i
            INNER JOIN personal per ON per.id_personal = i.fk_personal
            LEFT JOIN cargos c ON c.id_cargo = per.fk_cargo
            WHERE i.fk_aula = ?
              AND i.fk_momento = ?
              AND i.fk_componente = ?
              AND i.fk_personal = ?
            LIMIT 1';

    return $this->ejecutarConsultaUnica($conexion, $sql, [$aulaId, $momentoId, $componenteId, $personalId]);
  }

  protected function existeHorarioEspecialistaGrupo(PDO $conexion, int $aulaId, int $componenteId, string $diaSemana, ?int $ignorarId): bool
  {
    $parametros = [$aulaId, $componenteId, $diaSemana];

    $sql = 'SELECT 1 FROM horarios
            WHERE fk_aula = ?
              AND fk_componente = ?
              AND dia_semana = ?
              AND grupo = "completo"';

    if ($ignorarId !== null) {
      $sql .= ' AND id_horario <> ?';
      $parametros[] = $ignorarId;
    }

    $sql .= ' LIMIT 1';

    $resultado = $this->ejecutarConsultaUnica($conexion, $sql, $parametros);
    return $resultado !== null;
  }

  protected function existeHorarioEspecialistaSubgrupo(PDO $conexion, int $aulaId, int $componenteId, ?int $ignorarId): bool
  {
    $parametros = [$aulaId, $componenteId];

    $sql = 'SELECT 1 FROM horarios
            WHERE fk_aula = ?
              AND fk_componente = ?
              AND grupo = "subgrupo"';

    if ($ignorarId !== null) {
      $sql .= ' AND id_horario <> ?';
      $parametros[] = $ignorarId;
    }

    $sql .= ' LIMIT 1';

    $resultado = $this->ejecutarConsultaUnica($conexion, $sql, $parametros);
    return $resultado !== null;
  }

  protected function existeConflictoAula(PDO $conexion, int $aulaId, string $dia, float $inicio, float $fin, ?int $ignorarId): bool
  {
    $parametros = [$aulaId, $dia, $fin, $inicio];

    $sql = 'SELECT 1 FROM horarios
            WHERE fk_aula = ?
              AND dia_semana = ?
              AND hora_inicio < ?
              AND hora_fin > ?';

    if ($ignorarId !== null) {
      $sql .= ' AND id_horario <> ?';
      $parametros[] = $ignorarId;
    }

    $sql .= ' LIMIT 1';

    $registro = $this->ejecutarConsultaUnica($conexion, $sql, $parametros);
    return $registro !== null;
  }

  protected function existeConflictoPersonal(PDO $conexion, int $personalId, string $dia, float $inicio, float $fin, ?int $ignorarId): bool
  {
    $parametros = [$personalId, $dia, $fin, $inicio];

    $sql = 'SELECT 1 FROM horarios
            WHERE fk_personal = ?
              AND dia_semana = ?
              AND hora_inicio < ?
              AND hora_fin > ?';

    if ($ignorarId !== null) {
      $sql .= ' AND id_horario <> ?';
      $parametros[] = $ignorarId;
    }

    $sql .= ' LIMIT 1';

    $registro = $this->ejecutarConsultaUnica($conexion, $sql, $parametros);
    return $registro !== null;
  }

  protected function validarEstudiantesEnAula(PDO $conexion, int $aulaId, array $estudiantes): array
  {
    if (empty($estudiantes)) {
      return [];
    }

    $placeholders = implode(',', array_fill(0, count($estudiantes), '?'));
    $parametros = array_merge([(int) $aulaId], $estudiantes);

    $sql = 'SELECT ins.fk_estudiante
            FROM inscripciones ins
            WHERE ins.fk_aula = ?
              AND ins.estado_inscripcion = "activo"
              AND ins.fk_estudiante IN (' . $placeholders . ')';

    $registros = $this->ejecutarConsulta($conexion, $sql, $parametros);
    $encontrados = array_map(fn($fila) => (int) $fila['fk_estudiante'], $registros);

    $faltantes = array_diff($estudiantes, $encontrados);
    if (empty($faltantes)) {
      return [];
    }

    return array_map('strval', $faltantes);
  }

  protected function buscarConflictosEstudiantes(PDO $conexion, array $estudiantes, string $dia, float $inicio, float $fin, ?int $ignorarId): array
  {
    if (empty($estudiantes)) {
      return [];
    }

    $placeholders = implode(',', array_fill(0, count($estudiantes), '?'));
    $parametros = array_merge($estudiantes, [$dia, $fin, $inicio]);

    $sql = 'SELECT DISTINCT ge.fk_estudiante,
                            p.primer_nombre,
                            p.primer_apellido
            FROM grupos_estudiantiles ge
            INNER JOIN horarios h ON h.id_horario = ge.fk_horario
            INNER JOIN estudiantes e ON e.id_estudiante = ge.fk_estudiante
            INNER JOIN personas p ON p.id_persona = e.id_persona
            WHERE ge.fk_estudiante IN (' . $placeholders . ')
              AND h.dia_semana = ?
              AND h.hora_inicio < ?
              AND h.hora_fin > ?';

    if ($ignorarId !== null) {
      $sql .= ' AND h.id_horario <> ?';
      $parametros[] = $ignorarId;
    }

    $conflictos = $this->ejecutarConsulta($conexion, $sql, $parametros);

    if (empty($conflictos)) {
      return [];
    }

    return array_map(function (array $fila) {
      return trim($fila['primer_nombre'] . ' ' . $fila['primer_apellido']);
    }, $conflictos);
  }

  protected function consultarBloquePorCodigo(PDO $conexion, int $aulaId, string $diaSemana, string $codigoBloque, ?int $ignorarId): ?array
  {
    $horas = $this->obtenerHorasDecimalDesdeCodigo($codigoBloque);
    if ($horas === null) {
      return null;
    }

    $parametros = [$aulaId, $diaSemana, $horas['inicio'], $horas['fin']];

    $sql = 'SELECT h.id_horario, h.fk_componente, h.fk_personal, h.grupo
            FROM horarios h
            WHERE h.fk_aula = ?
              AND h.dia_semana = ?
              AND ABS(h.hora_inicio - ?) < 0.001
              AND ABS(h.hora_fin - ?) < 0.001';

    if ($ignorarId !== null) {
      $sql .= ' AND h.id_horario <> ?';
      $parametros[] = $ignorarId;
    }

    $sql .= ' LIMIT 1';

    return $this->ejecutarConsultaUnica($conexion, $sql, $parametros);
  }
}
