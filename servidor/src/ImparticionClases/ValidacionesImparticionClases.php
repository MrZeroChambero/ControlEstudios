<?php

namespace Micodigo\ImparticionClases;

use Valitron\Validator;

trait ValidacionesImparticionClases
{
  private function limpiarTexto($texto)
  {
    if ($texto === null) return null;
    $texto = trim($texto);
    $texto = preg_replace('/\s+/', ' ', $texto);
    return $texto === '' ? null : $texto;
  }

  private function crearValidadorImparticion(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data);
    $v->rule('required', ['fk_aula', 'fk_docente', 'fk_momento', 'fk_area_aprendizaje']);
    $v->rule('integer', ['fk_aula', 'fk_docente', 'fk_momento', 'fk_area_aprendizaje']);
    $v->rule('in', 'tipo_docente', ['Integral', 'Especialista']);
    return $v;
  }
}
