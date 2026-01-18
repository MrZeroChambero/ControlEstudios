<?php

namespace Micodigo\Login;

use PDO;
use Exception;
use Micodigo\Config\Conexion;
use Micodigo\Bloqueos\Bloqueos;

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
  public function iniciarSesion(string $nombreUsuario, string $contrasena, ?string $ip = null): array
  {
    $bloqueos = new Bloqueos();

    if ($ip !== null) {
      $estadoBloqueoIp = $bloqueos->verificarBloqueoIp($this->pdo, $ip, Bloqueos::TIPO_LOGIN);
      if ($estadoBloqueoIp) {
        $minutosIp = max(1, (int) $estadoBloqueoIp['duracion_minutos']);
        return [
          'success' => false,
          'reason' => 'ip_bloqueada',
          'message' => 'Demasiados intentos fallidos desde esta direccion IP. Intenta nuevamente en ' . Bloqueos::formatearMinutos($minutosIp) . '.',
          'http_code' => 423,
          'bloqueo' => $estadoBloqueoIp,
        ];
      }
    }

    if (!$this->_validarNombreUsuario($nombreUsuario)) {
      $registroIp = null;
      if ($ip !== null) {
        $registroIp = $bloqueos->registrarIntentoFallidoIp($this->pdo, $ip, Bloqueos::TIPO_LOGIN, 5);
        if (!empty($registroIp['bloqueado'])) {
          $minutosIp = max(1, (int) ($registroIp['duracion_minutos'] ?? 1));
          return [
            'success' => false,
            'reason' => 'ip_bloqueada',
            'message' => 'Demasiados intentos fallidos desde esta direccion IP. Intenta nuevamente en ' . Bloqueos::formatearMinutos($minutosIp) . '.',
            'http_code' => 423,
            'bloqueo' => $registroIp,
          ];
        }
      }

      return [
        'success' => false,
        'reason' => 'credenciales',
        'message' => 'Credenciales incorrectas.',
        'http_code' => 401,
        'intentos' => $registroIp,
      ];
    }

    try {
      $sql = "SELECT id_usuario, contrasena_hash, rol, nombre_usuario, fk_personal FROM usuarios WHERE nombre_usuario = ? AND estado = 'activo' LIMIT 1";
      $stmt = $this->pdo->prepare($sql);
      if (!$stmt->execute([$nombreUsuario])) {
        $err = $stmt->errorInfo();
        throw new Exception("Error SQL select usuario: " . ($err[2] ?? json_encode($err)));
      }

      $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

      // Usuario no encontrado
      if (!$usuario) {
        if ($ip !== null) {
          // registrar intento fallido por IP
          try {
            $bloqueos->registrarIntentoFallidoIp($this->pdo, $ip, Bloqueos::TIPO_LOGIN, 5);
          } catch (Exception $e) {
            // no interrumpir por errores de registro
          }
        }

        return [
          'success' => false,
          'reason' => 'credenciales',
          'message' => 'Credenciales incorrectas.',
          'http_code' => 401,
        ];
      }

      $idUsuario = (int) ($usuario['id_usuario'] ?? 0);
      $hashAlmacenado = $usuario['contrasena_hash'] ?? null;

      // Verificar contraseña
      if (!$hashAlmacenado || !password_verify($contrasena, $hashAlmacenado)) {
        // Registrar intento fallido por usuario y por IP
        try {
          $bloqueos->registrarIntentoFallido($this->pdo, $idUsuario, Bloqueos::TIPO_LOGIN, 5);
        } catch (Exception $e) {
          // ignorar errores de registro
        }
        if ($ip !== null) {
          try {
            $bloqueos->registrarIntentoFallidoIp($this->pdo, $ip, Bloqueos::TIPO_LOGIN, 5);
          } catch (Exception $e) {
          }
        }

        return [
          'success' => false,
          'reason' => 'credenciales',
          'message' => 'Credenciales incorrectas.',
          'http_code' => 401,
        ];
      }

      // Credenciales correctas -> crear o actualizar sesión
      try {
        $nuevoHash = bin2hex(random_bytes(32));

        // Intentar actualizar sesión existente
        $stmtUpdate = $this->pdo->prepare('UPDATE sesiones_usuario SET hash_sesion = ?, fecha_inicio = NOW(), fecha_vencimiento = DATE_ADD(NOW(), INTERVAL 24 HOUR) WHERE fk_usuario = ?');
        $stmtUpdate->execute([$nuevoHash, $idUsuario]);

        // Si no existen filas afectadas, insertar nueva sesión
        if ($stmtUpdate->rowCount() === 0) {
          $stmtInsert = $this->pdo->prepare('INSERT INTO sesiones_usuario (fk_usuario, hash_sesion, fecha_inicio, fecha_vencimiento) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR))');
          $stmtInsert->execute([$idUsuario, $nuevoHash]);
        }

        // Establecer cookie de sesión
        $cookieOptions = [
          'expires' => time() + 86400,
          'path' => '/',
          'domain' => '',
          'secure' => false,
          'httponly' => true,
          'samesite' => 'Lax'
        ];
        setcookie('session_token', $nuevoHash, $cookieOptions);
      } catch (Exception $e) {
        throw new Exception('Error al crear sesión: ' . $e->getMessage());
      }

      // Limpiar registros de bloqueo si los hubo
      try {
        $bloqueos->limpiar($this->pdo, $idUsuario, Bloqueos::TIPO_LOGIN);
      } catch (Exception $e) {
        // silencioso
      }

      return [
        'success' => true,
        'data' => [
          'id_usuario' => $idUsuario,
          'nombre_usuario' => $usuario['nombre_usuario'],
          'rol' => $usuario['rol'],
          'fk_personal' => $usuario['fk_personal'],
        ],
      ];
    } catch (Exception $e) {
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

      $sql = "SELECT u.id_usuario, u.nombre_usuario, u.rol, u.fk_personal FROM sesiones_usuario s JOIN usuarios u ON s.fk_usuario = u.id_usuario WHERE s.hash_sesion = ? LIMIT 1";
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
    return $usuario && (strtolower($usuario['rol']) === 'director' || $usuario['rol'] === 'Director');
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
