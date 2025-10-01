<?php
require __DIR__ . '/servidor/vendor/autoload.php';

// --- Manejo de CORS y solicitudes OPTIONS (pre-flight) ---
// Esto es crucial para que las peticiones con 'withCredentials' desde otro puerto funcionen
if (isset($_SERVER['HTTP_ORIGIN'])) {
  // Permite el origen de tu app React. Es más seguro que usar '*'.
  header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
  header('Access-Control-Allow-Credentials: true');
  header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
  }
  if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
    header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
  }
  exit(0);
}

// --- Enrutamiento ---
// Incluimos el administrador de rutas, que nos devolverá el enrutador ya configurado.
require_once __DIR__ . '/servidor/src/AdminRutas.php';
$router = registrarTodasLasRutas();

// --- Despachador ---
$match = $router->match();

if ($match) {
  // Si la ruta es válida, ejecuta la función asociada.
  $target = $match['target'];
  $params = $match['params'];
  call_user_func_array($target, $params);
} else {
  // No se encontró la ruta.
  http_response_code(404);
  header("Content-Type: application/json");
  echo json_encode([
    'status' => 'error',
    'message' => 'Ruta no encontrada',
    'details' => "El recurso solicitado en la URL '{$_SERVER['REQUEST_URI']}' no fue encontrado en este servidor. Por favor, verifique la URL.",
    'back' => true
  ]);
}
