<?php

namespace Micodigo\MomentoAcademico;

use Exception;
use PDO;

trait ConsultasMomentoAcademico
{
  public static function consultarTodosLosMomentos($pdo)
  {
    try {
      $sql = "SELECT * FROM momentos_academicos ORDER BY orden";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar momentos académicos: " . $e->getMessage());
    }
  }

  public static function consultarMomentoPorId($pdo, $id)
  {
    try {
      $sql = "SELECT * FROM momentos_academicos WHERE id_momento = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al obtener momento por id: " . $e->getMessage());
    }
  }

  public static function consultarMomentosPorAnio($pdo, $id_anio)
  {
    try {
      $sql = "SELECT * FROM momentos_academicos WHERE fk_anio_escolar = ? ORDER BY orden";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id_anio]);
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar momentos por año: " . $e->getMessage());
    }
  }
}
