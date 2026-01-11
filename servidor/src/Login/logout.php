<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Micodigo\Config\Conexion;
use Micodigo\Login\Login;
use Micodigo\Utils\RespuestaJson;

// --- Configuración de Cabeceras CORS ---
// Reemplaza http://localhost:5173 con el origen de tu aplicación React
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

RespuestaJson::habilitarBuffer();

// Manejo de la solicitud OPTIONS (pre-flight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// --- Lógica de Cierre de Sesión ---

if (isset($_COOKIE['session_token'])) {
  $hashSesion = $_COOKIE['session_token'];

  try {
    $pdo = Conexion::obtener();
    $login = new Login($pdo);

    // 1. Eliminar la sesión de la base de datos
    $login->cerrarSesion($hashSesion);

    // 2. Indicar al navegador que elimine la cookie
    // Se establece una cookie con el mismo nombre, pero con una fecha de expiración en el pasado.
    setcookie('session_token', '', time() - 3600, '/');

    RespuestaJson::exito(null, 'Sesión cerrada correctamente.', 200, [
      'msg' => 'Sesión cerrada correctamente.'
    ]);
  } catch (Exception $e) {
    RespuestaJson::error(
      'Error en el servidor al cerrar la sesión.',
      500,
      null,
      $e,
      ['msg' => 'Error en el servidor al cerrar la sesión.']
    );
  }
} else {
  RespuestaJson::error(
    'No se encontró una sesión activa.',
    400,
    null,
    null,
    ['msg' => 'No se encontró una sesión activa.']
  );
}
