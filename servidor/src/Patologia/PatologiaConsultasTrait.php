<?php

namespace Micodigo\Patologia;

use PDO;

trait PatologiaConsultasTrait
{
  public static function listar(PDO $pdo)
  {
    $st = $pdo->query('SELECT * FROM patologias ORDER BY nombre_patologia');
    return $st->fetchAll(PDO::FETCH_ASSOC);
  }
  public static function obtener(PDO $pdo, int $id)
  {
    $st = $pdo->prepare('SELECT * FROM patologias WHERE id_patologia=?');
    $st->execute([$id]);
    return $st->fetch(PDO::FETCH_ASSOC);
  }
}
