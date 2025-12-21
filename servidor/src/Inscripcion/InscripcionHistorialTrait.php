<?php

namespace Micodigo\Inscripcion;

use DateTimeImmutable;
use DateTimeInterface;
use PDO;

trait InscripcionHistorialTrait
{
  private function obtenerAnioEscolarPorId(PDO $conexion, int $anioId, ?array &$debugSql = null): ?array
  {
    $sql = 'SELECT id_anio_escolar,
                   fecha_inicio,
                   fecha_fin
            FROM anios_escolares
            WHERE id_anio_escolar = ?
            LIMIT 1';

    $this->agregarSqlDebug($debugSql, 'anio_escolar_por_id', $sql, ['anio_escolar_id' => $anioId]);

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$anioId]);
    $fila = $sentencia->fetch(PDO::FETCH_ASSOC);

    if (!$fila) {
      return null;
    }

    return [
      'id' => (int) $fila['id_anio_escolar'],
      'fecha_inicio' => $fila['fecha_inicio'],
      'fecha_fin' => $fila['fecha_fin'],
    ];
  }

  private function normalizarGradoCadena(?string $valor): ?int
  {
    if ($valor === null) {
      return null;
    }

    $texto = strtolower(trim($valor));
    if ($texto === '') {
      return null;
    }

    $texto = str_replace(['º', '°', '.', ','], ' ', $texto);
    $texto = preg_replace('/\s+/', ' ', $texto);

    if (preg_match('/^(\d+)/', $texto, $coincide)) {
      return (int) $coincide[1];
    }

    $mapa = [
      'educacion inicial' => 0,
      'educ. inicial' => 0,
      'educ inicial' => 0,
      'educacion preescolar' => 0,
      'preescolar' => 0,
      'inicial' => 0,
      'primer' => 1,
      'primero' => 1,
      '1er' => 1,
      'segundo' => 2,
      '2do' => 2,
      'tercer' => 3,
      'tercero' => 3,
      '3er' => 3,
      'cuarto' => 4,
      '4to' => 4,
      'quinto' => 5,
      '5to' => 5,
      'sexto' => 6,
      '6to' => 6,
    ];

    foreach ($mapa as $clave => $grado) {
      if (str_contains($texto, $clave)) {
        return $grado;
      }
    }

    return null;
  }

  private function obtenerUltimaInscripcionEstudiante(PDO $conexion, int $estudianteId, ?array &$debugSql = null): ?array
  {
    $sql = 'SELECT i.id_inscripcion,
                   i.fecha_inscripcion,
                   i.estado_inscripcion,
                   i.tipo_inscripcion,
                   a.fk_anio_escolar AS anio_id,
                   gs.grado,
                   anio.fecha_inicio AS anio_fecha_inicio,
                   anio.fecha_fin AS anio_fecha_fin
            FROM inscripciones i
            INNER JOIN aula a ON a.id_aula = i.fk_aula
            INNER JOIN grado_seccion gs ON gs.id_grado_seccion = a.fk_grado_seccion
            INNER JOIN anios_escolares anio ON anio.id_anio_escolar = a.fk_anio_escolar
            WHERE i.fk_estudiante = ?
            ORDER BY anio.fecha_inicio DESC, i.fecha_inscripcion DESC
            LIMIT 1';

    $this->agregarSqlDebug($debugSql, 'ultima_inscripcion_estudiante', $sql, ['estudiante_id' => $estudianteId]);

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$estudianteId]);
    $fila = $sentencia->fetch(PDO::FETCH_ASSOC);

    if (!$fila) {
      return null;
    }

    return [
      'id_inscripcion' => (int) $fila['id_inscripcion'],
      'fecha_inscripcion' => $fila['fecha_inscripcion'],
      'estado_inscripcion' => $fila['estado_inscripcion'],
      'tipo_inscripcion' => $fila['tipo_inscripcion'],
      'anio_id' => (int) $fila['anio_id'],
      'grado' => $this->normalizarGradoCadena($fila['grado']),
      'anio_fecha_inicio' => $fila['anio_fecha_inicio'],
      'anio_fecha_fin' => $fila['anio_fecha_fin'],
    ];
  }

  private function obtenerAprobacionesEstudiante(PDO $conexion, int $estudianteId, ?array &$debugSql = null): array
  {
    $sql = 'SELECT id_aprobo,
                   grado,
                   paso,
                   final
            FROM aprobo
            WHERE fk_estudiante = ?
            ORDER BY id_aprobo DESC';

    $this->agregarSqlDebug($debugSql, 'aprobados_estudiante', $sql, ['estudiante_id' => $estudianteId]);

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$estudianteId]);
    $registros = $sentencia->fetchAll(PDO::FETCH_ASSOC) ?: [];

    return array_map(function (array $fila): array {
      return [
        'id' => (int) $fila['id_aprobo'],
        'grado' => $this->normalizarGradoCadena($fila['grado']),
        'paso' => $fila['paso'] === 'si',
        'es_final' => $fila['final'] === 'si',
      ];
    }, $registros);
  }

  private function normalizarTipoDocumento(string $tipo): ?string
  {
    $valor = strtolower(trim($tipo));
    if ($valor === '') {
      return null;
    }

    if (str_contains($valor, 'prosec')) {
      return 'constancia_prosecucion';
    }

    if (str_contains($valor, 'certificado') && str_contains($valor, 'apr')) {
      return 'certificado_aprendizaje';
    }

    if (str_contains($valor, 'boleta')) {
      return 'boleta_promocion';
    }

    return null;
  }

  private function obtenerDocumentosAcademicosEstudiante(PDO $conexion, int $estudianteId, ?array &$debugSql = null): array
  {
    $sql = 'SELECT id_documento,
                   tipo_documento,
                   grado,
                   entregado
            FROM documentos_academicos
            WHERE fk_estudiante = ?';

    $this->agregarSqlDebug($debugSql, 'documentos_academicos_estudiante', $sql, ['estudiante_id' => $estudianteId]);

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$estudianteId]);
    $registros = $sentencia->fetchAll(PDO::FETCH_ASSOC) ?: [];

    $resultado = [];
    foreach ($registros as $fila) {
      if (($fila['entregado'] ?? 'no') !== 'si') {
        continue;
      }

      $clave = $this->normalizarTipoDocumento($fila['tipo_documento'] ?? '');
      if ($clave === null) {
        continue;
      }

      $grado = $this->normalizarGradoCadena($fila['grado'] ?? null);
      if (!isset($resultado[$clave]) || $grado > $resultado[$clave]) {
        $resultado[$clave] = $grado;
      }
    }

    return $resultado;
  }

  private function construirResumenHistorialEstudiante(
    PDO $conexion,
    int $estudianteId,
    array $anioActual,
    ?array &$debugSql = null,
    ?array &$debugMensajes = null
  ): array {
    if (!isset($anioActual['fecha_inicio']) || !isset($anioActual['fecha_fin'])) {
      $datosAnio = $this->obtenerAnioEscolarPorId($conexion, $anioActual['id'] ?? 0, $debugSql);
      if ($datosAnio !== null) {
        $anioActual = array_merge($datosAnio, $anioActual);
      }
    }

    $ultimaInscripcion = $this->obtenerUltimaInscripcionEstudiante($conexion, $estudianteId, $debugSql);
    $aprobaciones = $this->obtenerAprobacionesEstudiante($conexion, $estudianteId, $debugSql);
    $documentos = $this->obtenerDocumentosAcademicosEstudiante($conexion, $estudianteId, $debugSql);

    $maxGradoAprobado = null;
    foreach ($aprobaciones as $registro) {
      if ($registro['grado'] === null || !$registro['paso']) {
        continue;
      }
      if ($maxGradoAprobado === null || $registro['grado'] > $maxGradoAprobado) {
        $maxGradoAprobado = $registro['grado'];
      }
    }

    $maxGradoDocumentado = null;
    foreach ($documentos as $grado) {
      if ($grado === null) {
        continue;
      }
      if ($maxGradoDocumentado === null || $grado > $maxGradoDocumentado) {
        $maxGradoDocumentado = $grado;
      }
    }

    $aprobadoUltimo = false;
    $gradoUltimo = $ultimaInscripcion['grado'] ?? null;
    if ($gradoUltimo !== null) {
      foreach ($aprobaciones as $registro) {
        if ($registro['grado'] === $gradoUltimo && $registro['es_final'] && $registro['paso']) {
          $aprobadoUltimo = true;
          break;
        }
      }
    }

    $inicioActual = isset($anioActual['fecha_inicio']) ? DateTimeImmutable::createFromFormat('Y-m-d', $anioActual['fecha_inicio']) : null;
    $finUltimo = isset($ultimaInscripcion['anio_fecha_fin']) ? DateTimeImmutable::createFromFormat('Y-m-d', $ultimaInscripcion['anio_fecha_fin']) : null;

    $diasInactividad = null;
    if ($inicioActual instanceof DateTimeInterface && $finUltimo instanceof DateTimeInterface) {
      if ($finUltimo <= $inicioActual) {
        $diasInactividad = (int) $finUltimo->diff($inicioActual)->format('%a');
      } else {
        $diasInactividad = 0;
      }
    }

    $cursosAnioAnterior = false;
    if ($diasInactividad !== null) {
      $cursosAnioAnterior = $diasInactividad <= 370;
    }

    $inactividadProlongada = $diasInactividad !== null && $diasInactividad >= 730;

    if ($ultimaInscripcion !== null) {
      $this->agregarMensajeDebug(
        $debugMensajes,
        sprintf(
          'Última inscripción registrada: anio=%d grado=%s fecha=%s.',
          $ultimaInscripcion['anio_id'],
          $ultimaInscripcion['grado'] ?? 'N/A',
          $ultimaInscripcion['fecha_inscripcion'] ?? 'N/A'
        )
      );
    } else {
      $this->agregarMensajeDebug($debugMensajes, 'El estudiante no posee inscripciones previas registradas.');
    }

    return [
      'ultima_inscripcion' => $ultimaInscripcion,
      'aprobaciones' => $aprobaciones,
      'documentos' => $documentos,
      'max_grado_aprobado' => $maxGradoAprobado,
      'max_grado_documentado' => $maxGradoDocumentado,
      'aprobado_ultimo' => $aprobadoUltimo,
      'grado_ultimo' => $gradoUltimo,
      'dias_inactividad' => $diasInactividad,
      'inactividad_prolongada' => $inactividadProlongada,
      'curso_anio_anterior' => $cursosAnioAnterior,
    ];
  }
}
