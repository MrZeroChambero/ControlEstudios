<?php

namespace Micodigo\Estudiante;

use Valitron\Validator;
use Micodigo\Persona\Persona;

trait ValidacionesEstudiante
{
  private function crearValidadorPersonaEstudiante(array $data)
  {
    $normalizados = $data;
    if (array_key_exists('email', $normalizados)) {
      $correo = trim((string) $normalizados['email']);
      if ($correo === '') {
        unset($normalizados['email']);
      } else {
        $normalizados['email'] = $correo;
      }
    }

    Validator::lang('es');
    $v = new Validator($normalizados);
    $v->rules([
      'required' => [
        ['primer_nombre'],
        ['primer_apellido'],
        ['fecha_nacimiento'],
        ['genero'],
        ['nacionalidad'],
        ['direccion'],
        ['telefono_principal'],
        ['tipo_sangre']
      ],
      'date' => [['fecha_nacimiento', 'Y-m-d']],
      'in' => [['genero', ['M', 'F']], ['tipo_sangre', ['No sabe', 'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']]],
      'lengthMax' => [['primer_nombre', 50], ['segundo_nombre', 50], ['primer_apellido', 50], ['segundo_apellido', 50], ['cedula', 20], ['nacionalidad', 50], ['direccion', 255], ['telefono_principal', 20], ['telefono_secundario', 20], ['email', 100]],
      'email' => [['email']]
    ]);
    return $v;
  }

  private function crearValidadorRegistroEstudiante(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data);
    // Registro ya no exige grado ni seccion directamente.
    $v->rules([
      'in' => [['estado', ['activo', 'inactivo']]],
      'lengthMax' => [['cedula_escolar', 30]]
    ]);
    return $v;
  }

  private function validarEdadGradoRegistro(array $personaData, int $grado)
  {
    $p = new Persona($personaData);
    return $p->validarEdadPorGrado($personaData['fecha_nacimiento'] ?? null, $grado);
  }
}
