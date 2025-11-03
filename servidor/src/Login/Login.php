<?php

namespace Micodigo\Login;

use PDO;
use Exception;
use Micodigo\Config\Conexion;

class Login
{
  private $pdo;

  public function __construct(PDO $pdo)
  {
    $this->pdo = $pdo;
  }

  /**
   * Valida el nombre de usuario para que contenga solo letras, números y espacios.
   */
  private function _validarNombreUsuario(string $usuario): bool
  {
    // Acepta letras (incluye acentos), números y espacios, al menos 1 caracter
    return (bool) preg_match('/^[\p{L}0-9 ]+$/u', $usuario);
  }

  /**
   * Inicia sesión para un usuario.
   * Retorna array con datos del usuario o lanza Exception en errores de BD.
   */
  public function iniciarSesion(string $nombreUsuario, string $contrasena)
  {
    if (!$this->_validarNombreUsuario($nombreUsuario)) {
      return false;
    }

    try {
      // Buscar usuario activo
      $sql = "SELECT id_usuario, contrasena_hash, rol, nombre_usuario FROM usuarios WHERE nombre_usuario = ? AND estado = 'activo' LIMIT 1";
      $stmt = $this->pdo->prepare($sql);
      if (!$stmt->execute([$nombreUsuario])) {
        $err = $stmt->errorInfo();
        throw new Exception("Error SQL select usuario: " . ($err[2] ?? json_encode($err)));
      }

      $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
      if (!$usuario || !password_verify($contrasena, $usuario['contrasena_hash'] ?? '')) {
        // credenciales inválidas
        return false;
      }

      // Generar hash de sesión
      $hashSesion = bin2hex(random_bytes(32));
      $idUsuario = (int) $usuario['id_usuario'];

      // Borrar sesiones previas del usuario (columna fk_usuario en sesiones_usuario)
      $sqlDelete = "DELETE FROM sesiones_usuario WHERE fk_usuario = ?";
      $stmtDelete = $this->pdo->prepare($sqlDelete);
      if ($stmtDelete === false || !$stmtDelete->execute([$idUsuario])) {
        $err = $stmtDelete->errorInfo();
        throw new Exception("Error SQL delete sesiones: " . ($err[2] ?? json_encode($err)));
      }

      // Insertar nueva sesión (tabla sesiones_usuario: fk_usuario, hash_sesion, fecha_inicio, fecha_vencimiento)
      $sqlInsert = "INSERT INTO sesiones_usuario (fk_usuario, hash_sesion, fecha_inicio, fecha_vencimiento) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR))";
      $stmtInsert = $this->pdo->prepare($sqlInsert);
      if ($stmtInsert === false || !$stmtInsert->execute([$idUsuario, $hashSesion])) {
        $err = $stmtInsert->errorInfo();
        throw new Exception("Error SQL insert sesión: " . ($err[2] ?? json_encode($err)));
      }

      // Establecer cookie de sesión (para desarrollo: secure=false)
      $cookieOptions = [
        'expires' => time() + 86400,
        'path' => '/',
        'domain' => '', // dejar vacío para localhost
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Lax'
      ];
      setcookie('session_token', $hashSesion, $cookieOptions);

      // Devolver datos sin hash
      return [
        'id_usuario' => $idUsuario,
        'nombre_usuario' => $usuario['nombre_usuario'],
        'rol' => $usuario['rol'],
      ];
    } catch (Exception $e) {
      // Lanzar excepción para que el router pueda devolver detalle en 500 (útil para depuración)
      throw new Exception("Login error: " . $e->getMessage());
    }
  }

  public function cerrarSesion(string $hashSesion): bool
  {
    try {
      $sql = "DELETE FROM sesiones_usuario WHERE hash_sesion = ?";
      $stmt = $this->pdo->prepare($sql);
      return $stmt->execute([$hashSesion]);
    } catch (Exception $e) {
      throw new Exception("Cerrar sesión error: " . $e->getMessage());
    }
  }

