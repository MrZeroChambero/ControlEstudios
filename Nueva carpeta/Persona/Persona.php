<?php

namespace Micodigo\Persona;

use PDO;
use Exception;
use Valitron\Validator;

class Persona
{
  use PersonaValidaciones, PersonaOperaciones, PersonaConsultas;

  public $id_persona;
  public $primer_nombre;
  public $segundo_nombre;
  public $primer_apellido;
  public $segundo_apellido;
  public $fecha_nacimiento;
  public $genero;
  public $cedula;
  public $nacionalidad;
  public $direccion;
  public $telefono_principal;
  public $telefono_secundario;
  public $email;
  public $tipo_persona;
  public $tipo_sangre;
  public $estado;

  public function __construct(array $data = [])
  {
    $this->id_persona = $data['id_persona'] ?? null;
    $this->primer_nombre = $data['primer_nombre'] ?? null;
    $this->segundo_nombre = $data['segundo_nombre'] ?? null;
    $this->primer_apellido = $data['primer_apellido'] ?? null;
    $this->segundo_apellido = $data['segundo_apellido'] ?? null;
    $this->fecha_nacimiento = $data['fecha_nacimiento'] ?? null;
    $this->genero = $data['genero'] ?? null;
    $this->cedula = $data['cedula'] ?? null;
    $this->nacionalidad = $data['nacionalidad'] ?? null;
    $this->direccion = $data['direccion'] ?? null;
    $this->telefono_principal = $data['telefono_principal'] ?? null;
    $this->telefono_secundario = $data['telefono_secundario'] ?? null;
    $this->email = $data['email'] ?? null;
    $this->tipo_persona = $data['tipo_persona'] ?? null;
    $this->tipo_sangre = $data['tipo_sangre'] ?? null;
    $this->estado = $data['estado'] ?? null;
  }
}
