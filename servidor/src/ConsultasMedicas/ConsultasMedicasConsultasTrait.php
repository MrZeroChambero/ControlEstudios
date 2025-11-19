<?php

namespace Micodigo\ConsultasMedicas;

use PDO;

trait ConsultasMedicasConsultasTrait
{
  public static function listarPorEstudiante(PDO $pdo, int $fk_estudiante)
  {
    $st = $pdo->prepare('SELECT * FROM consultas_medicas WHERE fk_estudiante=? ORDER BY fecha_consulta DESC');
    $st->execute([$fk_estudiante]);
    return $st->fetchAll(PDO::FETCH_ASSOC);
  }
  public static function obtener(PDO $pdo, int $id)
  {
    $st = $pdo->prepare('SELECT * FROM consultas_medicas WHERE id_consulta=?');
    $st->execute([$id]);
    return $st->fetch(PDO::FETCH_ASSOC);
  }
}
