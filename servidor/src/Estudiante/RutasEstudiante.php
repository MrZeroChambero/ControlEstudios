<?php

use Micodigo\Estudiante\Estudiante;
use Micodigo\Config\Conexion;
use Micodigo\Login\Login;

function registrarRutasEstudiante(AltoRouter $router)
{
  $controlador = new Estudiante();

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

  // Endpoints
  $mapAuthenticated('GET', '/estudiantes', [$controlador, 'listarEstudiantes']);
  $mapAuthenticated('GET', '/estudiantes/candidatos', [$controlador, 'listarCandidatos']);
  $mapAuthenticated('POST', '/estudiantes/candidatos', [$controlador, 'crearCandidato']);
  $mapAuthenticated('POST', '/estudiantes/registrar/[i:id_persona]', [$controlador, 'registrarEstudianteEndpoint']);
  $mapAuthenticated('GET', '/estudiantes/[i:id]', [$controlador, 'obtenerEstudiante']);
  $mapAuthenticated('PUT', '/estudiantes/[i:id]', [$controlador, 'actualizarEstudianteEndpoint']);
  $mapAuthenticated('PATCH', '/estudiantes/[i:id]/estado', [$controlador, 'cambiarEstadoEstudianteEndpoint']);
}
