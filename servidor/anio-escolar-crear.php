<?php

require_once __DIR__ . '/vendor/autoload.php';

use Micodigo\Config\Conexion;
use Micodigo\SistemaAnioEscolar\AnioEscolar;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode([
    'success' => false,
    'message' => 'Método no permitido. Utilice POST.',
    'data' => [],
    'errors' => ['metodo' => ['Solo se permite POST.']],
    'consoleLog' => 'console.log("Método HTTP inválido para crear año escolar")',
  ]);
  exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);
if (!is_array($payload)) {
  echo json_encode([
    'success' => false,
    'message' => 'Formato de datos inválido.',
    'data' => [],
    'errors' => ['payload' => ['Se esperaba JSON válido.']],
    'consoleLog' => 'console.log("Payload inválido en creación de año escolar")',
  ]);
  exit;
}

try {
  $pdo = Conexion::obtener();
  $servicio = new AnioEscolar($pdo);
  $respuesta = $servicio->crear($payload);
  echo json_encode($respuesta, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
  echo json_encode([
    'success' => false,
    'message' => 'Error inesperado al crear el año escolar.',
    'data' => [],
    'errors' => ['exception' => [$e->getMessage()]],
    'consoleLog' => 'console.log("Excepción al crear año escolar: ' . addslashes($e->getMessage()) . '")',
  ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}
