<?php

namespace Micodigo\Aula;

use Exception;
use PDO;

trait GestionAula
{
  public static function crearAulaBD($pdo, $datos)
  {
    try {
      $sql = "INSERT INTO aula (fk_anio_escolar, fk_grado_seccion, cupos, estado) VALUES (?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $datos['fk_anio_escolar'] ?? null,
        $datos['fk_grado_seccion'] ?? null,
        $datos['cupos'] ?? null,
        $datos['estado'] ?? 'activo'
      ]);
      return $pdo->lastInsertId();
    } catch (Exception $e) {
      throw new Exception("Error al crear aula: " . $e->getMessage());
    }
  }

  public static function actualizarAulaBD($pdo, $id, $datos)
  {
    try {
      $sql = "UPDATE aula SET fk_anio_escolar = ?, fk_grado_seccion = ?, cupos = ?, estado = ? WHERE id_aula = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $datos['fk_anio_escolar'] ?? null,
        $datos['fk_grado_seccion'] ?? null,
        $datos['cupos'] ?? null,
        $datos['estado'] ?? 'activo',
        $id
      ]);
    } catch (Exception $e) {
      throw new Exception("Error al actualizar aula: " . $e->getMessage());
    }
  }

  public static function cambiarEstadoAulaBD($pdo, $id, $estado)
  {
    try {
      $sql = "UPDATE aula SET estado = ? WHERE id_aula = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$estado, $id]);
    } catch (Exception $e) {
      throw new Exception("Error al cambiar estado del aula: " . $e->getMessage());
    }
  }

  public static function eliminarAulaBD($pdo, $id)
  {
    try {
      $sql = "DELETE FROM aula WHERE id_aula = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      throw new Exception("Error al eliminar aula: " . $e->getMessage());
    }
  }
}
