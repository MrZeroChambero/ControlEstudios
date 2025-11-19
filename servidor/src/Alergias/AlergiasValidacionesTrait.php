<?php

namespace Micodigo\Alergias;

use Valitron\Validator;
use PDO;

trait AlergiasValidacionesTrait
{
  private function validar(PDO $pdo)
  {
    $v = new Validator(['nombre' => $this->nombre, 'id_alergia' => $this->id_alergia]);
    $v->rules([
      'required' => [['nombre']],
      'lengthMax' => [['nombre', 255]]
    ]);
    if (!$v->validate()) return $v->errors();
    $stmt = $pdo->prepare('SELECT id_alergia FROM alergias WHERE nombre = ?' . ($this->id_alergia ? ' AND id_alergia != ?' : ''));
    $params = [$this->nombre];
    if ($this->id_alergia) $params[] = $this->id_alergia;
    $stmt->execute($params);
    if ($stmt->fetch()) return ['nombre' => ['Ya existe una alergia con este nombre.']];
    return true;
  }
}
