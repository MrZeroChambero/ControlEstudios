<?php

use Micodigo\Representate\Representante;
use Micodigo\Config\Conexion;

function registrarRutasRepresentante(AltoRouter $router)
{
  $controlador = new Representante();

  $authMiddleware = function () {
    header('Content-Type: text/html; charset=utf-8');
    if (!isset($_COOKIE['session_token'])) {
      http_response_code(401);
      echo json_encode(['status' => 'error', 'message' => 'Acceso no autorizado. Por favor, inicie sesión.', 'back' => true], JSON_UNESCAPED_UNICODE);
      exit();
    }
    $pdo = Conexion::obtener();
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

  $mapAuthenticated('GET', '/representantes', [$controlador, 'listarRepresentantes']);
  $mapAuthenticated('GET', '/representantes/personas-candidatas', [$controlador, 'listarPersonasCandidatas']);
  $mapAuthenticated('POST', '/representantes/persona', [$controlador, 'crearRepresentante']);
  $mapAuthenticated('GET', '/representantes/[i:id]', [$controlador, 'obtenerRepresentanteCompleto']);
  $mapAuthenticated('PUT', '/representantes/[i:id]', [$controlador, 'actualizarRepresentante']);
  $mapAuthenticated('DELETE', '/representantes/[i:id]', [$controlador, 'eliminarRepresentante']);
}
