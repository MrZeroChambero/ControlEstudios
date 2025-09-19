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
  public $contrasena;
  public $estado;
  public $rol;

  public function __construct(
    $id_persona,
    $nombre_usuario,
    $contrasena,
    $estado,
    $rol
  ) {
    $this->id_persona = $id_persona;
    $this->nombre_usuario = $nombre_usuario;
    $this->contrasena = $contrasena;
    $this->estado = $estado;
    $this->rol = $rol;
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

    $v->rules([
      'required' => [
        ['id_persona'],
        ['nombre_usuario'],
        ['contrasena'],
        ['estado'],
        ['rol']
      ],
      'numeric' => [
        ['id_persona']
      ],
      'lengthMax' => [
        ['nombre_usuario', 50],
        ['contrasena', 255]
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
    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "INSERT INTO usuarios (id_persona, nombre_usuario, contrasena, estado, rol) VALUES (?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->id_persona,
        $this->nombre_usuario,
        $this->contrasena,
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

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE usuarios SET id_persona=?, nombre_usuario=?, contrasena=?, estado=?, rol=? WHERE id_usuario=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->id_persona,
        $this->nombre_usuario,
        $this->contrasena,
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
          $data['contrasena'],
          $data['estado'],
          $data['rol']
        );
        $usuario->id_usuario = $data['id_usuario'];
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
}
