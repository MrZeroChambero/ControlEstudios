<?php

namespace Micodigo\Aula;

use Valitron\Validator;
use Exception;

trait ValidacionesAula
{
  private function limpiarTexto($texto)
  {
    if ($texto === null) return null;
    $texto = trim($texto);
    $texto = preg_replace('/\s+/', ' ', $texto);
    return $texto === '' ? null : $texto;
  }

  private function crearValidadorAula(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data);
    $v->rule('required', ['nombre']);
    $v->rule('lengthMax', 'nombre', 100);
    $v->rule('integer', 'capacidad');
    return $v;
  }
}
