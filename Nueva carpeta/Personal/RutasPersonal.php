<?php

use Micodigo\Personal\ControladoraPersonal;
use Micodigo\Config\Conexion;
use Micodigo\Login\Login;

function registrarRutasPersonal(AltoRouter $router)
{
  // Middleware de autenticación mejorado
  $authMiddleware = function () {
    header('Content-Type: application/json; charset=utf-8');

    if (!isset($_COOKIE['session_token'])) {
      http_response_code(401);
      echo json_encode([
        'status' => 'error',
        'message' => 'Acceso no autorizado. Por favor, inicie sesión.',
        'back' => true
      ], JSON_UNESCAPED_UNICODE);
      exit();
    }

    try {
      $pdo = Conexion::obtener();
      $login = new Login($pdo);

      if (!$login->obtenerUsuarioPorHash($_COOKIE['session_token'])) {
        http_response_code(401);
        echo json_encode([
          'status' => 'error',
          'message' => 'Sesión inválida o expirada.',
          'back' => true
        ], JSON_UNESCAPED_UNICODE);
        exit();
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode([
        'status' => 'error',
        'message' => 'Error de autenticación.',
        'back' => true
      ], JSON_UNESCAPED_UNICODE);
      exit();
    }
  };

  /**
   * Función auxiliar para mapear rutas que requieren autenticación
   */
  $mapAuthenticated = function (string $method, string $route, callable $target) use ($router, $authMiddleware) {
    $router->map($method, $route, function (...$params) use ($authMiddleware, $target) {
      $authMiddleware();
      call_user_func_array($target, $params);
    });
  };

  $controlador = new ControladoraPersonal();

  // ============================ RUTAS DE PERSONAL ============================

  // GET /personal - Listar todo el personal
  $mapAuthenticated('GET', '/personal', [$controlador, 'listarPersonal']);

  // GET /personal/personas-candidatas - Listar personas disponibles para personal
  $mapAuthenticated('GET', '/personal/personas-candidatas', [$controlador, 'listarPersonasParaPersonal']);

  // GET /personal/[i:id] - Obtener personal completo por ID
  $mapAuthenticated('GET', '/personal/[i:id]', [$controlador, 'obtenerPersonalCompleto']);

  // POST /personal/persona - Crear nueva persona (parte 1)
  $mapAuthenticated('POST', '/personal/persona', [$controlador, 'crearPersona']);

  // POST /personal/persona/[i:id]/completar - Completar datos de personal (parte 2)
  $mapAuthenticated('POST', '/personal/persona/[i:id]/completar', [$controlador, 'completarPersonal']);

  // PUT /personal/[i:id] - Actualizar personal existente
  $mapAuthenticated('PUT', '/personal/[i:id]', [$controlador, 'actualizarPersonal']);

  // PATCH /personal/[i:id]/estado - Cambiar estado del personal
  $mapAuthenticated('PATCH', '/personal/[i:id]/estado', [$controlador, 'cambiarEstadoPersonal']);

  // DELETE /personal/[i:id] - Eliminar personal
  $mapAuthenticated('DELETE', '/personal/[i:id]', [$controlador, 'eliminarPersonal']);

  // ============================ RUTAS DE CONSULTA ============================

  // GET /personal/cargos - Listar cargos disponibles
  $mapAuthenticated('GET', '/personal/cargos', [$controlador, 'listarCargos']);

  // GET /personal/funciones - Listar funciones disponibles
  $mapAuthenticated('GET', '/personal/funciones', [$controlador, 'listarFunciones']);

  // ============================ RUTAS ADICIONALES ============================

  // GET /personal/estadisticas - Obtener estadísticas del personal
  $mapAuthenticated('GET', '/personal/estadisticas', function () use ($controlador) {
    // Esta ruta podría implementarse para mostrar estadísticas
    http_response_code(501);
    echo json_encode([
      'status' => 'error',
      'message' => 'Funcionalidad en desarrollo',
      'back' => true
    ], JSON_UNESCAPED_UNICODE);
  });

  // GET /personal/buscar/[s:termino] - Búsqueda de personal
  $mapAuthenticated('GET', '/personal/buscar/[s:termino]', function ($termino) use ($controlador) {
    // Implementar búsqueda si es necesario
    http_response_code(501);
    echo json_encode([
      'status' => 'error',
      'message' => 'Búsqueda no implementada',
      'back' => true
    ], JSON_UNESCAPED_UNICODE);
  });
}
