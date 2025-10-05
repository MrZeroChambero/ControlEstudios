<?php

use Micodigo\Config\Conexion;
use Micodigo\Login\Login;
use Micodigo\Persona\Persona;

function registrarRutasPersona(AltoRouter $router)
{
  // Middleware de autenticación para todas las rutas de personas
  $authMiddleware = function () {
    header('Content-Type: text/html; charset=utf-8');
    if (!isset($_COOKIE['session_token'])) {
      http_response_code(401);
      echo json_encode(['status' => 'error', 'message' => 'Acceso no autorizado. Por favor, inicie sesión.', 'back' => true], JSON_UNESCAPED_UNICODE);
      exit();
    }
    $pdo = Conexion::obtener();
    $login = new Login($pdo);
    // Si el hash no es válido, la sesión no es válida.
    if (!$login->obtenerUsuarioPorHash($_COOKIE['session_token'])) {
      http_response_code(401);
      echo json_encode(['status' => 'error', 'message' => 'Sesión inválida o expirada.', 'back' => true], JSON_UNESCAPED_UNICODE);
      exit();
    }
  };

  /**
   * Función auxiliar para mapear rutas que requieren autenticación.
   * Envuelve el 'target' (la función de la ruta) con el middleware de autenticación.
   * @param string $method El método HTTP (GET, POST, etc.).
   * @param string $route La plantilla de la ruta.
   * @param callable $target La función que se ejecutará si la autenticación es exitosa.
   */
  $mapAuthenticated = function (string $method, string $route, callable $target) use ($router, $authMiddleware) {
    $router->map($method, $route, function (...$params) use ($authMiddleware, $target) {
      $authMiddleware(); // Primero, ejecuta la autenticación
      call_user_func_array($target, $params); // Luego, ejecuta el controlador de la ruta
    });
  };

  // GET /personas - Obtener todas las personas
  $mapAuthenticated('GET', '/personas', function () {
    try {
      $pdo = Conexion::obtener();
      $personas = Persona::consultarTodos($pdo);
      http_response_code(200);
      echo json_encode(['status' => 'success', 'data' => $personas, 'back' => true], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error del servidor al obtener las personas.', 'back' => true], JSON_UNESCAPED_UNICODE);
    }
  });

  // GET /personas/[i:id] - Obtener una persona por su ID
  $mapAuthenticated('GET', '/personas/[i:id]', function ($id) {
    try {
      $pdo = Conexion::obtener();
      $persona = Persona::consultar($pdo, $id);

      if ($persona) {
        http_response_code(200);
        echo json_encode(['status' => 'success', 'data' => $persona, 'back' => true], JSON_UNESCAPED_UNICODE);
      } else {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Persona no encontrada.', 'back' => true], JSON_UNESCAPED_UNICODE);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error del servidor al consultar la persona.', 'back' => true], JSON_UNESCAPED_UNICODE);
    }
  });

  // POST /personas - Crear una nueva persona
  $mapAuthenticated('POST', '/personas', function () {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
      http_response_code(400);
      echo json_encode(['status' => 'error', 'message' => 'Datos JSON inválidos o vacíos.', 'back' => true], JSON_UNESCAPED_UNICODE);
      return;
    }

    $persona = new Persona($data);
    try {
      $pdo = Conexion::obtener();
      $resultado = $persona->crear($pdo);

      if (is_numeric($resultado)) {
        http_response_code(201);
        $persona->id_persona = $resultado;
        echo json_encode(['status' => 'success', 'message' => 'Persona creada exitosamente.', 'data' => $persona, 'back' => true], JSON_UNESCAPED_UNICODE);
      } elseif (is_array($resultado)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Error de validación.', 'errors' => $resultado, 'back' => true], JSON_UNESCAPED_UNICODE);
      } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo crear la persona.', 'back' => true], JSON_UNESCAPED_UNICODE);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage(), 'back' => true], JSON_UNESCAPED_UNICODE);
    }
  });

  // PUT /personas/[i:id] - Actualizar una persona
  $mapAuthenticated('PUT', '/personas/[i:id]', function ($id) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
      http_response_code(400);
      echo json_encode(['status' => 'error', 'message' => 'Datos JSON inválidos.', 'back' => true], JSON_UNESCAPED_UNICODE);
      return;
    }

    try {
      $pdo = Conexion::obtener();
      if (!Persona::consultar($pdo, $id)) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Persona no encontrada.', 'back' => true], JSON_UNESCAPED_UNICODE);
        return;
      }

      $persona = new Persona($data);
      $persona->id_persona = $id;
      $resultado = $persona->actualizar($pdo);

      if ($resultado === true) {
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Persona actualizada exitosamente.', 'back' => true], JSON_UNESCAPED_UNICODE);
      } elseif (is_array($resultado)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Error de validación.', 'errors' => $resultado, 'back' => true], JSON_UNESCAPED_UNICODE);
      } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo actualizar la persona.', 'back' => true], JSON_UNESCAPED_UNICODE);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage(), 'back' => true], JSON_UNESCAPED_UNICODE);
    }
  });

  // DELETE /personas/[i:id] - Eliminar una persona
  $mapAuthenticated('DELETE', '/personas/[i:id]', function ($id) {
    try {
      $pdo = Conexion::obtener();

      // Verificar si la persona existe antes de intentar eliminar
      if (!Persona::consultar($pdo, $id)) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Persona no encontrada.', 'back' => true], JSON_UNESCAPED_UNICODE);
        return;
      }
      $resultado = Persona::eliminar($pdo, $id);

      if ($resultado === true) {
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Persona eliminada exitosamente.', 'back' => true], JSON_UNESCAPED_UNICODE);
      } elseif (is_array($resultado) && isset($resultado['error_fk'])) {
        http_response_code(409); // Conflict
        echo json_encode(['status' => 'error', 'message' => $resultado['error_fk'], 'back' => true], JSON_UNESCAPED_UNICODE);
      } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo eliminar la persona.', 'back' => true], JSON_UNESCAPED_UNICODE);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage(), 'back' => true], JSON_UNESCAPED_UNICODE);
    }
  });
}
