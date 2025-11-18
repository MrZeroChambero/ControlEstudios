<?php

namespace Micodigo\FuncionPersonal;

use Micodigo\Config\Conexion;
use PDO;
use Exception;

class FuncionPersonal
{
  public $id_funcion_personal;
  public $nombre;
  public $tipo;

  public static function consultarTodos($pdo)
  {
    try {
      $sql = "SELECT * FROM funcion_personal ORDER BY tipo, nombre";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar funciones del personal: " . $e->getMessage());
    }
  }

  public static function consultarParaSelect($pdo)
  {
    try {
      $sql = "SELECT id_funcion_personal, nombre, tipo FROM funcion_personal ORDER BY tipo, nombre";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar funciones para select: " . $e->getMessage());
    }
  }

  public static function verificarID(PDO $pdo, int $id): bool
  {
    try {
      $sql = "SELECT COUNT(*) FROM funcion_personal WHERE id_funcion_personal = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
