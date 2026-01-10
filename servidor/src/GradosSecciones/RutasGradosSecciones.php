<?php

use Micodigo\GradosSecciones\GradosSecciones;

function registrarRutasGradosSecciones(
  AltoRouter $router,
  callable $mapAuthenticatedRole = null,
  array $rolesPermitidos = []
) {
  $controlador = new GradosSecciones();

  if ($mapAuthenticatedRole) {
    $mapAuthenticated = function (string $method, string $route, callable $target) use ($mapAuthenticatedRole, $rolesPermitidos) {
      $mapAuthenticatedRole($method, $route, $target, $rolesPermitidos);
    };
  } else {
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
  }

  $mapAuthenticated('GET', '/grados_secciones', [$controlador, 'listarGradosSecciones']);
  $mapAuthenticated('GET', '/grados_secciones/[i:id]', [$controlador, 'obtenerGradoSeccion']);
  $mapAuthenticated('POST', '/grados_secciones', [$controlador, 'crearGradoSeccion']);
  $mapAuthenticated('PUT', '/grados_secciones/[i:id]', [$controlador, 'actualizarGradoSeccion']);
  $mapAuthenticated('DELETE', '/grados_secciones/[i:id]', [$controlador, 'eliminarGradoSeccion']);
}
