<?php

namespace Micodigo\Inscripcion;

use PDO;
use RuntimeException;

trait InscripcionCuposTrait
{
  use InscripcionFormatoNombreTrait;

  private function listarAulasConDisponibilidad(PDO $conexion, int $anioId): array
  {
    $sql = 'SELECT a.id_aula,
                   a.cupos,
                   a.estado,
                   gs.grado,
                   gs.seccion,
                   doc.docente_id,
                   per.estado AS estado_personal,
                   p.estado AS estado_persona,
                   p.primer_nombre,
                   p.segundo_nombre,
                   p.primer_apellido,
                   p.segundo_apellido,
                   COUNT(ins.id_inscripcion) AS ocupados
            FROM aula a
            INNER JOIN grado_seccion gs ON gs.id_grado_seccion = a.fk_grado_seccion
            LEFT JOIN (
              SELECT fk_aula, MIN(fk_personal) AS docente_id
              FROM imparte
              WHERE tipo_docente = "aula"
              GROUP BY fk_aula
            ) doc ON doc.fk_aula = a.id_aula
            LEFT JOIN personal per ON per.id_personal = doc.docente_id
            LEFT JOIN personas p ON p.id_persona = per.fk_persona
            LEFT JOIN inscripciones ins ON ins.fk_aula = a.id_aula
              AND ins.estado_inscripcion IN ("activo", "en_proceso")
            WHERE a.fk_anio_escolar = ?
              AND a.estado = "activo"
            GROUP BY a.id_aula,
                     a.cupos,
                     a.estado,
                     gs.grado,
                     gs.seccion,
                     doc.docente_id,
                     per.estado,
                     p.estado,
                     p.primer_nombre,
                     p.segundo_nombre,
                     p.primer_apellido,
                     p.segundo_apellido
            ORDER BY gs.grado, gs.seccion';

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$anioId]);

    $lista = [];
    while ($fila = $sentencia->fetch(PDO::FETCH_ASSOC)) {
      $cupos = $fila['cupos'] !== null ? (int) $fila['cupos'] : 0;
      $ocupados = (int) $fila['ocupados'];
      $disponibles = max(0, $cupos - $ocupados);
      $docenteActivo = $fila['docente_id'] !== null
        && $fila['estado_personal'] === 'activo'
        && $fila['estado_persona'] === 'activo';

      $lista[] = [
        'id_aula' => (int) $fila['id_aula'],
        'grado' => (int) $fila['grado'],
        'seccion' => $fila['seccion'],
        'cupos' => $cupos,
        'ocupados' => $ocupados,
        'disponibles' => $disponibles,
        'docente' => $docenteActivo ? [
          'id' => (int) $fila['docente_id'],
          'nombre' => $this->construirNombreCompleto($fila),
        ] : null,
      ];
    }

    return $lista;
  }

  private function obtenerDetalleAulaDisponible(PDO $conexion, int $anioId, int $aulaId): array
  {
    $sql = 'SELECT a.id_aula,
                   a.cupos,
                   a.estado,
                   gs.grado,
                   gs.seccion,
                   doc.docente_id,
                   per.estado AS estado_personal,
                   p.estado AS estado_persona,
                   p.primer_nombre,
                   p.segundo_nombre,
                   p.primer_apellido,
                   p.segundo_apellido
            FROM aula a
            INNER JOIN grado_seccion gs ON gs.id_grado_seccion = a.fk_grado_seccion
            LEFT JOIN (
              SELECT fk_aula, MIN(fk_personal) AS docente_id
              FROM imparte
              WHERE tipo_docente = "aula"
              GROUP BY fk_aula
            ) doc ON doc.fk_aula = a.id_aula
            LEFT JOIN personal per ON per.id_personal = doc.docente_id
            LEFT JOIN personas p ON p.id_persona = per.fk_persona
            WHERE a.id_aula = ?
              AND a.fk_anio_escolar = ?
              AND a.estado = "activo"
            LIMIT 1';

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$aulaId, $anioId]);
    $fila = $sentencia->fetch(PDO::FETCH_ASSOC);

    if (!$fila) {
      throw new RuntimeException('El aula seleccionada no está disponible en el año escolar activo.');
    }

    $docenteActivo = $fila['docente_id'] !== null
      && $fila['estado_personal'] === 'activo'
      && $fila['estado_persona'] === 'activo';

    return [
      'id_aula' => (int) $fila['id_aula'],
      'grado' => (int) $fila['grado'],
      'seccion' => $fila['seccion'],
      'cupos' => $fila['cupos'] !== null ? (int) $fila['cupos'] : 0,
      'docente' => $docenteActivo ? [
        'id' => (int) $fila['docente_id'],
        'nombre' => $this->construirNombreCompleto($fila),
      ] : null,
    ];
  }

  private function verificarDisponibilidadCupo(PDO $conexion, int $aulaId, int $anioId, bool $bloquear = false): array
  {
    $lock = $bloquear ? ' FOR UPDATE' : '';
    $sql = 'SELECT id_aula, cupos
            FROM aula
            WHERE id_aula = ?
              AND fk_anio_escolar = ?
              AND estado = "activo"' . $lock;

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$aulaId, $anioId]);
    $fila = $sentencia->fetch(PDO::FETCH_ASSOC);

    if (!$fila) {
      throw new RuntimeException('El aula indicada no está disponible.');
    }

    $cupos = $fila['cupos'] !== null ? (int) $fila['cupos'] : 0;
    if ($cupos <= 0) {
      throw new RuntimeException('El aula seleccionada no tiene cupos configurados.');
    }

    $ocupados = $this->contarInscripcionesActivas($conexion, $aulaId, $bloquear);
    $disponibles = $cupos - $ocupados;
    if ($disponibles <= 0) {
      throw new RuntimeException('No hay cupos disponibles en la sección seleccionada.');
    }

    $detalle = $this->obtenerDetalleDocenteAula($conexion, $aulaId);
    if ($detalle['docente'] === null) {
      throw new RuntimeException('No es posible inscribir: la sección no tiene docente asignado.');
    }

    return [
      'cupos' => $cupos,
      'ocupados' => $ocupados,
      'disponibles' => $disponibles,
      'docente_id' => $detalle['docente']['id'],
      'docente_nombre' => $detalle['docente']['nombre'],
      'grado' => $detalle['grado'],
      'seccion' => $detalle['seccion'],
    ];
  }

  private function contarInscripcionesActivas(PDO $conexion, int $aulaId, bool $bloquear): int
  {
    if ($bloquear) {
      $sql = 'SELECT id_inscripcion
              FROM inscripciones
              WHERE fk_aula = ?
                AND estado_inscripcion IN ("activo", "en_proceso")
              FOR UPDATE';
      $sentencia = $conexion->prepare($sql);
      $sentencia->execute([$aulaId]);
      $ids = $sentencia->fetchAll(PDO::FETCH_COLUMN) ?: [];
      return count($ids);
    }

    $sql = 'SELECT COUNT(*)
            FROM inscripciones
            WHERE fk_aula = ?
              AND estado_inscripcion IN ("activo", "en_proceso")';
    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$aulaId]);
    return (int) $sentencia->fetchColumn();
  }

  private function obtenerDetalleDocenteAula(PDO $conexion, int $aulaId): array
  {
    $sql = 'SELECT gs.grado,
                   gs.seccion,
                   doc.docente_id,
                   per.estado AS estado_personal,
                   p.estado AS estado_persona,
                   p.primer_nombre,
                   p.segundo_nombre,
                   p.primer_apellido,
                   p.segundo_apellido
            FROM aula a
            INNER JOIN grado_seccion gs ON gs.id_grado_seccion = a.fk_grado_seccion
            LEFT JOIN (
              SELECT fk_aula, MIN(fk_personal) AS docente_id
              FROM imparte
              WHERE tipo_docente = "aula"
              GROUP BY fk_aula
            ) doc ON doc.fk_aula = a.id_aula
            LEFT JOIN personal per ON per.id_personal = doc.docente_id
            LEFT JOIN personas p ON p.id_persona = per.fk_persona
            WHERE a.id_aula = ?
            LIMIT 1';

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$aulaId]);
    $fila = $sentencia->fetch(PDO::FETCH_ASSOC);

    if (!$fila) {
      throw new RuntimeException('No se pudo obtener la información del aula.');
    }

    $docenteActivo = $fila['docente_id'] !== null
      && $fila['estado_personal'] === 'activo'
      && $fila['estado_persona'] === 'activo';

    return [
      'grado' => (int) $fila['grado'],
      'seccion' => $fila['seccion'],
      'docente' => $docenteActivo ? [
        'id' => (int) $fila['docente_id'],
        'nombre' => $this->construirNombreCompleto($fila),
      ] : null,
    ];
  }
}
