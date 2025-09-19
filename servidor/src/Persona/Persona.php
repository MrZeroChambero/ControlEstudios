<?php

namespace Micodigo\Persona;

use PDO;
use Exception;
use Valitron\Validator;

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
  public $tipo_persona;

  public function __construct(
    $primer_nombre,
    $primer_apellido,
    $cedula,
    $fecha_nacimiento,
    $genero,
    $nacionalidad,
    $direccion,
    $telefono_principal,
    $tipo_persona = null,
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
    $this->tipo_persona = $tipo_persona;
  }

  /**
   * Valida los datos del objeto Persona usando Valitron.
   * @param array $data Los datos a validar.
   * @return array|bool Un array con errores o verdadero si la validación es exitosa.
   */
  private function _validarDatos(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data, [], 'es');

    $v->rules([
      'required' => [
        ['primer_nombre'],
        ['primer_apellido'],
        ['fecha_nacimiento'],
        ['genero'],
        ['nacionalidad'],
        ['direccion'],
        ['telefono_principal']
      ],
      'date' => [
        ['fecha_nacimiento']
      ],
      'lengthMax' => [
        ['primer_nombre', 50],
        ['segundo_nombre', 50],
        ['primer_apellido', 50],
        ['segundo_apellido', 50],
        ['cedula', 20],
        ['nacionalidad', 50],
        ['direccion', 255],
        ['telefono_principal', 20],
        ['telefono_secundario', 20],
        ['email', 100]
      ],
      'in' => [
        ['genero', ['M', 'F', 'Otro']],
        ['tipo_persona', ['estudiante', 'representante', 'personal']]
      ],
      'email' => [
        ['email']
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea un nuevo registro de persona con validación previa.
   * @param PDO $pdo Objeto de conexión a la base de datos.
   * @return int|array|false El ID insertado, un array de errores, o falso si falla.
   */
  public function crear(PDO $pdo)
  {
    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "INSERT INTO personas (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, genero, cedula, nacionalidad, direccion, telefono_principal, telefono_secundario, email, tipo_persona) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
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
        $this->email,
        $this->tipo_persona
      ]);
      $this->id_persona = $pdo->lastInsertId();
      return $this->id_persona;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de un registro de persona con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
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
      $sql = "UPDATE personas SET primer_nombre=?, segundo_nombre=?, primer_apellido=?, segundo_apellido=?, fecha_nacimiento=?, genero=?, cedula=?, nacionalidad=?, direccion=?, telefono_principal=?, telefono_secundario=?, email=?, tipo_persona=? WHERE id_persona=?";
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
        $this->tipo_persona,
        $this->id_persona
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de persona por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID del registro a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM personas WHERE id_persona=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta los datos de un registro por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del registro a consultar.
   * @return object|false Un objeto Persona con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM personas WHERE id_persona = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $persona = new self(
          $data['primer_nombre'],
          $data['primer_apellido'],
          $data['cedula'],
          $data['fecha_nacimiento'],
          $data['genero'],
          $data['nacionalidad'],
          $data['direccion'],
          $data['telefono_principal'],
          $data['tipo_persona'],
          $data['segundo_nombre'],
          $data['segundo_apellido'],
          $data['telefono_secundario'],
          $data['email']
        );
        $persona->id_persona = $data['id_persona'];
        return $persona;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de un registro de persona por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del registro a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM personas WHERE id_persona = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
