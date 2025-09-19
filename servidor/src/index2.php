<?php
require 'vendor/autoload.php';

use AltoRouter as Router;
use Micodigo\Config\Conect as Database;

// Establecer cabeceras para permitir CORS (necesario para React).
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Manejar las solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit();
}

// Obtener la conexión a la base de datos desde la clase de configuración.
$pdo = Database::conectar();

// 1. Inicializa el router aquí, antes de incluir las rutas.
$router = new Router();
$basePath = '/';
$router->setBasePath($basePath);

// 2. Aquí, "incluyes" el archivo de rutas para que AltoRouter las conozca.
require 'routes/auth.php';
// Si tienes más archivos de rutas, los agregarías aquí.
// require 'routes/users.php';
// require 'routes/courses.php';

// 3. AltoRouter ahora tiene todas las rutas cargadas y puede hacer el "match".
$match = $router->match();

if ($match) {
  // Si la ruta es válida, ejecuta la función asociada.
  $target = $match['target'];
  $params = $match['params'];

  if (is_callable($target)) {
    call_user_func_array($target, [$pdo, $params]);
  } else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Target de ruta no ejecutable']);
  }
} else {
  // No se encontró la ruta.
  http_response_code(404);
  echo json_encode(['status' => 'error', 'message' => 'Ruta no encontrada']);
}
