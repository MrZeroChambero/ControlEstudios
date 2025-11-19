<?php

namespace Micodigo\DocumentosAcademicos;

use Valitron\Validator;
use PDO;

trait DocumentosAcademicosValidacionesTrait
{
  private function validar(PDO $pdo)
  {
    $v = new Validator(['fk_estudiante' => $this->fk_estudiante, 'tipo_documento' => $this->tipo_documento, 'grado' => $this->grado, 'entregado' => $this->entregado]);
    $v->rules(['required' => [['fk_estudiante'], ['tipo_documento']], 'integer' => [['fk_estudiante']], 'in' => [['tipo_documento', ['Tarjeta Vacunación', 'Carta Residencia', 'Partida Nacimiento', 'Constancia Act. Extracurricular', 'Boleta', 'Constancia Prosecución', 'Certificado Aprendizaje']], ['entregado', ['si', 'no']], ['grado', ['Educ. Inicial', 'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto', null]]]]);
    if (!$v->validate()) return $v->errors();
    $st = $pdo->prepare('SELECT id_estudiante FROM estudiantes WHERE id_estudiante=?');
    $st->execute([$this->fk_estudiante]);
    if (!$st->fetch()) return ['fk_estudiante' => ['Estudiante no existe']];
    return true;
  }
}
