<?php

namespace Micodigo\GradosSecciones;

use Exception;
use PDO;

trait GestionGradosSecciones
{
  public static function crearGradoSeccionBD($pdo, $datos)
  {
    try {
      $sql = "INSERT INTO grados_secciones (grado, seccion, cupos, estado) VALUES (?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $datos['grado'] ?? null,
        $datos['seccion'] ?? null,
        $datos['cupos'] ?? null,
        $datos['estado'] ?? 'activo'
      ]);
      return $pdo->lastInsertId();
    } catch (Exception $e) {
      throw new Exception("Error al crear grado-sección: " . $e->getMessage());
    }
  }

  public static function actualizarGradoSeccionBD($pdo, $id, $datos)
  {
    try {
      $sql = "UPDATE grados_secciones SET grado = ?, seccion = ?, cupos = ?, estado = ? WHERE id_grado_seccion = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $datos['grado'] ?? null,
        $datos['seccion'] ?? null,
        $datos['cupos'] ?? null,
        $datos['estado'] ?? 'activo',
        $id
      ]);
    } catch (Exception $e) {
      throw new Exception("Error al actualizar grado-sección: " . $e->getMessage());
    }
  }

  public static function eliminarGradoSeccionBD($pdo, $id)
  {
    try {
      $sql = "DELETE FROM grados_secciones WHERE id_grado_seccion = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      throw new Exception("Error al eliminar grado-sección: " . $e->getMessage());
    }
  }
}
