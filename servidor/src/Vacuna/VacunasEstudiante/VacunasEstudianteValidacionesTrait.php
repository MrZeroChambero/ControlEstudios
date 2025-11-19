<?php

namespace Micodigo\Vacuna\VacunasEstudiante;

use Valitron\Validator;
use PDO;

trait VacunasEstudianteValidacionesTrait
{
  private function validar(PDO $pdo)
  {
    $v = new Validator(['fk_vacuna' => $this->fk_vacuna, 'fk_estudiante' => $this->fk_estudiante, 'fecha_aplicacion' => $this->fecha_aplicacion, 'refuerzos' => $this->refuerzos]);
    $v->rules(['required' => [['fk_vacuna'], ['fk_estudiante']], 'integer' => [['fk_vacuna'], ['fk_estudiante'], ['refuerzos']], 'date' => [['fecha_aplicacion', 'Y-m-d']]]);
    if (!$v->validate()) return $v->errors();
    $st = $pdo->prepare('SELECT id_vacuna FROM vacuna WHERE id_vacuna=?');
    $st->execute([$this->fk_vacuna]);
    if (!$st->fetch()) return ['fk_vacuna' => ['Vacuna no existe']];
    $st = $pdo->prepare('SELECT id_estudiante FROM estudiantes WHERE id_estudiante=?');
    $st->execute([$this->fk_estudiante]);
    if (!$st->fetch()) return ['fk_estudiante' => ['Estudiante no existe']];
    return true;
  }
}
