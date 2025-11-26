<?php

namespace Micodigo\ImparticionClases;

use Exception;
use PDO;

trait ConsultasImparticionClases
{
  public static function consultarTodasLasImparticiones($pdo)
  {
    try {
      $sql = "SELECT * FROM imparticion_clases ORDER BY fk_aula, fk_momento";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar impartición de clases: " . $e->getMessage());
    }
  }

  public static function consultarImparticionPorId($pdo, $id)
  {
    try {
      $sql = "SELECT * FROM imparticion_clases WHERE id_imparticion_clases = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al obtener impartición por id: " . $e->getMessage());
    }
  }
}
