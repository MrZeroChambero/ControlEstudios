<?php

namespace Micodigo\Aula;

use Exception;
use PDO;

trait ConsultasAula
{
  public static function consultarTodasLasAulas($pdo)
  {
    try {
      $sql = "SELECT a.*, gs.grado, gs.seccion, CONCAT('Gr ', gs.grado, ' - Secc ', gs.seccion) AS nombre FROM aula a LEFT JOIN grado_seccion gs ON a.fk_grado_seccion = gs.id_grado_seccion ORDER BY gs.grado, gs.seccion";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar las aulas: " . $e->getMessage());
    }
  }

  public static function consultarAulasParaSelect($pdo)
  {
    try {
      $sql = "SELECT a.id_aula, CONCAT('Gr ', gs.grado, ' - Secc ', gs.seccion) AS nombre FROM aula a LEFT JOIN grado_seccion gs ON a.fk_grado_seccion = gs.id_grado_seccion WHERE a.estado = 'activo' ORDER BY gs.grado, gs.seccion";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar aulas para select: " . $e->getMessage());
    }
  }

  public static function consultarAulaPorId($pdo, $id)
  {
    try {
      $sql = "SELECT a.*, gs.grado, gs.seccion FROM aula a LEFT JOIN grado_seccion gs ON a.fk_grado_seccion = gs.id_grado_seccion WHERE a.id_aula = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al obtener aula por id: " . $e->getMessage());
    }
  }
}
