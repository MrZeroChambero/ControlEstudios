<?php

namespace Usuario\Metodos\Validaciones;

use Valitron\Validator;

trait ReglasValidacion
{

  // Método para definir la regla personalizada (se mantiene aquí por conveniencia)
  protected function _agregarReglaPersonalizada()
  {
    Validator::addRule('notOnlySpaces', function ($field, $value, array $params, array $fields) {
      return trim($value) !== '';
    }, 'No puede contener solo espacios en blanco.');
  }

  // Método para definir todas las reglas requeridas
  protected function _definirReglas($v, $isUpdate = false)
  {

    // Reglas generales
    $v->rule('notOnlySpaces', 'nombre_usuario');
    $v->rule('numeric', 'id_persona');
    $v->rule('in', 'rol', ['Administrador', 'Docente', 'Secretaria', 'Representante']);
    $v->rule('in', 'estado', ['activo', 'inactivo', 'incompleto']);
    $v->rule('lengthMin', 'nombre_usuario', 3);
    $v->rule('lengthMax', 'nombre_usuario', 50);
    $v->rule('lengthMax', 'clave', 255);
    $v->rule('regex', 'nombre_usuario', '/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/u');

    // Reglas condicionales (solo en caso de creación)
    if (!$isUpdate) {
      $v->rule('required', ['id_persona', 'nombre_usuario', 'clave', 'estado', 'rol']);
    }
  }
}
