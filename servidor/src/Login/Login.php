<?php

namespace Micodigo\Login;

use PDO;
use Exception;


class Login
{
  private $pdo;

  public function __construct(PDO $pdo)
  {
    $this->pdo = $pdo;
  }

  /**
   * Valida el nombre de usuario para que contenga solo letras, números y un solo espacio.
   * @param string $usuario El nombre de usuario a validar.
   * @return bool Verdadero si el nombre de usuario es válido, falso en caso contrario.
   */
  private function _validarNombreUsuario(string $usuario): bool
  {
    return preg_match('/^[a-zA-Z0-9\p{L} ]*$/u', $usuario);
  }

  /**
   * Inicia sesión para un usuario.
   *
   * @param string $nombreUsuario El nombre de usuario.
   * @param string $contrasena La contraseña.
   * @return array|false Un array con los datos del usuario si las credenciales son válidas, de lo contrario, false.
   */
  public function iniciarSesion(string $nombreUsuario, string $contrasena)
  {
    if (!$this->_validarNombreUsuario($nombreUsuario)) {
      // El nombre de usuario contiene caracteres no permitidos.
      return false;
    }

    try {
      // Se busca al usuario por su nombre y se verifica si está activo.      
      $sql = "SELECT id_usuario, contrasena_hash, rol, nombre_usuario FROM usuarios WHERE nombre_usuario = ? AND estado = 'activo' LIMIT 1";
      $stmt = $this->pdo->prepare($sql);
      $stmt->execute([$nombreUsuario]);
      $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

      if (!($usuario && password_verify($contrasena, $usuario['contrasena_hash']))) {
        // Credenciales incorrectas.
        return false;
      }

      // Generar un hash de sesión seguro.
      $hashSesion = bin2hex(random_bytes(32));
      $idUsuario = $usuario['id_usuario'];

      // Eliminar sesiones anteriores del mismo usuario para evitar duplicados.
      $sqlDelete = "DELETE FROM sesiones_usuario WHERE id_usuario = ?";
      $stmtDelete = $this->pdo->prepare($sqlDelete);
      $stmtDelete->execute([$idUsuario]);

      // Registrar la nueva sesión en la base de datos con fecha de inicio y fecha de vencimiento (24 horas).
      $sqlInsert = "INSERT INTO sesiones_usuario (id_usuario, hash_sesion, fecha_inicio, fecha_vencimiento) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR))";
      $stmtInsert = $this->pdo->prepare($sqlInsert);
      $stmtInsert->execute([$idUsuario, $hashSesion]);

      // Opciones de la cookie para mayor seguridad
      $cookieOptions = [
        'expires' => time() + (86400 * 1), // Expira en 1 día
        'path' => '/',
        'domain' => '', // Dejar en blanco para localhost, especificar dominio en producción
        'secure' => false, // ¡IMPORTANTE! Cambiar a 'true' en producción (cuando uses HTTPS)
        'httponly' => true, // La cookie no es accesible por JavaScript
        'samesite' => 'Lax' // 'Strict' o 'Lax'. 'Lax' es un buen balance.
      ];
      setcookie('session_token', $hashSesion, $cookieOptions);

      // Devolvemos los datos del usuario, pero ya no el hash de sesión.
      return [
        'id_usuario' => $idUsuario,
        'nombre_usuario' => $usuario['nombre_usuario'],
        'rol' => $usuario['rol'],
      ];
    } catch (Exception $e) {
      // Manejo de errores de la base de datos

      return false;
    }
  }

