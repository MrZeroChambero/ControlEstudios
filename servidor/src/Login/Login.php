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
      $sql = "SELECT id_usuario, contrasena, rol, nombre_usuario FROM usuarios WHERE nombre_usuario = ? AND estado = 'activo' LIMIT 1";
      $stmt = $this->pdo->prepare($sql);
      $stmt->execute([$nombreUsuario]);
      $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

      if ($usuario && password_verify($contrasena, $usuario['contrasena'])) {
        // Generar un hash de sesión seguro.
        $hashSesion = bin2hex(random_bytes(32));
        $idUsuario = $usuario['id_usuario'];

        // Eliminar sesiones anteriores del mismo usuario para evitar duplicados.
        $sqlDelete = "DELETE FROM sesiones_usuario WHERE id_usuario = ?";
        $stmtDelete = $this->pdo->prepare($sqlDelete);
        $stmtDelete->execute([$idUsuario]);

        // Registrar la nueva sesión en la base de datos.
        $sqlInsert = "INSERT INTO sesiones_usuario (id_usuario, hash_sesion, fecha_inicio_sesion) VALUES (?, ?, NOW())";
        $stmtInsert = $this->pdo->prepare($sqlInsert);
        $stmtInsert->execute([$idUsuario, $hashSesion]);

        return [
          'id_usuario' => $idUsuario,
          'nombre_usuario' => $usuario['nombre_usuario'],
          'rol' => $usuario['rol'],
          'hash_sesion' => $hashSesion,
        ];
      }
      return false;
    } catch (Exception $e) {
      // Manejo de errores de la base de datos
      return false;
    }
  }

  /**
   * Cierra la sesión de un usuario.
   *
   * @param int $idUsuario El ID del usuario.
   * @param string $hashSesion El hash de la sesión a borrar.
   * @return bool Verdadero si la sesión se cerró exitosamente.
   */
  public function cerrarSesion(int $idUsuario, string $hashSesion): bool
  {
    try {
      $sql = "DELETE FROM sesiones_usuario WHERE id_usuario = ? AND hash_sesion = ?";
      $stmt = $this->pdo->prepare($sql);
      return $stmt->execute([$idUsuario, $hashSesion]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica si un usuario tiene una sesión activa y válida.
   *
   * @param int $idUsuario El ID del usuario.
   * @param string $hashSesion El hash de la sesión a verificar.
   * @return bool Verdadero si la sesión es válida y activa.
   */
  public function verificarSesion(int $idUsuario, string $hashSesion): bool
  {
    try {
      // Eliminar sesiones caducadas (más de 24 horas).
      $sqlDelete = "DELETE FROM sesiones_usuario WHERE fecha_inicio_sesion < DATE_SUB(NOW(), INTERVAL 24 HOUR)";
      $this->pdo->exec($sqlDelete);

      // Verificar si el hash de sesión existe para el usuario.
      $sql = "SELECT COUNT(*) FROM sesiones_usuario WHERE id_usuario = ? AND hash_sesion = ?";
      $stmt = $this->pdo->prepare($sql);
      $stmt->execute([$idUsuario, $hashSesion]);

      return $stmt->fetchColumn() > 0;
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
      $sqlUpdate = "UPDATE sesiones_usuario SET hash_sesion = ?, fecha_inicio_sesion = NOW() WHERE id_usuario = ?";
      $stmtUpdate = $this->pdo->prepare($sqlUpdate);

      if ($stmtUpdate->execute([$nuevoHash, $idUsuario])) {
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
   * @param int $idUsuario El ID del usuario.
   * @param string $hashSesion El hash de la sesión a verificar.
   * @return bool Verdadero si la sesión es válida y el rol es 'administrador'.
   */
  public function esAdministrador(int $idUsuario, string $hashSesion): bool
  {
    if (!$this->verificarSesion($idUsuario, $hashSesion)) {
      return false;
    }
    $datos = $this->_obtenerDatosUsuario($idUsuario);
    return $datos && $datos['rol'] === 'administrador';
  }

  /**
   * Verifica si un usuario tiene el rol de "docente".
   *
   * @param int $idUsuario El ID del usuario.
   * @param string $hashSesion El hash de la sesión a verificar.
   * @return bool Verdadero si la sesión es válida y el rol es 'docente'.
   */
  public function esDocente(int $idUsuario, string $hashSesion): bool
  {
    if (!$this->verificarSesion($idUsuario, $hashSesion)) {
      return false;
    }
    $datos = $this->_obtenerDatosUsuario($idUsuario);
    return $datos && $datos['rol'] === 'docente';
  }

  /**
   * Verifica si un usuario tiene el rol de "estudiante".
   *
   * @param int $idUsuario El ID del usuario.
   * @param string $hashSesion El hash de la sesión a verificar.
   * @return bool Verdadero si la sesión es válida y el rol es 'estudiante'.
   */
  public function esEstudiante(int $idUsuario, string $hashSesion): bool
  {
    if (!$this->verificarSesion($idUsuario, $hashSesion)) {
      return false;
    }
    $datos = $this->_obtenerDatosUsuario($idUsuario);
    return $datos && $datos['rol'] === 'estudiante';
  }

  /**
   * Verifica si un usuario tiene el rol de "representante".
   *
   * @param int $idUsuario El ID del usuario.
   * @param string $hashSesion El hash de la sesión a verificar.
   * @return bool Verdadero si la sesión es válida y el rol es 'representante'.
   */
  public function esRepresentante(int $idUsuario, string $hashSesion): bool
  {
    if (!$this->verificarSesion($idUsuario, $hashSesion)) {
      return false;
    }
    $datos = $this->_obtenerDatosUsuario($idUsuario);
    return $datos && $datos['rol'] === 'representante';
  }
}
