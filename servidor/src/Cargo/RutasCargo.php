<?php

use Micodigo\Cargo\ControladoraCargo;

function registrarRutasCargo(AltoRouter $router)
{
  $controlador = new ControladoraCargo();

  // Middleware de autenticación para todas las rutas de cargos
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

  // GET /cargos - Listar todos los cargos
  $mapAuthenticated('GET', '/cargos', function () use ($controlador) {
    $controlador->listarCargos();
  });

  // GET /cargos/select - Listar cargos para select
  $mapAuthenticated('GET', '/cargos/select', function () use ($controlador) {
    $controlador->listarCargosSelect();
  });

  // GET /cargos/[i:id] - Obtener un cargo por ID
  $mapAuthenticated('GET', '/cargos/[i:id]', function ($id) use ($controlador) {
    $controlador->obtenerCargo($id);
  });

  // GET /cargos/tipo/[a:tipo] - Obtener cargos por tipo
  $mapAuthenticated('GET', '/cargos/tipo/[a:tipo]', function ($tipo) use ($controlador) {
    // Esta función necesitaría ser implementada en la controladora
    // $controlador->listarCargosPorTipo($tipo);
  });

  // POST /cargos - Crear un nuevo cargo
  $mapAuthenticated('POST', '/cargos', function () use ($controlador) {
    $controlador->crearCargo();
  });

  // PUT /cargos/[i:id] - Actualizar un cargo
  $mapAuthenticated('PUT', '/cargos/[i:id]', function ($id) use ($controlador) {
    $controlador->actualizarCargo($id);
  });

  // DELETE /cargos/[i:id] - Eliminar un cargo
  $mapAuthenticated('DELETE', '/cargos/[i:id]', function ($id) use ($controlador) {
    $controlador->eliminarCargo($id);
  });
}
