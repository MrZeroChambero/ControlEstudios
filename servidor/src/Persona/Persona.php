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

  public function __construct(array $data)
  {
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
  }

  private function _validarDatos(PDO $pdo)
  {
    Validator::lang('es');
    $v = new Validator((array) $this);

    // Regla personalizada para verificar si la cédula ya existe (y no es la del usuario actual)
    Validator::addRule('uniqueCedula', function ($field, $value, array $params, array $fields) use ($pdo) {
      if (empty($value)) return true; // No validar si está vacío, 'required' se encargará
      $sql = "SELECT id_persona FROM personas WHERE cedula = ?";
      $params_sql = [$value];
      if (!empty($this->id_persona)) {
        $sql .= " AND id_persona != ?";
        $params_sql[] = $this->id_persona;
      }
      $stmt = $pdo->prepare($sql);
      $stmt->execute($params_sql);
      return $stmt->fetch() === false;
    }, 'ya está en uso.');

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
      'date' => [['fecha_nacimiento', 'Y-m-d']],
      'in' => [['genero', ['M', 'F', 'Otro']]],
      'email' => [['email']],
      'uniqueCedula' => [['cedula']]
    ]);

    if ($v->validate()) {
      return true;
    }
    return $v->errors();
  }

  public function crear(PDO $pdo)
  {
    $errores = $this->_validarDatos($pdo);
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
    } catch (Exception $e) {
      // Manejar error de duplicado de cédula o email
      if ($e->getCode() == '23000') { // Error de integridad (duplicado)
        if (strpos($e->getMessage(), 'email') !== false) {
          return ['email' => ['El correo electrónico ya está en uso.']];
        }
      }
      return false;
    }
  }

  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_persona)) return ['id_persona' => ['El ID de la persona es requerido.']];

    $errores = $this->_validarDatos($pdo);
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
    } catch (Exception $e) {
      if ($e->getCode() == '23000') {
        if (strpos($e->getMessage(), 'email') !== false) {
          return ['email' => ['El correo electrónico ya está en uso.']];
        }
      }
      return false;
    }
  }

  public static function consultarTodos(PDO $pdo)
  {
    $stmt = $pdo->query("SELECT * FROM personas");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public static function consultar(PDO $pdo, $id)
  {
    $stmt = $pdo->prepare("SELECT * FROM personas WHERE id_persona = ?");
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $stmt = $pdo->prepare("DELETE FROM personas WHERE id_persona = ?");
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      // Manejar error de clave foránea
      if ($e->getCode() == '23000') {
        return ['error_fk' => 'No se puede eliminar a la persona porque está asociada a otros registros (ej. un usuario).'];
      }
      return false;
    }
  }
}