  /**
   * Cierra la sesión de un usuario.
   *
   * @param string $hashSesion El hash de la sesión a borrar.
   * @return bool Verdadero si la sesión se cerró exitosamente.
   */
  public function cerrarSesion(string $hashSesion): bool
  {
    try {
      // El hash de sesión es único, no necesitamos el id_usuario.
      $sql = "DELETE FROM sesiones_usuario WHERE hash_sesion = ?";
      $stmt = $this->pdo->prepare($sql);
      return $stmt->execute([$hashSesion]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica si un hash de sesión es válido y no ha expirado.
   * Es un método estático para poder ser usado como middleware.
   *
   * @param string $hashSesion El hash de la sesión a verificar.
   * @return bool Verdadero si la sesión es válida, de lo contrario, falso.
   */
  public static function verificarSesion(string $hashSesion): bool
  {
    try {
      $pdo = Conexion::obtener();
      $login = new self($pdo);
      return $login->obtenerUsuarioPorHash($hashSesion) !== false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Obtiene los datos de un usuario a partir de un hash de sesión válido.
   *
   * @param string $hashSesion El hash de la sesión a verificar.
   * @return array|false Un array con los datos del usuario si la sesión es válida, de lo contrario, false.
   */
  public function obtenerUsuarioPorHash(string $hashSesion)
  {
    try {
      // Eliminar sesiones caducadas según la columna fecha_vencimiento.
      $sqlDelete = "DELETE FROM sesiones_usuario WHERE fecha_vencimiento < NOW()";
      $this->pdo->exec($sqlDelete);

      // Verificar si el hash de sesión existe y obtener los datos del usuario asociado.
      $sql = "SELECT u.id_usuario, u.nombre_usuario, u.rol FROM sesiones_usuario s JOIN usuarios u ON s.id_usuario = u.id_usuario WHERE s.hash_sesion = ?";
      $stmt = $this->pdo->prepare($sql);
      $stmt->execute([$hashSesion]);

      return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Genera un nuevo hash de sesión y lo actualiza en la base de datos.
   *
   * @param int $idUsuario El ID del usuario.
   * @return string|false El nuevo hash de sesión o falso si hay un error.
   */
  public function refrescarSesion(int $idUsuario)
  {
    try {
      $nuevoHash = bin2hex(random_bytes(32));
      // Actualiza hash, fecha de inicio y fecha de vencimiento (24 horas desde ahora)
      $sqlUpdate = "UPDATE sesiones_usuario SET hash_sesion = ?, fecha_inicio_sesion = NOW(), fecha_vencimiento = DATE_ADD(NOW(), INTERVAL 24 HOUR) WHERE id_usuario = ?";
      $stmtUpdate = $this->pdo->prepare($sqlUpdate);

      if ($stmtUpdate->execute([$nuevoHash, $idUsuario])) {
        // Actualizar cookie del cliente también
        $cookieOptions = [
          'expires' => time() + (86400 * 1),
          'path' => '/',
          'domain' => '',
          'secure' => false,
          'httponly' => true,
          'samesite' => 'Lax'
        ];
        setcookie('session_token', $nuevoHash, $cookieOptions);

        return $this->_obtenerDatosUsuario($idUsuario);
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Obtiene el nombre de usuario y rol de un usuario.
   *
   * @param int $idUsuario El ID del usuario.
   * @return array|false El nombre de usuario y rol del usuario, o falso si no se encuentra.
   */
  private function _obtenerDatosUsuario(int $idUsuario)
  {
    try {
      $sql = "SELECT nombre_usuario, rol FROM usuarios WHERE id_usuario = ? LIMIT 1";
      $stmt = $this->pdo->prepare($sql);
      $stmt->execute([$idUsuario]);
      return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica si un usuario tiene el rol de "administrador".
   *
   * @param string $hashSesion El hash de la sesión a verificar.
   * @return bool Verdadero si la sesión es válida y el rol es 'administrador'.
   */
  public function esAdministrador(string $hashSesion): bool
  {
    $usuario = $this->obtenerUsuarioPorHash($hashSesion);
    return $usuario && $usuario['rol'] === 'administrador';
  }

  /**
   * Verifica si un usuario tiene el rol de "docente".
   *
   * @param string $hashSesion El hash de la sesión a verificar.
   * @return bool Verdadero si la sesión es válida y el rol es 'docente'.
   */
  public function esDocente(string $hashSesion): bool
  {
    $usuario = $this->obtenerUsuarioPorHash($hashSesion);
    return $usuario && $usuario['rol'] === 'docente';
  }

  /**
   * Verifica si un usuario tiene el rol de "estudiante".
   *
   * @param string $hashSesion El hash de la sesión a verificar.
   * @return bool Verdadero si la sesión es válida y el rol es 'estudiante'.
   */
  public function esEstudiante(string $hashSesion): bool
  {
    $usuario = $this->obtenerUsuarioPorHash($hashSesion);
    return $usuario && $usuario['rol'] === 'estudiante';
  }

  /**
   * Verifica si un usuario tiene el rol de "representante".
   *
   * @param string $hashSesion El hash de la sesión a verificar.
   * @return bool Verdadero si la sesión es válida y el rol es 'representante'.
   */
  public function esRepresentante(string $hashSesion): bool
  {
    $usuario = $this->obtenerUsuarioPorHash($hashSesion);
    return $usuario && $usuario['rol'] === 'representante';
  }
}
