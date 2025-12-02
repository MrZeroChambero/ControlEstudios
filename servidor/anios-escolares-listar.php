<?php

require_once __DIR__ . '/vendor/autoload.php';

use Micodigo\Config\Conexion;
use Micodigo\SistemaAnioEscolar\AnioEscolar;

header('Content-Type: application/json; charset=utf-8');

try {
  $pdo = Conexion::obtener();
  $servicio = new AnioEscolar($pdo);
  $respuesta = $servicio->listar();
  echo json_encode($respuesta, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
  $fallback = [
    'success' => false,
    'message' => 'Error al listar los años escolares.',
    'data' => [],
    'errors' => ['exception' => [$e->getMessage()]],
    'consoleLog' => 'console.log("Error al listar años escolares: ' . addslashes($e->getMessage()) . '")',
  ];
  echo json_encode($fallback, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}
