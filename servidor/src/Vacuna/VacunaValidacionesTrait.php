<?php

namespace Micodigo\Vacuna;

use Valitron\Validator;
use PDO;

trait VacunaValidacionesTrait
{
  private function validar(PDO $pdo)
  {
    $v = new Validator(['nombre' => $this->nombre, 'id_vacuna' => $this->id_vacuna]);
    $v->rules(['required' => [['nombre']], 'lengthMax' => [['nombre', 255]]]);
    if (!$v->validate()) return $v->errors();
    $stmt = $pdo->prepare('SELECT id_vacuna FROM vacuna WHERE nombre=?' . ($this->id_vacuna ? ' AND id_vacuna != ?' : ''));
    $p = [$this->nombre];
    if ($this->id_vacuna) $p[] = $this->id_vacuna;
    $stmt->execute($p);
    if ($stmt->fetch()) return ['nombre' => ['Ya existe la vacuna']];
    return true;
  }
}
