<?php

namespace Micodigo\CondicionesSalud;

use Valitron\Validator;
use PDO;

trait CondicionesSaludValidacionesTrait
{
  private function validar(PDO $pdo)
  {
    $v = new Validator(['fk_estudiante' => $this->fk_estudiante, 'fk_patologia' => $this->fk_patologia, 'afectado' => $this->afectado, 'presente_en' => $this->presente_en, 'tipo_familiar' => $this->tipo_familiar, 'fecha_deteccion' => $this->fecha_deteccion, 'cronica' => $this->cronica, 'impedimento_fisico' => $this->impedimento_fisico]);
    $v->rules(['required' => [['fk_estudiante'], ['fk_patologia'], ['afectado'], ['presente_en']], 'integer' => [['fk_estudiante'], ['fk_patologia']], 'date' => [['fecha_deteccion', 'Y-m-d']], 'in' => [['afectado', ['estudiante', 'familiar', 'estudiante_y_familiar']], ['presente_en', ['estudiante', 'familiar']], ['tipo_familiar', ['madre', 'padre', 'hermano', 'abuelo', 'tio', 'otro', null]], ['cronica', ['si', 'no', null]], ['impedimento_fisico', ['si', 'no', null]]]]);
    if (!$v->validate()) return $v->errors();
    $st = $pdo->prepare('SELECT id_estudiante FROM estudiantes WHERE id_estudiante=?');
    $st->execute([$this->fk_estudiante]);
    if (!$st->fetch()) return ['fk_estudiante' => ['Estudiante no existe']];
    $st = $pdo->prepare('SELECT id_patologia FROM patologias WHERE id_patologia=?');
    $st->execute([$this->fk_patologia]);
    if (!$st->fetch()) return ['fk_patologia' => ['Patología no existe']];
    return true;
  }
}
