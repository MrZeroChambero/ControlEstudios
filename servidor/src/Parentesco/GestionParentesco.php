<?php

namespace Micodigo\Parentesco;

use PDO;
use Exception;

trait GestionParentesco
{
  public static function crearParentescoBD(PDO $pdo, array $data): int
  {
    try {
      $stmt = $pdo->prepare("INSERT INTO parentesco (fk_estudiante, fk_representante, tipo_parentesco) VALUES (?,?,?)");
      $stmt->execute([
        $data['fk_estudiante'],
        $data['fk_representante'],
        $data['tipo_parentesco']
      ]);
      return (int)$pdo->lastInsertId();
    } catch (Exception $e) {
      throw new Exception('Error al crear parentesco: ' . $e->getMessage());
    }
  }

  public static function actualizarParentescoBD(PDO $pdo, int $id_parentesco, array $data): bool
  {
    try {
      $sets = [];
      $vals = [];
      if (isset($data['tipo_parentesco'])) {
        $sets[] = 'tipo_parentesco = ?';
        $vals[] = $data['tipo_parentesco'];
      }
      if (isset($data['fk_estudiante'])) {
        $sets[] = 'fk_estudiante = ?';
        $vals[] = $data['fk_estudiante'];
      }
      if (isset($data['fk_representante'])) {
        $sets[] = 'fk_representante = ?';
        $vals[] = $data['fk_representante'];
      }
      if (empty($sets)) return false;
      $vals[] = $id_parentesco;
      $sql = 'UPDATE parentesco SET ' . implode(', ', $sets) . ' WHERE id_parentesco = ?';
      $stmt = $pdo->prepare($sql);
      return $stmt->execute($vals);
    } catch (Exception $e) {
      throw new Exception('Error al actualizar parentesco: ' . $e->getMessage());
    }
  }

  public static function eliminarParentescoBD(PDO $pdo, int $id_parentesco): bool
  {
    try {
      $stmt = $pdo->prepare('DELETE FROM parentesco WHERE id_parentesco = ?');
      return $stmt->execute([$id_parentesco]);
    } catch (Exception $e) {
      throw new Exception('Error al eliminar parentesco: ' . $e->getMessage());
    }
  }
}
