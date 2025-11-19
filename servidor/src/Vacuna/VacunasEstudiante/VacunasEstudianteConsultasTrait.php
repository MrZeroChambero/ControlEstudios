<?php

namespace Micodigo\Vacuna\VacunasEstudiante;

use PDO;

trait VacunasEstudianteConsultasTrait
{
  public static function listarPorEstudiante(PDO $pdo, int $fk_estudiante)
  {
    $st = $pdo->prepare('SELECT ve.id_vacuna_estudiante, ve.fecha_aplicacion, ve.refuerzos, v.id_vacuna, v.nombre FROM vacunas_estudiante ve INNER JOIN vacuna v ON ve.fk_vacuna=v.id_vacuna WHERE ve.fk_estudiante=? ORDER BY v.nombre');
    $st->execute([$fk_estudiante]);
    return $st->fetchAll(PDO::FETCH_ASSOC);
  }
  public static function obtener(PDO $pdo, int $id)
  {
    $st = $pdo->prepare('SELECT * FROM vacunas_estudiante WHERE id_vacuna_estudiante=?');
    $st->execute([$id]);
    return $st->fetch(PDO::FETCH_ASSOC);
  }
}
