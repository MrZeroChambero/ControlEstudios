<?php
require __DIR__ . '/servidor/vendor/autoload.php';
// Especifica la codificación UTF-8 y tipo por defecto para la API
header('Content-Type: application/json; charset=utf-8');

// --- Manejo de CORS y solicitudes OPTIONS (pre-flight) ---
$allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
  // En respuesta a peticiones del navegador hay que devolver exactamente el Origin
  header("Access-Control-Allow-Origin: {$origin}");
  header('Access-Control-Allow-Credentials: true');
  // Para que caches intermedios no devuelvan un origen erróneo
  header('Vary: Origin');
} else {
  // Si quieres permitir cualquier origen (no recomendado con cookies) usa:
  // header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
header('Access-Control-Expose-Headers: Content-Length, Content-Type');

// Responder preflight y salir
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  // Devuelve 200 con cabeceras CORS ya enviadas arriba
  http_response_code(200);
  exit;
}

// --- Enrutamiento ---
// Incluimos el administrador de rutas, que nos devolverá el enrutador ya configurado.
require_once __DIR__ . '/servidor/src/AdminRutas.php';
$router = registrarTodasLasRutas();

// --- Despachador ---
$match = $router->match();

if ($match) {
  $target = $match['target'];
  $params = $match['params'] ?? [];
  $args = is_array($params) ? array_values($params) : [];

  // DEBUG opcional:
  // error_log("DEBUG router target: " . (is_string($target) ? $target : 'closure/array'));
  // error_log("DEBUG router args: " . json_encode($args));

  call_user_func_array($target, $args);
} else {
  http_response_code(404);
  header("Content-Type: application/json");
  echo json_encode([
    'status' => 'error',
    'message' => 'Ruta no encontrada',
    'details' => "El recurso solicitado en la URL '{$_SERVER['REQUEST_URI']}' no fue encontrado en este servidor. Por favor, verifique la URL.",
    'back' => true
  ], JSON_UNESCAPED_UNICODE);
}
