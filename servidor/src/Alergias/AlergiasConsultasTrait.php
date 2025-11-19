<?php

namespace Micodigo\Alergias;

use PDO;

trait AlergiasConsultasTrait
{
  public static function listar(PDO $pdo)
  {
    $stmt = $pdo->query('SELECT * FROM alergias ORDER BY nombre');
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public static function obtener(PDO $pdo, int $id)
  {
    $stmt = $pdo->prepare('SELECT * FROM alergias WHERE id_alergia = ?');
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }
}
