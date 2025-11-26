<?php

namespace Micodigo\AnioEscolar;

use Exception;
use PDO;

trait ConsultasAnioEscolar
{
  public static function consultarTodosLosAnios($pdo)
  {
    try {
      $sql = "SELECT * FROM anios_escolares ORDER BY id_anio_escolar DESC";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar años escolares: " . $e->getMessage());
    }
  }

  public static function consultarAnioPorId($pdo, $id)
  {
    try {
      $sql = "SELECT * FROM anios_escolares WHERE id_anio_escolar = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al obtener año escolar por id: " . $e->getMessage());
    }
  }
}
