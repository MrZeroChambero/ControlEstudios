<?php

namespace Micodigo\ImparticionClases;

use Exception;
use PDO;

trait GestionImparticionClases
{
  public static function crearImparticionBD($pdo, $datos)
  {
    try {
      $sql = "INSERT INTO imparticion_clases (fk_aula, fk_docente, fk_momento, fk_area_aprendizaje, tipo_docente) VALUES (?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $datos['fk_aula'] ?? null,
        $datos['fk_docente'] ?? null,
        $datos['fk_momento'] ?? null,
        $datos['fk_area_aprendizaje'] ?? null,
        $datos['tipo_docente'] ?? 'Integral'
      ]);
      return $pdo->lastInsertId();
    } catch (Exception $e) {
      throw new Exception("Error al crear impartición: " . $e->getMessage());
    }
  }

  public static function actualizarImparticionBD($pdo, $id, $datos)
  {
    try {
      $sql = "UPDATE imparticion_clases SET fk_aula = ?, fk_docente = ?, fk_momento = ?, fk_area_aprendizaje = ?, tipo_docente = ? WHERE id_imparticion_clases = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $datos['fk_aula'] ?? null,
        $datos['fk_docente'] ?? null,
        $datos['fk_momento'] ?? null,
        $datos['fk_area_aprendizaje'] ?? null,
        $datos['tipo_docente'] ?? 'Integral',
        $id
      ]);
    } catch (Exception $e) {
      throw new Exception("Error al actualizar impartición: " . $e->getMessage());
    }
  }

  public static function eliminarImparticionBD($pdo, $id)
  {
    try {
      $sql = "DELETE FROM imparticion_clases WHERE id_imparticion_clases = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      throw new Exception("Error al eliminar impartición: " . $e->getMessage());
    }
  }
}
