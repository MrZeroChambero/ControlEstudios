<?php

namespace Micodigo\Usuario;

use PDO;
use Exception;
use Valitron\Validator;

class Usuario
{
  public $id_usuario;
  public $id_persona;
  public $nombre_usuario;
  public $contrasena_hash;
  public $fecha_creacion_cuenta;
  public $ultima_sesion;
  public $estado;
  public $rol;

  public function __construct(
    ?int $id_persona,
    string $nombre_usuario,
    string $contrasena_hash,
    string $estado,
    ?string $rol,
    ?string $fecha_creacion_cuenta = null,
    ?string $ultima_sesion = null
  ) {
    $this->id_persona = $id_persona;
    $this->nombre_usuario = $nombre_usuario;
    $this->contrasena_hash = $contrasena_hash;
    $this->estado = $estado;
    $this->rol = $rol;
    // Asigna la fecha actual si no se proporciona
    $this->fecha_creacion_cuenta = $fecha_creacion_cuenta ?? date('Y-m-d H:i:s');
    $this->ultima_sesion = $ultima_sesion;
  }

  /**
   * Valida los datos del objeto Usuario usando Valitron.
   * @param array $data Los datos a validar.
   * @return array|bool Un array con errores o verdadero si la validación es exitosa.
   */
  private function _validarDatos(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data, [], 'es');

    // Regla personalizada para no permitir solo espacios en blanco
    Validator::addRule('notOnlySpaces', function ($field, $value, array $params, array $fields) {
      return trim($value) !== '';
    }, 'no puede contener solo espacios.');

    $v->rules([
      'required' => [
        ['id_persona'],
        ['nombre_usuario'],
        ['estado'],
        ['rol']
      ],
      'notOnlySpaces' => [['nombre_usuario']],
      'numeric' => [
        ['id_persona']
      ],
      'in' => [
        ['rol', ['Administrador', 'Docente', 'Secretaria', 'Representante']],
        ['estado', ['activo', 'inactivo', 'incompleto']]
      ],
      'lengthMin' => [['nombre_usuario', 3]],
      'lengthMax' => [
        ['nombre_usuario', 50],
        ['contrasena_hash', 255]
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea un nuevo registro de usuario con validación previa.
   * @param PDO $pdo Objeto de conexión a la base de datos.
   * @return int|array|false El ID insertado, un array de errores, o falso si falla.
   */
  public function crear(PDO $pdo)
  {
    $data = [
      'id_persona' => $this->id_persona,
      'nombre_usuario' => $this->nombre_usuario,
      'estado' => $this->estado,
      'rol' => $this->rol,
      'contrasena_hash' => $this->contrasena_hash,
    ];

    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "INSERT INTO usuarios (id_persona, nombre_usuario, contrasena_hash, fecha_creacion_cuenta, estado, rol) VALUES (?, ?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->id_persona,
        $this->nombre_usuario,
        $this->contrasena_hash,
        $this->fecha_creacion_cuenta,
        $this->estado,
        $this->rol
      ]);
      $this->id_usuario = $pdo->lastInsertId();
      return $this->id_usuario;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de un registro de usuario con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_usuario)) {
      return ['id_usuario' => ['El ID es requerido para la actualización.']];
    }

    $data = [
      'id_persona' => $this->id_persona,
      'nombre_usuario' => $this->nombre_usuario,
      'estado' => $this->estado,
      'rol' => $this->rol,
      'contrasena_hash' => $this->contrasena_hash,
    ];

    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE usuarios SET id_persona=?, nombre_usuario=?, contrasena_hash=?, estado=?, rol=? WHERE id_usuario=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->id_persona,
        $this->nombre_usuario,
        $this->contrasena_hash,
        $this->estado,
        $this->rol,
        $this->id_usuario
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de usuario por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID del usuario a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM usuarios WHERE id_usuario=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta todos los registros de usuarios.
   * @param PDO $pdo Objeto de conexión.
   * @return array Un array con todos los usuarios.
   */
  public static function consultarTodos(PDO $pdo)
  {
    try {
      $sql = "SELECT id_usuario, id_persona, nombre_usuario, estado, rol, fecha_creacion_cuenta, ultima_sesion FROM usuarios";
      $stmt = $pdo->query($sql);
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      // En un caso real, podrías querer registrar el error aquí.
      // Por ahora, relanzamos la excepción para que la ruta la maneje.
      throw $e;
    }
  }

  /**
   * Consulta los datos de un registro de usuario por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del usuario a consultar.
   * @return object|false Un objeto Usuario con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM usuarios WHERE id_usuario = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $usuario = new self(
          $data['id_persona'],
          $data['nombre_usuario'],
          $data['contrasena_hash'],
          $data['estado'],
          $data['rol'],
          $data['fecha_creacion_cuenta'],
          $data['ultima_sesion']
        );
        $usuario->id_usuario = $data['id_usuario'];
        unset($usuario->contrasena); // Eliminar la contraseña del objeto
        return $usuario;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de un registro de usuario por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del registro a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM usuarios WHERE id_usuario = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Busca un usuario por el ID de la persona.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id_persona ID de la persona a buscar.
   * @return object|false Un objeto Usuario o false si no se encuentra.
   */
  public static function buscarPorPersona(PDO $pdo, int $id_persona)
  {
    try {
      $sql = "SELECT id_usuario, id_persona, nombre_usuario, estado, rol, fecha_creacion_cuenta, ultima_sesion FROM usuarios WHERE id_persona = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id_persona]);
      return $stmt->fetch(PDO::FETCH_OBJ);
    } catch (Exception $e) {
      return false;
    }
  }
}
