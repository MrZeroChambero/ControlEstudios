<?php

namespace Micodigo\Usuario;

use PDO;
use Exception;
use Valitron\Validator;
use Usuario\Metodos\Validaciones\ValidarDatos;

class Usuario
{
  public $id_usuario;
  public $id_persona;
  public $nombre_usuario;
  public $clave;

  public $estado;
  public $rol;

  public function __construct(
    ?int $id_persona,
    string $nombre_usuario,
    string $clave,
    string $estado,
    ?string $rol,

  ) {
    $this->id_persona = $id_persona;
    $this->nombre_usuario = $nombre_usuario;
    $this->clave = $clave;
    $this->estado = $estado;
    $this->rol = $rol;
    // Asigna la fecha actual si no se proporciona

  }
  use validarDatos;

  /**
   * Valida los datos del objeto Usuario usando Valitron.
   * @param array $data Los datos a validar.
   * @return array|bool Un array con errores o verdadero si la validación es exitosa.
   */
  // private function _validarDatos(array $data, $isUpdate = false)
  // {
  //   Validator::lang('es');
  //   $v = new Validator($data, [], 'es');

  //   // Regla personalizada
  //   Validator::addRule('notOnlySpaces', function ($field, $value, array $params, array $fields) {
  //       return trim($value) !== '';
  //   }, 'No puede contener solo espacios en blanco.');

  //   // --- Definición de reglas ---
  //   $v->rule('notOnlySpaces', 'nombre_usuario');
  //   $v->rule('numeric', 'id_persona');
  //   $v->rule('in', 'rol', ['Administrador', 'Docente', 'Secretaria', 'Representante']);
  //   $v->rule('in', 'estado', ['activo', 'inactivo', 'incompleto']);
  //   $v->rule('lengthMin', 'nombre_usuario', 3);
  //   $v->rule('lengthMax', 'nombre_usuario', 50);
  //   $v->rule('lengthMax', 'clave', 255);
  //   $v->rule('regex', 'nombre_usuario', '/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/u');

  //   if (!$isUpdate) {
  //       $v->rule('required', ['id_persona', 'nombre_usuario', 'clave', 'estado', 'rol']);
  //   }

  //   // --- Asignación de mensajes personalizados ---
  //   $v->rule('required', 'id_persona')->message('Debe seleccionar una persona.');
  //   $v->rule('numeric', 'id_persona')->message('La persona seleccionada no es válida.');
    
  //   $v->rule('required', 'nombre_usuario')->message('El nombre de usuario es requerido.');
  //   $v->rule('lengthMin', 'nombre_usuario')->message('El nombre de usuario debe tener al menos 3 caracteres.');
  //   $v->rule('lengthMax', 'nombre_usuario')->message('El nombre de usuario no puede exceder los 50 caracteres.');
  //   $v->rule('notOnlySpaces', 'nombre_usuario')->message('El nombre de usuario no puede contener solo espacios.');
  //   $v->rule('regex', 'nombre_usuario')->message('El nombre de usuario solo puede contener letras, números y espacios.');

  //   $v->rule('required', 'clave')->message('La contraseña es requerida.');
  //   $v->rule('lengthMax', 'clave')->message('La contraseña hasheada excede el límite de la base de datos.');

  //   $v->rule('required', 'rol')->message('Debe seleccionar un rol.');
  //   $v->rule('in', 'rol')->message('El rol seleccionado no es válido.');

  //   $v->rule('required', 'estado')->message('El estado es requerido.');
  //   $v->rule('in', 'estado')->message('El estado seleccionado no es válido.');

  //   if ($v->validate()) {
  //       return true;
  //   }
  //   return $v->errors();
  // }

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
   * Crea un nuevo registro de usuario con validación previa.
   * @param PDO $pdo Objeto de conexión a la base de datos.
   * @return int|array|false El ID insertado, un array de errores, o falso si falla.
   */
  public function crear(PDO $pdo)
  {
    // La contraseña ya viene hasheada desde RutasUsuario.php (se asume)
    $data = [
      'id_persona' => $this->id_persona,
      'nombre_usuario' => $this->nombre_usuario,
      'clave' => $this->clave,
      'estado' => "activo",
      'rol' => $this->rol
    ];

    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

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
   * Actualiza los datos de un registro de usuario con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_usuario)) {
      return ['id_usuario' => ['El ID es requerido para la actualización.']];
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
      $sql = "SELECT id_usuario, id_persona, nombre_usuario, estado, rol FROM usuarios";
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
        );
        $usuario->id_usuario = $data['id_usuario'];
        // Oculta la contraseña hash en el objeto antes de devolverlo
        $usuario->clave = null;
        return ['id_persona' => $data['id_persona'], 'nombre_usuario' => $data['nombre_usuario'], 'estado' => $data['estado'], 'rol' => $data['rol']];
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }
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
          $data['rol'],
        );
        $usuario->id_usuario = $data['id_usuario'];
        // Oculta la contraseña hash en el objeto antes de devolverlo

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
      $sql = "SELECT id_usuario, id_persona, nombre_usuario, estado, rol FROM usuarios WHERE id_persona = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id_persona]);
      return $stmt->fetch(PDO::FETCH_OBJ);
    } catch (Exception $e) {
      return false;
    }
  }
}
