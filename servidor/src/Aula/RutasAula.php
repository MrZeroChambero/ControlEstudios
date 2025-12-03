<?php

use Micodigo\Aula\Aula;

function registrarRutasAula(AltoRouter $router)
{
  $controlador = new Aula();

  // Middleware de autenticación (igual que en RutasPersonal)
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

  $mapAuthenticated('GET', '/aulas/apertura', [$controlador, 'obtenerResumenAulas']);
  $mapAuthenticated('POST', '/aulas/apertura', [$controlador, 'aperturarAulas']);
  $mapAuthenticated('PATCH', '/aulas/[i:id]/cupos', [$controlador, 'actualizarCuposAula']);

  $mapAuthenticated('GET', '/aulas', [$controlador, 'listarAulas']);
  $mapAuthenticated('GET', '/aulas/listar-select', [$controlador, 'listarAulasSelect']);
  $mapAuthenticated('GET', '/aulas/[i:id]', [$controlador, 'obtenerAula']);
  $mapAuthenticated('POST', '/aulas', [$controlador, 'crearAula']);
  $mapAuthenticated('PUT', '/aulas/[i:id]', [$controlador, 'actualizarAula']);
  $mapAuthenticated('PATCH', '/aulas/[i:id]/estado', [$controlador, 'cambiarEstadoAula']);
  $mapAuthenticated('DELETE', '/aulas/[i:id]', [$controlador, 'eliminarAula']);
}
