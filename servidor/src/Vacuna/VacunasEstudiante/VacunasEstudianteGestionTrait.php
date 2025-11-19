<?php

namespace Micodigo\Vacuna\VacunasEstudiante;

use PDO;

trait VacunasEstudianteGestionTrait
{
  public function crear(PDO $pdo)
  {
    $val = $this->validar($pdo);
    if ($val !== true) return $val;
    $stmt = $pdo->prepare('INSERT INTO vacunas_estudiante (fk_vacuna,fk_estudiante,fecha_aplicacion,refuerzos) VALUES (?,?,?,?)');
    $stmt->execute([$this->fk_vacuna, $this->fk_estudiante, $this->fecha_aplicacion, $this->refuerzos]);
    $this->id_vacuna_estudiante = $pdo->lastInsertId();
    return $this->id_vacuna_estudiante;
  }
  public function actualizar(PDO $pdo)
  {
    if (!$this->id_vacuna_estudiante) return ['id_vacuna_estudiante' => ['ID requerido']];
    $val = $this->validar($pdo);
    if ($val !== true) return $val;
    $stmt = $pdo->prepare('UPDATE vacunas_estudiante SET fk_vacuna=?, fk_estudiante=?, fecha_aplicacion=?, refuerzos=? WHERE id_vacuna_estudiante=?');
    return $stmt->execute([$this->fk_vacuna, $this->fk_estudiante, $this->fecha_aplicacion, $this->refuerzos, $this->id_vacuna_estudiante]);
  }
  public static function eliminar(PDO $pdo, int $id)
  {
    $st = $pdo->prepare('DELETE FROM vacunas_estudiante WHERE id_vacuna_estudiante=?');
    return $st->execute([$id]);
  }
}