  public static function verificarSesion(string $hashSesion): bool
  {
    try {
      $pdo = Conexion::obtener();
      $login = new self($pdo);
      return $login->obtenerUsuarioPorHash($hashSesion) !== false;
    } catch (Exception $e) {
      // Propagar para que el middleware lo registre si es necesario
      throw new Exception("Verificar sesión error: " . $e->getMessage());
    }
  }

  public function obtenerUsuarioPorHash(string $hashSesion)
  {
    try {
      // Borrar caducadas
      $sqlDelete = "DELETE FROM sesiones_usuario WHERE fecha_vencimiento < NOW()";
      $this->pdo->exec($sqlDelete);

      $sql = "SELECT u.id_usuario, u.nombre_usuario, u.rol FROM sesiones_usuario s JOIN usuarios u ON s.fk_usuario = u.id_usuario WHERE s.hash_sesion = ? LIMIT 1";
      $stmt = $this->pdo->prepare($sql);
      if (!$stmt->execute([$hashSesion])) {
        $err = $stmt->errorInfo();
        throw new Exception("Error SQL obtener usuario por hash: " . ($err[2] ?? json_encode($err)));
      }

      $user = $stmt->fetch(PDO::FETCH_ASSOC);
      return $user ?: false;
    } catch (Exception $e) {
      throw new Exception("obtenerUsuarioPorHash error: " . $e->getMessage());
    }
  }

  public function refrescarSesion(int $idUsuario)
  {
    try {
      $nuevoHash = bin2hex(random_bytes(32));
      $sqlUpdate = "UPDATE sesiones_usuario SET hash_sesion = ?, fecha_inicio = NOW(), fecha_vencimiento = DATE_ADD(NOW(), INTERVAL 24 HOUR) WHERE fk_usuario = ?";
      $stmtUpdate = $this->pdo->prepare($sqlUpdate);
      if ($stmtUpdate === false || !$stmtUpdate->execute([$nuevoHash, $idUsuario])) {
        $err = $stmtUpdate->errorInfo();
        throw new Exception("Error SQL refrescar sesión: " . ($err[2] ?? json_encode($err)));
      }

      // Actualizar cookie
      $cookieOptions = [
        'expires' => time() + 86400,
        'path' => '/',
        'domain' => '',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Lax'
      ];
      setcookie('session_token', $nuevoHash, $cookieOptions);

      return $this->_obtenerDatosUsuario($idUsuario);
    } catch (Exception $e) {
      throw new Exception("refrescarSesion error: " . $e->getMessage());
    }
  }

  private function _obtenerDatosUsuario(int $idUsuario)
  {
    try {
      $sql = "SELECT nombre_usuario, rol FROM usuarios WHERE id_usuario = ? LIMIT 1";
      $stmt = $this->pdo->prepare($sql);
      if (!$stmt->execute([$idUsuario])) {
        $err = $stmt->errorInfo();
        throw new Exception("Error SQL obtener datos usuario: " . ($err[2] ?? json_encode($err)));
      }
      return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception(" _obtenerDatosUsuario error: " . $e->getMessage());
    }
  }

  public function esAdministrador(string $hashSesion): bool
  {
    $usuario = $this->obtenerUsuarioPorHash($hashSesion);
    return $usuario && (strtolower($usuario['rol']) === 'administrador' || $usuario['rol'] === 'Administrador');
  }

  public function esDocente(string $hashSesion): bool
  {
    $usuario = $this->obtenerUsuarioPorHash($hashSesion);
    return $usuario && (strtolower($usuario['rol']) === 'docente' || $usuario['rol'] === 'Docente');
  }

  public function esEstudiante(string $hashSesion): bool
  {
    $usuario = $this->obtenerUsuarioPorHash($hashSesion);
    return $usuario && (strtolower($usuario['rol']) === 'estudiante' || $usuario['rol'] === 'Estudiante');
  }

  public function esRepresentante(string $hashSesion): bool
  {
    $usuario = $this->obtenerUsuarioPorHash($hashSesion);
    return $usuario && (strtolower($usuario['rol']) === 'representante' || $usuario['rol'] === 'Representante');
  }
}
