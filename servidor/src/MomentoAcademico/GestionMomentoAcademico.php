<?php

namespace Micodigo\MomentoAcademico;

use Exception;
use PDO;

trait GestionMomentoAcademico
{
  public static function crearMomentoBD($pdo, $datos)
  {
    try {
      $sql = "INSERT INTO momentos_academicos (fk_anio_escolar, nombre, orden, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $datos['fk_anio_escolar'] ?? null,
        $datos['nombre'] ?? null,
        $datos['orden'] ?? null,
        $datos['fecha_inicio'] ?? null,
        $datos['fecha_fin'] ?? null,
        $datos['estado'] ?? 'activo'
      ]);
      return $pdo->lastInsertId();
    } catch (Exception $e) {
      throw new Exception("Error al crear momento académico: " . $e->getMessage());
    }
  }

  public static function actualizarMomentoBD($pdo, $id, $datos)
  {
    try {
      $sql = "UPDATE momentos_academicos SET fk_anio_escolar = ?, nombre = ?, orden = ?, fecha_inicio = ?, fecha_fin = ?, estado = ? WHERE id_momento = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $datos['fk_anio_escolar'] ?? null,
        $datos['nombre'] ?? null,
        $datos['orden'] ?? null,
        $datos['fecha_inicio'] ?? null,
        $datos['fecha_fin'] ?? null,
        $datos['estado'] ?? 'activo',
        $id
      ]);
    } catch (Exception $e) {
      throw new Exception("Error al actualizar momento académico: " . $e->getMessage());
    }
  }

  public static function eliminarMomentoBD($pdo, $id)
  {
    try {
      $sql = "DELETE FROM momentos_academicos WHERE id_momento = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      throw new Exception("Error al eliminar momento académico: " . $e->getMessage());
    }
  }
}
