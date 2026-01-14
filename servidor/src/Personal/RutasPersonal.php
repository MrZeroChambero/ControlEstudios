<?php

use Micodigo\Config\Conexion;
use Micodigo\Login\Login;
use Micodigo\Personal\Personal;

function registrarRutasPersonal(
  AltoRouter $router,
  callable $mapAuthenticatedRole = null,
  array $rolesPermitidos = []
): void {
  $controlador = new Personal();

  if ($mapAuthenticatedRole) {
    $mapAuthenticated = function (string $method, string $route, callable $target) use ($mapAuthenticatedRole, $rolesPermitidos) {
      $mapAuthenticatedRole($method, $route, $target, $rolesPermitidos);
    };
  } else {
    // Middleware de autenticación (retrocompatibilidad)
    $authMiddleware = function () {
      header('Content-Type: application/json; charset=utf-8');
      if (!isset($_COOKIE['session_token'])) {
        http_response_code(401);
        echo json_encode([
          'status' => 'error',
          'message' => 'Acceso no autorizado. Por favor, inicie sesión.',
          'back' => true,
        ], JSON_UNESCAPED_UNICODE);
        exit();
      }
      $pdo = Conexion::obtener();
      $login = new Login($pdo);
      if (!$login->obtenerUsuarioPorHash($_COOKIE['session_token'])) {
        http_response_code(401);
        echo json_encode([
          'status' => 'error',
          'message' => 'Sesión inválida o expirada.',
          'back' => true,
        ], JSON_UNESCAPED_UNICODE);
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

  // Rutas de Personal
  $mapAuthenticated('GET', '/personal', [$controlador, 'listarPersonal']);
  $mapAuthenticated('GET', '/personal/personas-candidatas', [$controlador, 'listarPersonasParaPersonal']);
  $mapAuthenticated('GET', '/personal/[i:id]', [$controlador, 'obtenerPersonalCompleto']);
  $mapAuthenticated('POST', '/personal/persona', [$controlador, 'crearPersona']);
  $mapAuthenticated('POST', '/personal/persona/[i:id]/completar', [$controlador, 'completarPersonal']);
  $mapAuthenticated('PUT', '/personal/[i:id]', [$controlador, 'actualizarPersonal']);
  $mapAuthenticated('PATCH', '/personal/[i:id]/estado', [$controlador, 'cambiarEstadoPersonal']);
  $mapAuthenticated('DELETE', '/personal/[i:id]', [$controlador, 'eliminarPersonal']);
  $mapAuthenticated('GET', '/personal/cargos', [$controlador, 'listarCargos']);
}
