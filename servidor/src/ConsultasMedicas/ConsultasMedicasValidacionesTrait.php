<?php

namespace Micodigo\ConsultasMedicas;

use Valitron\Validator;
use PDO;

trait ConsultasMedicasValidacionesTrait
{
  private function validar(PDO $pdo)
  {
    $v = new Validator(['fk_estudiante' => $this->fk_estudiante, 'tipo_consulta' => $this->tipo_consulta, 'tiene_informe_medico' => $this->tiene_informe_medico, 'fecha_consulta' => $this->fecha_consulta]);
    $v->rules(['required' => [['fk_estudiante'], ['tipo_consulta']], 'integer' => [['fk_estudiante']], 'in' => [['tipo_consulta', ['psicologo', 'psicopedagogo', 'neurologo', 'terapista_lenguaje', 'orientador', 'otro']], ['tiene_informe_medico', ['si', 'no', null]]], 'date' => [['fecha_consulta', 'Y-m-d']]]);
    if (!$v->validate()) return $v->errors();
    $st = $pdo->prepare('SELECT id_estudiante FROM estudiantes WHERE id_estudiante=?');
    $st->execute([$this->fk_estudiante]);
    if (!$st->fetch()) return ['fk_estudiante' => ['Estudiante no existe']];
    return true;
  }
}
