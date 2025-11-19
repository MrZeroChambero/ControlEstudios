<?php

namespace Micodigo\Alergias\ListaAlergias;

use Valitron\Validator;
use PDO;

trait ListaAlergiasValidacionesTrait
{
  private function validar(PDO $pdo)
  {
    $v = new Validator(['fk_alergia' => $this->fk_alergia, 'fk_estudiante' => $this->fk_estudiante]);
    $v->rules(['required' => [['fk_alergia'], ['fk_estudiante']], 'integer' => [['fk_alergia'], ['fk_estudiante']]]);
    if (!$v->validate()) return $v->errors();
    // verificar existencia basica
    $stmt = $pdo->prepare('SELECT id_alergia FROM alergias WHERE id_alergia=?');
    $stmt->execute([$this->fk_alergia]);
    if (!$stmt->fetch()) return ['fk_alergia' => ['Alergia no existe']];
    $stmt = $pdo->prepare('SELECT id_estudiante FROM estudiantes WHERE id_estudiante=?');
    $stmt->execute([$this->fk_estudiante]);
    if (!$stmt->fetch()) return ['fk_estudiante' => ['Estudiante no existe']];
    // evitar duplicado
    $stmt = $pdo->prepare('SELECT id_lista_alergia FROM lista_alergias WHERE fk_alergia=? AND fk_estudiante=?');
    $stmt->execute([$this->fk_alergia, $this->fk_estudiante]);
    if ($stmt->fetch()) return ['duplicado' => ['Ya asignada esta alergia al estudiante']];
    return true;
  }
}
