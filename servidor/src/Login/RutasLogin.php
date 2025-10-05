<?php

use Micodigo\Config\Conexion;


use Micodigo\Login\Login;

/**
 * Define las rutas de autenticación (login, logout, verify-session).
 *
 * @param AltoRouter $router La instancia del enrutador.
 */
function registrarRutasLogin(AltoRouter $router)
{

  $router->map('POST', '/iniciar-sesion', function () {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($username) || empty($password)) {
      http_response_code(400); // Bad Request
      echo json_encode(['msg' => 'Usuario y contraseña son requeridos.', 'back' => true], JSON_UNESCAPED_UNICODE);
      return;
    }

    try {
      $pdo = Conexion::obtener();
      $login = new Login($pdo);
      $userData = $login->iniciarSesion($username, $password);


      if ($userData) {
        http_response_code(200);
        // La cookie ya se establece dentro de iniciarSesion()
        // RutasLogin.php: LÍNEA 39 (CORREGIDA)
        // 1. FUSIONA los arrays que contienen los datos del usuario y el indicador 'back'.
        $responseArray = array_merge($userData, ['back' => true, 'msg' => 'Inicio de sesión exitoso.', 'token' => $_COOKIE['session_token'] ?? null]);

        // 2. CODIFICA el array resultante, usando JSON_UNESCAPED_UNICODE como OPCIÓN de json_encode.
        echo json_encode($responseArray, JSON_UNESCAPED_UNICODE);
      } else {
        http_response_code(401); // Unauthorized
        echo json_encode(['msg' => 'Credenciales incorrectas.', 'back' => true], JSON_UNESCAPED_UNICODE);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['msg' => 'Error en el servidor.', 'back' => true], JSON_UNESCAPED_UNICODE);
    }
  });

  // Endpoint para cerrar sesión
  $router->map('POST', '/cerrar-sesion', function () {
    if (isset($_COOKIE['session_token'])) {
      $hashSesion = $_COOKIE['session_token'];
      $pdo = Conexion::obtener();
      $login = new Login($pdo);
      $login->cerrarSesion($hashSesion);
    }

    // Se le dice al navegador que borre la cookie expirándola
    setcookie('session_token', '', time() - 3600, '/');
    http_response_code(200);
    echo json_encode(['msg' => 'Sesión cerrada.', 'back' => true], JSON_UNESCAPED_UNICODE);
  });

  // Endpoint para verificar la sesión activa
  $router->map('GET', '/verificar-sesion', function () {
    if (!isset($_COOKIE['session_token'])) {
      http_response_code(401); // Unauthorized
      echo json_encode(['msg' => 'No hay sesión activa.', 'back' => true], JSON_UNESCAPED_UNICODE);
      return;
    }

    try {
      $hashSesion = $_COOKIE['session_token'];
      $pdo = Conexion::obtener();
      $login = new Login($pdo);
      $userData = $login->obtenerUsuarioPorHash($hashSesion);

      if ($userData) {
        http_response_code(200);
        // Devolvemos los datos del usuario para que el frontend pueda usarlos
        $responseArray = array_merge($userData, ['back' => true, 'msg' => 'Inicio de sesión exitoso.', 'token' => $_COOKIE['session_token'] ?? null]);

        // 2. CODIFICA el array resultante, usando JSON_UNESCAPED_UNICODE como OPCIÓN de json_encode.
        echo json_encode($responseArray, JSON_UNESCAPED_UNICODE);
      } else {
        // La cookie existe pero no es válida (o expiró), la borramos
        setcookie('session_token', '', time() - 3600, '/');
        http_response_code(401);
        echo json_encode(['msg' => 'Sesión inválida o expirada.', 'back' => true], JSON_UNESCAPED_UNICODE);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['msg' => 'Error en el servidor al verificar la sesión.', 'back' => true], JSON_UNESCAPED_UNICODE);
    }
  });
}
