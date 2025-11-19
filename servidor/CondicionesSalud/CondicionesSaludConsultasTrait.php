<?php

namespace Micodigo\CondicionesSalud;

use PDO;

trait CondicionesSaludConsultasTrait
{
  public static function listarPorEstudiante(PDO $pdo, int $fk_estudiante)
  {
    $st = $pdo->prepare('SELECT cs.*, p.nombre_patologia FROM condiciones_salud cs INNER JOIN patologias p ON cs.fk_patologia=p.id_patologia WHERE cs.fk_estudiante=? ORDER BY p.nombre_patologia');
    $st->execute([$fk_estudiante]);
    return $st->fetchAll(PDO::FETCH_ASSOC);
  }
  public static function obtener(PDO $pdo, int $id)
  {
    $st = $pdo->prepare('SELECT * FROM condiciones_salud WHERE id_condicion=?');
    $st->execute([$id]);
    return $st->fetch(PDO::FETCH_ASSOC);
  }
}
