<?php

use Micodigo\Config\Conexion;
use Micodigo\Login\Login;
use Micodigo\Persona\Persona;

function registrarRutasPersona(
  AltoRouter $router,
  callable $mapAuthenticatedRole = null,
  array $rolesPermitidos = []
) {
  // Instancia de Persona solo para exponer métodos HTTP del trait
  $controlador = new Persona([]);

  if ($mapAuthenticatedRole) {
    $mapAuthenticated = function (string $method, string $route, callable $target) use ($mapAuthenticatedRole, $rolesPermitidos) {
      $mapAuthenticatedRole($method, $route, $target, $rolesPermitidos);
    };
  } else {
    // Middleware de autenticación para todas las rutas de personas (retrocompatibilidad)
    $authMiddleware = function () {
      header('Content-Type: text/html; charset=utf-8');
      if (!isset($_COOKIE['session_token'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Acceso no autorizado. Por favor, inicie sesión.', 'back' => true], JSON_UNESCAPED_UNICODE);
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
  }

  // Rutas CRUD Persona
  $mapAuthenticated('GET', '/personas', [$controlador, 'listarPersonas']);
  $mapAuthenticated('GET', '/personas/[i:id]', [$controlador, 'obtenerPersona']);
  $mapAuthenticated('POST', '/personas', [$controlador, 'crearPersona']);
  $mapAuthenticated('PUT', '/personas/[i:id]', [$controlador, 'actualizarPersona']);
  $mapAuthenticated('PUT', '/personas/estado/[i:id]', [$controlador, 'cambiarEstadoPersona']);
  $mapAuthenticated('DELETE', '/personas/[i:id]', [$controlador, 'eliminarPersona']);
}
