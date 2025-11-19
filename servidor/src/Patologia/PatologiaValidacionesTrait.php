<?php

namespace Micodigo\Patologia;

use Valitron\Validator;
use PDO;

trait PatologiaValidacionesTrait
{
  private function validar(PDO $pdo)
  {
    $v = new Validator(['nombre_patologia' => $this->nombre_patologia, 'descripcion' => $this->descripcion, 'id_patologia' => $this->id_patologia]);
    $v->rules(['required' => [['nombre_patologia']], 'lengthMax' => [['nombre_patologia', 100], ['descripcion', 255]]]);
    if (!$v->validate()) return $v->errors();
    $st = $pdo->prepare('SELECT id_patologia FROM patologias WHERE nombre_patologia=?' . ($this->id_patologia ? ' AND id_patologia != ?' : ''));
    $p = [$this->nombre_patologia];
    if ($this->id_patologia) $p[] = $this->id_patologia;
    $st->execute($p);
    if ($st->fetch()) return ['nombre_patologia' => ['Ya existe la patología']];
    return true;
  }
}
