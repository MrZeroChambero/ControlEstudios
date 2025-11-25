<?php

namespace Micodigo\Habilidades;

use Exception;
use PDO;

trait GestionHabilidades
{
  public static function crearHabilidadBD(PDO $pdo, int $fk_representante, string $nombre)
  {
    try {
      $stmt = $pdo->prepare('INSERT INTO habilidades (fk_representante, nombre_habilidad) VALUES (?, ?)');
      $stmt->execute([$fk_representante, $nombre]);
      return $pdo->lastInsertId();
    } catch (Exception $e) {
      throw new Exception('Error al crear habilidad: ' . $e->getMessage());
    }
  }

  public static function eliminarHabilidadBD(PDO $pdo, int $id)
  {
    try {
      $stmt = $pdo->prepare('DELETE FROM habilidades WHERE id_habilidad = ?');
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      throw new Exception('Error al eliminar habilidad: ' . $e->getMessage());
    }
  }

  public static function actualizarHabilidadBD(PDO $pdo, int $id, string $nombre)
  {
    try {
      $stmt = $pdo->prepare('UPDATE habilidades SET nombre_habilidad = ? WHERE id_habilidad = ?');
      return $stmt->execute([$nombre, $id]);
    } catch (Exception $e) {
      throw new Exception('Error al actualizar habilidad: ' . $e->getMessage());
    }
  }
}
