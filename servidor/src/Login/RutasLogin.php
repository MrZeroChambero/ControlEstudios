<?php

use Micodigo\Config\Conexion;
use Micodigo\Login\Login;

/**
 * Registra las rutas de autenticación.
 *
 * @param AltoRouter $router
 */
function registrarRutasLogin(AltoRouter $router)
{
  // POST /iniciar-sesion (cuerpo JSON)
  $router->map('POST', '/iniciar-sesion', function () {
    header('Content-Type: application/json; charset=utf-8');

    $raw = file_get_contents('php://input');
    error_log("DEBUG iniciar-sesion body: " . $raw);
    $datos = json_decode($raw, true) ?: [];

    $username = trim((string)($datos['username'] ?? $datos['usuario'] ?? ''));
    $password = (string)($datos['password'] ?? $datos['contrasena'] ?? '');

    if ($username === '' || $password === '') {
      http_response_code(400);
      echo json_encode(['back' => false, 'msg' => 'Usuario y contraseña son requeridos.'], JSON_UNESCAPED_UNICODE);
      return;
    }

    try {
      $pdo = Conexion::obtener();
      $login = new Login($pdo);

      $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
      $resultado = $login->iniciarSesion($username, $password, $ip);

      if (empty($resultado['success'])) {
        $codigo = $resultado['http_code'] ?? 401;
        http_response_code($codigo);
        echo json_encode([
          'back' => false,
          'msg' => $resultado['message'] ?? 'Credenciales incorrectas.',
          'bloqueo' => $resultado['bloqueo'] ?? null,
          'intentos' => $resultado['intentos'] ?? null,
        ], JSON_UNESCAPED_UNICODE);
        return;
      }

      http_response_code(200);
      $response = [
        'back' => true,
        'msg' => 'Inicio de sesión exitoso.',
        'data' => $resultado['data'] ?? [],
        'token' => $_COOKIE['session_token'] ?? null
      ];
      echo json_encode($response, JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
      error_log('ERROR iniciar-sesion POST: ' . $e->getMessage());
      http_response_code(500);
      // incluir mensaje del error SQL para depuración
      echo json_encode(['back' => false, 'msg' => 'Error en el servidor al iniciar sesión.', 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
  });

  // GET /iniciar-sesion/[:username]/[:password]  (o /iniciar-sesion?username=...&password=...)
  $router->map('GET', '/iniciar-sesion/[:username]/[:password]', function ($username = null, $password = null) {
    header('Content-Type: application/json; charset=utf-8');

    $username = trim((string)($username ?? $_GET['username'] ?? ''));
    $password = (string)($password ?? $_GET['password'] ?? '');

    if ($username === '' || $password === '') {
      http_response_code(400);
      echo json_encode(['back' => false, 'msg' => 'Usuario y contraseña son requeridos (GET).'], JSON_UNESCAPED_UNICODE);
      return;
    }

    try {
      $pdo = Conexion::obtener();
      $login = new Login($pdo);

      $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
      $resultado = $login->iniciarSesion($username, $password, $ip);

      if (empty($resultado['success'])) {
        $codigo = $resultado['http_code'] ?? 401;
        http_response_code($codigo);
        echo json_encode([
          'back' => false,
          'msg' => $resultado['message'] ?? 'Credenciales incorrectas.',
          'bloqueo' => $resultado['bloqueo'] ?? null,
          'intentos' => $resultado['intentos'] ?? null,
        ], JSON_UNESCAPED_UNICODE);
        return;
      }

      http_response_code(200);
      $response = [
        'back' => true,
        'msg' => 'Inicio de sesión exitoso.',
        'data' => $resultado['data'] ?? [],
        'token' => $_COOKIE['session_token'] ?? null
      ];
      echo json_encode($response, JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
      error_log('ERROR iniciar-sesion GET: ' . $e->getMessage());
      http_response_code(500);
      echo json_encode(['back' => false, 'msg' => 'Error en el servidor al iniciar sesión (GET).', 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
  });

  // Soporte directo por query string: /iniciar-sesion?username=...&password=...
  $router->map('GET', '/iniciar-sesion', function () {
    // Reutiliza la lógica anterior leyendo $_GET
    header('Content-Type: application/json; charset=utf-8');

    $username = trim((string)($_GET['username'] ?? ''));
    $password = (string)($_GET['password'] ?? '');

    if ($username === '' || $password === '') {
      http_response_code(400);
      echo json_encode(['back' => false, 'msg' => 'Usuario y contraseña son requeridos (GET).'], JSON_UNESCAPED_UNICODE);
      return;
    }

    try {
      $pdo = Conexion::obtener();
      $login = new Login($pdo);

      $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
      $resultado = $login->iniciarSesion($username, $password, $ip);

      if (empty($resultado['success'])) {
        $codigo = $resultado['http_code'] ?? 401;
        http_response_code($codigo);
        echo json_encode([
          'back' => false,
          'msg' => $resultado['message'] ?? 'Credenciales incorrectas.',
          'bloqueo' => $resultado['bloqueo'] ?? null,
          'intentos' => $resultado['intentos'] ?? null,
        ], JSON_UNESCAPED_UNICODE);
        return;
      }

      http_response_code(200);
      $response = [
        'back' => true,
        'msg' => 'Inicio de sesión exitoso.',
        'data' => $resultado['data'] ?? [],
        'token' => $_COOKIE['session_token'] ?? null
      ];
      echo json_encode($response, JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
      error_log('ERROR iniciar-sesion GET qs: ' . $e->getMessage());
      http_response_code(500);
      echo json_encode(['back' => false, 'msg' => 'Error en el servidor al iniciar sesión (GET qs).', 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
  });

  // POST /cerrar-sesion
  $router->map('POST', '/cerrar-sesion', function () {
    header('Content-Type: application/json; charset=utf-8');
    try {
      if (isset($_COOKIE['session_token'])) {
        $hashSesion = $_COOKIE['session_token'];
        $pdo = Conexion::obtener();
        $login = new Login($pdo);
        $login->cerrarSesion($hashSesion);
        setcookie('session_token', '', time() - 3600, '/');
      }
      http_response_code(200);
      echo json_encode(['back' => true, 'msg' => 'Sesión cerrada.'], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
      error_log('ERROR cerrar-sesion: ' . $e->getMessage());
      http_response_code(500);
      echo json_encode(['back' => false, 'msg' => 'Error al cerrar sesión.', 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
  });

  // GET /verificar-sesion
  $router->map('GET', '/verificar-sesion', function () {
    header('Content-Type: application/json; charset=utf-8');

    if (!isset($_COOKIE['session_token'])) {
      http_response_code(401);
      echo json_encode(['back' => false, 'msg' => 'No hay sesión activa.'], JSON_UNESCAPED_UNICODE);
      return;
    }

    try {
      $hash = $_COOKIE['session_token'];
      $pdo = Conexion::obtener();
      $login = new Login($pdo);
      $user = $login->obtenerUsuarioPorHash($hash);

      if ($user) {
        http_response_code(200);
        $response = [
          'back' => true,
          'msg' => 'Sesión válida.',
          'data' => $user,
          'token' => $hash
        ];
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
      } else {
        setcookie('session_token', '', time() - 3600, '/');
        http_response_code(401);
        echo json_encode(['back' => false, 'msg' => 'Sesión inválida o expirada.'], JSON_UNESCAPED_UNICODE);
      }
    } catch (Exception $e) {
      error_log('ERROR verificar-sesion: ' . $e->getMessage());
      http_response_code(500);
      echo json_encode(['back' => false, 'msg' => 'Error en el servidor al verificar la sesión.', 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
  });
}
