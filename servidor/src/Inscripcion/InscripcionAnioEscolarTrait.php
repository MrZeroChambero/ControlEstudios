<?php

namespace Micodigo\Inscripcion;

use PDO;

trait InscripcionAnioEscolarTrait
{
  private function validarAnioEscolar(PDO $conexion, ?array &$debugSql = null, ?array &$debugMensajes = null): array
  {
    $anio = $this->obtenerAnioEscolarActivo($conexion, $debugSql);
    if ($anio === null) {
      $this->agregarMensajeDebug($debugMensajes, 'No existe un año escolar activo.');
      return [
        'valido' => false,
        'anio' => null,
        'motivos' => ['No existe un año escolar activo.'],
        'faltantes_docentes' => [],
      ];
    }

    $faltantes = $this->obtenerAulasSinDocenteAsignado($conexion, $anio['id'], $debugSql);
    if (!empty($faltantes)) {
      $this->agregarMensajeDebug($debugMensajes, 'Se detectaron aulas activas sin docente asignado.');
      return [
        'valido' => false,
        'anio' => $anio,
        'motivos' => ['Hay secciones activas sin docente de aula asignado.'],
        'faltantes_docentes' => $faltantes,
      ];
    }

    $this->agregarMensajeDebug($debugMensajes, 'Año escolar activo y todas las aulas activas cuentan con docente de aula.');
    return [
      'valido' => true,
      'anio' => $anio,
      'motivos' => [],
      'faltantes_docentes' => [],
    ];
  }

  private function obtenerAnioEscolarActivo(PDO $conexion, ?array &$debugSql = null): ?array
  {
    $sql = 'SELECT id_anio_escolar, fecha_inicio, fecha_fin, limite_inscripcion
            FROM anios_escolares
            WHERE estado = "activo"
            ORDER BY fecha_inicio DESC
            LIMIT 1';

    $this->agregarSqlDebug($debugSql, 'anio_escolar_activo', $sql);

    $sentencia = $conexion->query($sql);
    $fila = $sentencia !== false ? $sentencia->fetch(PDO::FETCH_ASSOC) : false;
    if (!$fila) {
      return null;
    }

    return [
      'id' => (int) $fila['id_anio_escolar'],
      'fecha_inicio' => $fila['fecha_inicio'],
      'fecha_fin' => $fila['fecha_fin'],
      'fecha_limite_inscripcion' => $fila['limite_inscripcion'] ?? $fila['fecha_inicio'],
    ];
  }

  private function obtenerAulasSinDocenteAsignado(PDO $conexion, int $anioId, ?array &$debugSql = null): array
  {
    $sql = 'SELECT a.id_aula, gs.grado, gs.seccion
            FROM aula a
            INNER JOIN grado_seccion gs ON gs.id_grado_seccion = a.fk_grado_seccion
            LEFT JOIN (
              SELECT fk_aula, MIN(fk_personal) AS docente_id
              FROM imparte
              WHERE tipo_docente = "aula"
              GROUP BY fk_aula
            ) doc ON doc.fk_aula = a.id_aula
            WHERE a.fk_anio_escolar = ?
              AND a.estado = "activo"
              AND doc.docente_id IS NULL';

    $this->agregarSqlDebug($debugSql, 'aulas_sin_docente', $sql, ['anio_escolar_id' => $anioId]);

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$anioId]);

    $faltantes = [];
    while ($fila = $sentencia->fetch(PDO::FETCH_ASSOC)) {
      $faltantes[] = [
        'id_aula' => (int) $fila['id_aula'],
        'grado' => (int) $fila['grado'],
        'seccion' => $fila['seccion'],
      ];
    }

    return $faltantes;
  }
}
