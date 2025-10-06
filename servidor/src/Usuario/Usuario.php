<?php

namespace Micodigo\Usuario;

use PDO;
use Exception;
use Valitron\Validator;
use Usuario\Validaciones\ValidarDatos;

class Usuario
{
  use ValidarDatos;

  public $id_usuario;
  public $id_persona;
  public $nombre_usuario;
  public $clave;
  public $estado;
  public $rol;

  public function __construct(?int $id_persona, string $nombre_usuario, string $clave, string $estado, ?string $rol)
  {
    $this->id_persona = $id_persona;
    $this->nombre_usuario = $nombre_usuario;
    $this->clave = $clave;
    $this->estado = $estado;
    $this->rol = $rol;
  }

  /**
   * Valida la contraseña en texto plano.
   * @param string $contrasena La contraseña a validar.
   * @return true|array Devuelve true si es válida, o un array de errores.
   */
  public function validarContrasena(string $contrasena)
  {
    Validator::lang('es');
    $v = new Validator(['contrasena' => $contrasena]);
    $v->rule('required', 'contrasena')->message('La contraseña es requerida.');
    $v->rule('lengthMin', 'contrasena', 8)->message('La contraseña debe tener al menos 8 caracteres.');
    $v->rule('regex', 'contrasena', '/^[a-zA-Z0-9]+$/')->message('La contraseña solo puede contener letras y números.');

    if ($v->validate()) {
      return true;
    }
    return $v->errors();
  }

  /**
   *  Función para encapsular la validación y poder llamarla desde afuera
   */
  public function validarDatos(array $data, $isUpdate = false)
  {
    return $this->_validarDatos($data, $isUpdate);
  }

  /**
   * Establece la contraseña hasheada.
   */
  public function setContrasena(string $contrasena)
  {
    $this->clave = password_hash($contrasena, PASSWORD_DEFAULT);
  }

  /**
   * Crea un nuevo registro de usuario.
   * @param PDO $pdo Objeto de conexión a la base de datos.
   * @return int|false El ID insertado o falso si falla.
   */
  public function crear(PDO $pdo)
  {
    try {
      $sql = "INSERT INTO usuarios (id_persona, nombre_usuario, contrasena_hash, estado, rol) VALUES (?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->id_persona,
        $this->nombre_usuario,
        $this->clave,
        $this->estado,
        $this->rol
      ]);
      $this->id_usuario = $pdo->lastInsertId();
      return $this->id_usuario;
    } catch (Exception $e) {
      // En un entorno de producción, sería bueno registrar el error $e->getMessage()
      return false;
    }
  }

  /**
   * Actualiza los datos de un registro de usuario.
   * @param PDO $pdo Objeto de conexión.
   * @return bool Verdadero si la actualización fue exitosa, falso si no.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_usuario)) {
      return false;
    }

    try {
      if (!empty($this->clave)) {
        $sql = "UPDATE usuarios SET id_persona=?, nombre_usuario=?, contrasena_hash=?, estado=?, rol=? WHERE id_usuario=?";
        $stmt = $pdo->prepare($sql);
        return $stmt->execute([$this->id_persona, $this->nombre_usuario, $this->clave, $this->estado, $this->rol, $this->id_usuario]);
      } else {
        $sql = "UPDATE usuarios SET id_persona=?, nombre_usuario=?, estado=?, rol=? WHERE id_usuario=?";
        $stmt = $pdo->prepare($sql);
        return $stmt->execute([$this->id_persona, $this->nombre_usuario, $this->estado, $this->rol, $this->id_usuario]);
      }
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de usuario por ID.
   */
  public static function eliminar(PDO $pdo, $id): bool
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
   */
  public static function consultarTodos(PDO $pdo): array
  {
    try {
      $sql = "SELECT id_usuario, id_persona, nombre_usuario, estado, rol FROM usuarios";
      $stmt = $pdo->query($sql);
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw $e;
    }
  }

  /**
   * Consulta los datos de un registro de usuario por su ID.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM usuarios WHERE id_usuario = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        return ['id_persona' => $data['id_persona'], 'nombre_usuario' => $data['nombre_usuario'], 'estado' => $data['estado'], 'rol' => $data['rol']];
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta un usuario para actualizar, devolviendo el objeto completo.
   */
  public static function consultarActualizar(PDO $pdo, $id)
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
   */
  public static function verificarID(PDO $pdo, $id): bool
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
   */
  public static function buscarPorPersona(PDO $pdo, int $id_persona)
  {
    try {
      $sql = "SELECT id_usuario, id_persona, nombre_usuario, estado, rol FROM usuarios WHERE id_persona = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id_persona]);
      return $stmt->fetch(PDO::FETCH_OBJ);
    } catch (Exception $e) {
      return false;
    }
  }
}
