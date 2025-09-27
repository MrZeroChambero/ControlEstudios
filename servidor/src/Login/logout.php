<?php

// Carga el autoloader de Composer
require_once __DIR__ . '/../vendor/autoload.php';

use Micodigo\Conexion\Conexion;
use Micodigo\Login\Login;

// --- Configuración de Cabeceras CORS ---
// Reemplaza http://localhost:5173 con el origen de tu aplicación React
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Manejo de la solicitud OPTIONS (pre-flight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204); // No Content
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

    http_response_code(200);
    echo json_encode(['msg' => 'Sesión cerrada correctamente.']);
  } catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['msg' => 'Error en el servidor al cerrar la sesión.']);
  }
} else {
  http_response_code(400);
  echo json_encode(['msg' => 'No se encontró una sesión activa.']);
}
