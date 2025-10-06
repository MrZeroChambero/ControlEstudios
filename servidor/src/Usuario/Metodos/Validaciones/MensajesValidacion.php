<?php

namespace Usuario\Metodos\Validaciones;

trait MensajesValidacion
{

  // Método para asignar los mensajes personalizados a las reglas
  protected function _asignarMensajes($v)
  {

    // Mensajes para id_persona
    $v->rule('required', 'id_persona')->message('Debe seleccionar una persona.');
    $v->rule('numeric', 'id_persona')->message('La persona seleccionada no es válida.');

    // Mensajes para nombre_usuario
    $v->rule('required', 'nombre_usuario')->message('El nombre de usuario es requerido.');
    $v->rule('lengthMin', 'nombre_usuario')->message('El nombre de usuario debe tener al menos 3 caracteres.');
    $v->rule('lengthMax', 'nombre_usuario')->message('El nombre de usuario no puede exceder los 50 caracteres.');
    $v->rule('notOnlySpaces', 'nombre_usuario')->message('El nombre de usuario no puede contener solo espacios.');
    $v->rule('regex', 'nombre_usuario')->message('El nombre de usuario solo puede contener letras, números y espacios.');

    // Mensajes para clave
    $v->rule('required', 'clave')->message('La contraseña es requerida.');
    $v->rule('lengthMax', 'clave')->message('La contraseña hasheada excede el límite de la base de datos.');

    // Mensajes para rol
    $v->rule('required', 'rol')->message('Debe seleccionar un rol.');
    $v->rule('in', 'rol')->message('El rol seleccionado no es válido.');

    // Mensajes para estado
    $v->rule('required', 'estado')->message('El estado es requerido.');
    $v->rule('in', 'estado')->message('El estado seleccionado no es válido.');
  }
}
