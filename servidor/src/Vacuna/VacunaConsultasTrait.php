<?php

namespace Micodigo\Vacuna;

use PDO;

trait VacunaConsultasTrait
{
  public static function listar(PDO $pdo)
  {
    $st = $pdo->query('SELECT * FROM vacuna ORDER BY nombre');
    return $st->fetchAll(PDO::FETCH_ASSOC);
  }
  public static function obtener(PDO $pdo, int $id)
  {
    $st = $pdo->prepare('SELECT * FROM vacuna WHERE id_vacuna=?');
    $st->execute([$id]);
    return $st->fetch(PDO::FETCH_ASSOC);
  }
}
