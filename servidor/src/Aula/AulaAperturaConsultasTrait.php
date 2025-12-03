<?php

namespace Micodigo\Aula;

use PDO;

trait AulaAperturaConsultasTrait
{
  protected function obtenerAnioActivoOIncompleto(PDO $conexion): ?array
  {
    $sql = "SELECT *
            FROM anios_escolares
            WHERE estado IN ('activo', 'incompleto')
            ORDER BY FIELD(estado, 'activo', 'incompleto'), fecha_inicio DESC
            LIMIT 1";

    $sentencia = $conexion->query($sql);
    $fila = $sentencia !== false ? $sentencia->fetch(PDO::FETCH_ASSOC) : false;

    return $fila ?: null;
  }

  protected function obtenerAnioPorId(PDO $conexion, int $idAnio): ?array
  {
    $sql = "SELECT * FROM anios_escolares WHERE id_anio_escolar = ? LIMIT 1";
    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$idAnio]);

    $fila = $sentencia->fetch(PDO::FETCH_ASSOC);
    return $fila ?: null;
  }

  protected function obtenerCatalogoGrados(PDO $conexion): array
  {
    $sql = "SELECT id_grado_seccion, grado, seccion
            FROM grado_seccion
            ORDER BY grado, seccion";

    $sentencia = $conexion->query($sql);
    $catalogo = [];

    if ($sentencia === false) {
      return $catalogo;
    }

    while ($fila = $sentencia->fetch(PDO::FETCH_ASSOC)) {
      $grado = $this->normalizarClaveGrado($fila['grado']);
      $catalogo[$grado] ??= [];
      $catalogo[$grado][] = [
        'id_grado_seccion' => (int) $fila['id_grado_seccion'],
        'grado' => $grado,
        'seccion' => $fila['seccion'],
        'orden' => $this->obtenerOrdenDesdeSeccion($fila['seccion']),
      ];
    }

    foreach ($catalogo as &$secciones) {
      usort($secciones, fn(array $a, array $b): int => $a['orden'] <=> $b['orden']);
    }

    return $catalogo;
  }

  protected function obtenerAulasPorAnio(PDO $conexion, int $idAnio): array
  {
    $sql = "SELECT a.id_aula,
                   a.fk_anio_escolar,
                   a.fk_grado_seccion,
                   a.cupos,
                   a.estado,
                   gs.grado,
                   gs.seccion,
                   (
                     SELECT COUNT(*)
                     FROM inscripciones i
                     WHERE i.fk_aula = a.id_aula
                   ) AS total_inscripciones
            FROM aula a
            INNER JOIN grado_seccion gs ON gs.id_grado_seccion = a.fk_grado_seccion
            WHERE a.fk_anio_escolar = ?
            ORDER BY gs.grado, gs.seccion";

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$idAnio]);

    $registros = $sentencia->fetchAll(PDO::FETCH_ASSOC);
    return array_map(function (array $fila): array {
      $fila['id_aula'] = (int) $fila['id_aula'];
      $fila['fk_anio_escolar'] = (int) $fila['fk_anio_escolar'];
      $fila['fk_grado_seccion'] = (int) $fila['fk_grado_seccion'];
      $fila['cupos'] = $fila['cupos'] !== null ? (int) $fila['cupos'] : null;
      $fila['total_inscripciones'] = (int) $fila['total_inscripciones'];
      $fila['grado'] = $this->normalizarClaveGrado($fila['grado']);
      $fila['orden'] = $this->obtenerOrdenDesdeSeccion($fila['seccion']);
      return $fila;
    }, $registros);
  }

  protected function obtenerAulaPorId(PDO $conexion, int $idAula): ?array
  {
    $sql = "SELECT a.id_aula,
                   a.fk_anio_escolar,
                   a.fk_grado_seccion,
                   a.cupos,
                   a.estado,
                   gs.grado,
                   gs.seccion,
                   (
                     SELECT COUNT(*)
                     FROM inscripciones i
                     WHERE i.fk_aula = a.id_aula
                   ) AS total_inscripciones
            FROM aula a
            INNER JOIN grado_seccion gs ON gs.id_grado_seccion = a.fk_grado_seccion
            WHERE a.id_aula = ?
            LIMIT 1";

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$idAula]);

    $fila = $sentencia->fetch(PDO::FETCH_ASSOC);
    if (!$fila) {
      return null;
    }

    $fila['id_aula'] = (int) $fila['id_aula'];
    $fila['fk_anio_escolar'] = (int) $fila['fk_anio_escolar'];
    $fila['fk_grado_seccion'] = (int) $fila['fk_grado_seccion'];
    $fila['cupos'] = $fila['cupos'] !== null ? (int) $fila['cupos'] : null;
    $fila['total_inscripciones'] = (int) $fila['total_inscripciones'];
    $fila['grado'] = $this->normalizarClaveGrado($fila['grado']);
    $fila['orden'] = $this->obtenerOrdenDesdeSeccion($fila['seccion']);

    return $fila;
  }

  protected function buscarAulaPorGradoSeccion(PDO $conexion, int $anioId, int $gradoSeccionId): ?array
  {
    $sql = "SELECT a.id_aula,
                   a.fk_anio_escolar,
                   a.fk_grado_seccion,
                   a.cupos,
                   a.estado
            FROM aula a
            WHERE a.fk_anio_escolar = ? AND a.fk_grado_seccion = ?
            LIMIT 1";

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$anioId, $gradoSeccionId]);

    $fila = $sentencia->fetch(PDO::FETCH_ASSOC);
    if (!$fila) {
      return null;
    }

    $fila['id_aula'] = (int) $fila['id_aula'];
    $fila['fk_anio_escolar'] = (int) $fila['fk_anio_escolar'];
    $fila['fk_grado_seccion'] = (int) $fila['fk_grado_seccion'];
    $fila['cupos'] = $fila['cupos'] !== null ? (int) $fila['cupos'] : null;

    return $fila;
  }

  protected function contarInscripciones(PDO $conexion, int $idAula): int
  {
    $sql = "SELECT COUNT(*) FROM inscripciones WHERE fk_aula = ?";
    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$idAula]);

    return (int) $sentencia->fetchColumn();
  }
}
