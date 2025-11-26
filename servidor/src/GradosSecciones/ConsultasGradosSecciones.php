<?php

namespace Micodigo\GradosSecciones;

use Exception;
use PDO;

trait ConsultasGradosSecciones
{
  public static function consultarTodosLosGradosSecciones($pdo)
  {
    try {
      $sql = "SELECT * FROM grados_secciones ORDER BY grado, seccion";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar grados y secciones: " . $e->getMessage());
    }
  }

  public static function consultarGradoSeccionPorId($pdo, $id)
  {
    try {
      $sql = "SELECT * FROM grados_secciones WHERE id_grado_seccion = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al obtener grado-sección por id: " . $e->getMessage());
    }
  }
}
