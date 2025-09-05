<?php

namespace Micodigo\Persona;

use Valitron\Validator;
use PDO;
use PDOException;
use Exception;

class Persona
{
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

  public function __construct(
    $primer_nombre,
    $primer_apellido,
    $cedula,
    $fecha_nacimiento,
    $genero,
    $nacionalidad,
    $direccion,
    $telefono_principal,
    $segundo_nombre = null,
    $segundo_apellido = null,
    $telefono_secundario = null,
    $email = null
  ) {
    $this->primer_nombre = $primer_nombre;
    $this->segundo_nombre = $segundo_nombre;
    $this->primer_apellido = $primer_apellido;
    $this->segundo_apellido = $segundo_apellido;
    $this->fecha_nacimiento = $fecha_nacimiento;
    $this->genero = $genero;
    $this->cedula = $cedula;
    $this->nacionalidad = $nacionalidad;
    $this->direccion = $direccion;
    $this->telefono_principal = $telefono_principal;
    $this->telefono_secundario = $telefono_secundario;
    $this->email = $email;
  }

  /**
   * Valida los datos del objeto Persona usando Valitron con la sintaxis de 'rules'.
   * @param array $data Los datos a validar (generalmente del objeto actual).
   * @return array|bool Un array con errores o verdadero si la validación es exitosa.
   */
  private function _validarDatos(array $data)
  {
    // Define tus mensajes de validación
    $mensajes = [
      'required' => 'El campo {field} es obligatorio.',
      'lengthMax' => 'El campo {field} debe tener como máximo {max} caracteres.',
      'date' => 'El campo {field} no es una fecha válida.',
      'length' => 'El campo {field} debe tener una longitud de {length}.',
      'in' => 'El valor del campo {field} no es válido.',
      'email' => 'El formato del campo {field} es inválido.',
    ];

    // Carga los mensajes de validación personalizados
    Validator::lang('es');
    Validator::lang('es', $mensajes);

    // Instancia el validador pasando los datos y el idioma 'es'
    $v = new Validator($data, [], 'es');

    // Define las reglas de validación en un solo array
    $v->rules([
      'required' => [
        ['primer_nombre'],
        ['primer_apellido'],
        ['fecha_nacimiento'],
        ['genero'],
        ['cedula'],
        ['nacionalidad'],
        ['direccion'],
        ['telefono_principal']
      ],
      'lengthMax' => [
        ['primer_nombre', 50],
        ['segundo_nombre', 50],
        ['primer_apellido', 50],
        ['segundo_apellido', 50],
        ['cedula', 20],
        ['nacionalidad', 20],
        ['direccion', 255],
        ['telefono_principal', 20],
        ['telefono_secundario', 20],
        ['email', 100]
      ],
      'date' => [
        ['fecha_nacimiento']
      ],
      'length' => [
        ['genero', 1]
      ],
      'in' => [
        ['genero', ['M', 'F']]
      ],
      'email' => [
        ['email']
      ]
    ]);

    // Sobrescribe un mensaje específico para la regla 'in' del género
    $v->rule('in', 'genero', ['M', 'F'])->message('El género debe ser un solo caracter (M o F).');

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }
  /**
   * Registra una nueva persona en la base de datos, con validación previa.
   * @param PDO $pdo Objeto de conexión a la base de datos.
   * @return int|array|false El ID insertado, un array de errores, o falso en caso de error de conexión.
   */
  public function registrar(PDO $pdo)
  {
    $data = get_object_vars($this);
    echo "data:";
    var_dump($data);
    echo "<br>";
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "INSERT INTO personas (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, genero, cedula, nacionalidad, direccion, telefono_principal, telefono_secundario, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->primer_nombre,
        $this->segundo_nombre,
        $this->primer_apellido,
        $this->segundo_apellido,
        $this->fecha_nacimiento,
        $this->genero,
        $this->cedula,
        $this->nacionalidad,
        $this->direccion,
        $this->telefono_principal,
        $this->telefono_secundario,
        $this->email
      ]);
      $this->id_persona = $pdo->lastInsertId();
      return $this->id_persona;
    } catch (PDOException $e) {
      if ($e->getCode() == 23000) {
        return ['cedula' => ['La cédula ya se encuentra registrada.']];
      }
      return false;
    }
  }


  /**
   * Actualiza un registro existente, con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero o un array de errores.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_persona)) {
      return ['id_persona' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE personas SET primer_nombre=?, segundo_nombre=?, primer_apellido=?, segundo_apellido=?, fecha_nacimiento=?, genero=?, cedula=?, nacionalidad=?, direccion=?, telefono_principal=?, telefono_secundario=?, email=? WHERE id_persona=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->primer_nombre,
        $this->segundo_nombre,
        $this->primer_apellido,
        $this->segundo_apellido,
        $this->fecha_nacimiento,
        $this->genero,
        $this->cedula,
        $this->nacionalidad,
        $this->direccion,
        $this->telefono_principal,
        $this->telefono_secundario,
        $this->email,
        $this->id_persona
      ]);
    } catch (PDOException $e) {
      return false;
    }
  }

  /**
   * Elimina un registro por ID.
   * @param PDO $pdo Objeto de conexión.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public function eliminar(PDO $pdo)
  {
    if (empty($this->id_persona)) {
      return ['id_persona' => ['El ID es requerido para la eliminación.']];
    }
    try {
      $sql = "DELETE FROM personas WHERE id_persona=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$this->id_persona]);
    } catch (PDOException $e) {
      return false;
    }
  }
}
