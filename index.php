<?php

use Micodigo\Utils\RespuestaJson;

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

RespuestaJson::habilitarBuffer();

$emitirErrorJson = static function (string $mensaje, string $detalle, array $extra = []): void {
  static $respuestaEmitida = false;
  if ($respuestaEmitida) {
    return;
  }

  $respuestaEmitida = true;

  while (ob_get_level() > 0) {
    ob_end_clean();
  }

  RespuestaJson::error(
    $mensaje,
    200,
    null,
    $detalle,
    array_merge([
      'php_error' => true,
      'error_detail' => $detalle,
    ], $extra)
  );
};

set_exception_handler(static function (Throwable $ex) use ($emitirErrorJson): void {
  $detalle = sprintf('%s en %s:%d', $ex->getMessage(), $ex->getFile(), $ex->getLine());
  $emitirErrorJson('Se produjo una excepción en el servidor.', $detalle, [
    'exception' => get_class($ex),
  ]);
});

set_error_handler(static function (
  int $severity,
  string $message,
  ?string $file = null,
  ?int $line = null
) use ($emitirErrorJson) {
  $tiposCriticos = [
    E_ERROR,
    E_PARSE,
    E_CORE_ERROR,
    E_COMPILE_ERROR,
    E_USER_ERROR,
    E_RECOVERABLE_ERROR,
  ];

  if (!in_array($severity, $tiposCriticos, true)) {
    return false;
  }

  $detalle = sprintf('%s en %s:%d', $message, $file ?? 'archivo_desconocido', $line ?? 0);
  $emitirErrorJson('Se produjo un error crítico en el servidor.', $detalle, [
    'severity' => $severity,
  ]);
  return true;
});

register_shutdown_function(static function () use ($emitirErrorJson): void {
  $ultimoError = error_get_last();
  if (!$ultimoError) {
    return;
  }

  $tiposFatales = [
    E_ERROR,
    E_PARSE,
    E_CORE_ERROR,
    E_COMPILE_ERROR,
    E_USER_ERROR,
  ];

  if (!in_array($ultimoError['type'], $tiposFatales, true)) {
    return;
  }

  $detalle = sprintf('%s en %s:%d', $ultimoError['message'], $ultimoError['file'], $ultimoError['line']);
  $emitirErrorJson('Se produjo un error fatal en el servidor.', $detalle, [
    'severity' => $ultimoError['type'],
  ]);
});

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
  $uriSolicitada = $_SERVER['REQUEST_URI'] ?? '';
  $detalle = "El recurso solicitado en la URL '{$uriSolicitada}' no fue encontrado en este servidor.";
  RespuestaJson::error(
    'Ruta no encontrada',
    404,
    null,
    $detalle,
    ['details' => $detalle]
  );
}
