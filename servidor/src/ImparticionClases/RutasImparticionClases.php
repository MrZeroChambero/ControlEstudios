<?php

use Micodigo\ImparticionClases\ImparticionClases;

function registrarRutasImparticionClases(AltoRouter $router)
{
  $controlador = new ImparticionClases();

  $authMiddleware = function () {
    header('Content-Type: text/html; charset=utf-8');
    if (!isset($_COOKIE['session_token'])) {
      http_response_code(401);
      echo json_encode(['status' => 'error', 'message' => 'Acceso no autorizado. Por favor, inicie sesión.', 'back' => true], JSON_UNESCAPED_UNICODE);
      exit();
    }
    $pdo = Micodigo\Config\Conexion::obtener();
    $login = new Micodigo\Login\Login($pdo);
    if (!$login->obtenerUsuarioPorHash($_COOKIE['session_token'])) {
      http_response_code(401);
      echo json_encode(['status' => 'error', 'message' => 'Sesión inválida o expirada.', 'back' => true], JSON_UNESCAPED_UNICODE);
      exit();
    }
  };

  $mapAuthenticated = function (string $method, string $route, callable $target) use ($router, $authMiddleware) {
    $router->map($method, $route, function (...$params) use ($authMiddleware, $target) {
      $authMiddleware();
      call_user_func_array($target, $params);
    });
  };

  $mapAuthenticated('GET', '/imparticion_clases', [$controlador, 'listarImparticiones']);
  $mapAuthenticated('GET', '/imparticion_clases/[i:id]', [$controlador, 'obtenerImparticion']);
  $mapAuthenticated('POST', '/imparticion_clases', [$controlador, 'crearImparticion']);
  $mapAuthenticated('PUT', '/imparticion_clases/[i:id]', [$controlador, 'actualizarImparticion']);
  $mapAuthenticated('DELETE', '/imparticion_clases/[i:id]', [$controlador, 'eliminarImparticion']);
}
