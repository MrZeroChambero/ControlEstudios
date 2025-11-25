<?php

namespace Micodigo\Representate;

use Exception;
use PDO;

trait GestionRepresentante
{
  public static function crearRepresentanteBD($pdo, $datos)
  {
    try {
      $sql = "INSERT INTO representantes (fk_persona, oficio, nivel_educativo, profesion, lugar_trabajo) VALUES (?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $datos['fk_persona'],
        $datos['oficio'] ?? null,
        $datos['nivel_educativo'] ?? null,
        $datos['profesion'] ?? null,
        $datos['lugar_trabajo'] ?? null
      ]);
      return $pdo->lastInsertId();
    } catch (Exception $e) {
      throw new Exception("Error al crear representante en BD: " . $e->getMessage());
    }
  }

  public static function actualizarRepresentanteBD($pdo, $id_representante, $datos)
  {
    try {
      $sets = [];
      $vals = [];
      $campos = ['oficio', 'nivel_educativo', 'profesion', 'lugar_trabajo'];
      foreach ($campos as $c) {
        if (array_key_exists($c, $datos)) {
          $sets[] = "$c = ?";
          $vals[] = $datos[$c] === '' ? null : $datos[$c];
        }
      }
      if (empty($sets)) return false;
      $vals[] = $id_representante;
      $sql = 'UPDATE representantes SET ' . implode(', ', $sets) . ' WHERE id_representante = ?';
      $stmt = $pdo->prepare($sql);
      return $stmt->execute($vals);
    } catch (Exception $e) {
      throw new Exception("Error al actualizar representante: " . $e->getMessage());
    }
  }

  public static function eliminarRepresentanteBD($pdo, $id_representante)
  {
    try {
      $stmt = $pdo->prepare('DELETE FROM representantes WHERE id_representante = ?');
      return $stmt->execute([$id_representante]);
    } catch (Exception $e) {
      throw new Exception("Error al eliminar representante: " . $e->getMessage());
    }
  }
}
