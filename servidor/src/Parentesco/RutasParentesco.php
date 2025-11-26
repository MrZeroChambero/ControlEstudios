<?php

use Micodigo\Parentesco\Parentesco;
use Micodigo\Config\Conexion;
use Micodigo\Login\Login;

function registrarRutasParentesco(AltoRouter $router)
{
  $controlador = new Parentesco();

  $authMiddleware = function () {
    header('Content-Type: text/html; charset=utf-8');
    if (!isset($_COOKIE['session_token'])) {
      http_response_code(401);
      echo json_encode(['status' => 'error', 'message' => 'Acceso no autorizado.', 'back' => true], JSON_UNESCAPED_UNICODE);
      exit();
    }
    $pdo = Conexion::obtener();
    $login = new Login($pdo);
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

  // CRUD básico
  $mapAuthenticated('GET', '/parentescos', [$controlador, 'listarParentescos']);
  $mapAuthenticated('GET', '/parentescos/[i:id]', [$controlador, 'obtenerParentesco']);
  $mapAuthenticated('POST', '/parentescos', [$controlador, 'crearParentesco']);
  $mapAuthenticated('PUT', '/parentescos/[i:id]', [$controlador, 'actualizarParentesco']);
  $mapAuthenticated('DELETE', '/parentescos/[i:id]', [$controlador, 'eliminarParentesco']);

  // Consultas específicas
  $mapAuthenticated('GET', '/parentescos/estudiante/[i:id_estudiante]', [$controlador, 'listarPorEstudiante']);
  $mapAuthenticated('GET', '/parentescos/representante/[i:id_representante]', [$controlador, 'listarPorRepresentante']);
  $mapAuthenticated('GET', '/parentescos/tipos', [$controlador, 'listarTipos']);
}
