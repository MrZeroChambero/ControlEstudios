<?php
require 'vendor/autoload.php';

use AltoRouter as Router; // Asegúrate de que AltoRouter esté disponible
use Micodigo\Conexion\Conexion;


// --- Manejo de solicitudes OPTIONS (pre-flight) ---
// Esto es crucial para que las peticiones con 'withCredentials' funcionen
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  header("Access-Control-Allow-Origin: http://localhost:5173");
  header("Access-Control-Allow-Credentials: true");
  header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
  header("Access-Control-Allow-Headers: Content-Type, Authorization");
  http_response_code(204); // No Content
  exit();
}

// --- Enrutamiento ---
$router = new Router();

// Establece la base de la URL si tu proyecto no está en la raíz del dominio
// Ejemplo: si tu API está en /controlestudios/servidor/, la base es /controlestudios/servidor
$router->setBasePath('/controlestudios/servidor');

// Incluye y registra las rutas de autenticación
require_once __DIR__ . '/Login/RutasLogin.php';
registrarRutasLogin($router);

// Aquí puedes incluir otros archivos de rutas en el futuro
// require_once __DIR__ . '/RutasUsuarios.php';
// registrarRutasUsuarios($router);

// --- Despachador ---
$match = $router->match();

if ($match) {
  // Si la ruta es válida, ejecuta la función asociada.
  $target = $match['target'];
  $params = $match['params'];

  // Como el target es una función anónima, la llamamos directamente.
  // La conexión a la BD se obtiene dentro de cada función de ruta.
  call_user_func_array($target, $params);
} else {
  // No se encontró la ruta.
  http_response_code(404);
  header("Content-Type: application/json");
  echo json_encode([
    'status' => 'error',
    'message' => 'Ruta no encontrada',
    'details' => "El recurso solicitado en la URL '{$_SERVER['REQUEST_URI']}' no fue encontrado en este servidor. Por favor, verifique la URL."
  ]);
}
