<?php

namespace Micodigo\GradosSecciones;

use Valitron\Validator;

trait ValidacionesGradosSecciones
{
  private function limpiarTexto($texto)
  {
    if ($texto === null) return null;
    $texto = trim($texto);
    $texto = preg_replace('/\s+/', ' ', $texto);
    return $texto === '' ? null : $texto;
  }

  private function crearValidadorGradoSeccion(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data);
    $v->rule('required', ['grado', 'seccion']);
    $v->rule('lengthMax', 'grado', 50);
    $v->rule('lengthMax', 'seccion', 10);
    $v->rule('integer', 'cupos');
    return $v;
  }
}
