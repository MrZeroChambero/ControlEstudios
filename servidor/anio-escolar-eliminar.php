<?php

require_once __DIR__ . '/vendor/autoload.php';

use Micodigo\Config\Conexion;
use Micodigo\SistemaAnioEscolar\AnioEscolar;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
  http_response_code(405);
  echo json_encode([
    'success' => false,
    'message' => 'Método no permitido. Utilice DELETE.',
    'data' => [],
    'errors' => ['metodo' => ['Solo se permite DELETE.']],
    'consoleLog' => 'console.log("Método HTTP inválido para eliminar año escolar")',
  ]);
  exit;
}

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$id) {
  echo json_encode([
    'success' => false,
    'message' => 'Debe proporcionar el identificador del año escolar.',
    'data' => [],
    'errors' => ['id' => ['Parámetro id obligatorio.']],
    'consoleLog' => 'console.log("ID ausente en eliminación de año escolar")',
  ]);
  exit;
}

try {
  $pdo = Conexion::obtener();
  $servicio = new AnioEscolar($pdo);
  $respuesta = $servicio->eliminar($id);
  echo json_encode($respuesta, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
  echo json_encode([
    'success' => false,
    'message' => 'Error inesperado al eliminar el año escolar.',
    'data' => [],
    'errors' => ['exception' => [$e->getMessage()]],
    'consoleLog' => 'console.log("Excepción al eliminar año escolar: ' . addslashes($e->getMessage()) . '")',
  ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}
