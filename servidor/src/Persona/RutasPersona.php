<?php

use Micodigo\Config\Conexion;
use Micodigo\Login\Login;
use Micodigo\Persona\Persona;

function registrarRutasPersona(AltoRouter $router)
{
  // Middleware de autenticación para todas las rutas de personas
  $authMiddleware = function () {
    if (!isset($_COOKIE['session_token']) || !Login::verificarSesion($_COOKIE['session_token'])) {
      http_response_code(401);
      echo json_encode(['status' => 'error', 'message' => 'Acceso no autorizado. Por favor, inicie sesión.']);
      exit();
    }
  };

  $router->before('GET|POST|PUT|DELETE', '/personas.*', $authMiddleware);

  // GET /personas - Obtener todas las personas
  $router->map('GET', '/personas', function () {
    try {
      $pdo = Conexion::obtener();
      $personas = Persona::consultarTodos($pdo);
      http_response_code(200);
      echo json_encode(['status' => 'success', 'data' => $personas]);
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error del servidor al obtener las personas.']);
    }
  });

  // GET /personas/[i:id] - Obtener una persona por su ID
  $router->map('GET', '/personas/[i:id]', function ($id) {
    try {
      $pdo = Conexion::obtener();
      $persona = Persona::consultar($pdo, $id);

      if ($persona) {
        http_response_code(200);
        echo json_encode(['status' => 'success', 'data' => $persona]);
      } else {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Persona no encontrada.']);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error del servidor al consultar la persona.']);
    }
  });

  // POST /personas - Crear una nueva persona
  $router->map('POST', '/personas', function () {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
      http_response_code(400);
      echo json_encode(['status' => 'error', 'message' => 'Datos JSON inválidos o vacíos.']);
      return;
    }

    $persona = new Persona($data);
    try {
      $pdo = Conexion::obtener();
      $resultado = $persona->crear($pdo);

      if (is_numeric($resultado)) {
        http_response_code(201);
        $persona->id_persona = $resultado;
        echo json_encode(['status' => 'success', 'message' => 'Persona creada exitosamente.', 'data' => $persona]);
      } elseif (is_array($resultado)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Error de validación.', 'errors' => $resultado]);
      } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo crear la persona.']);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage()]);
    }
  });

  // PUT /personas/[i:id] - Actualizar una persona
  $router->map('PUT', '/personas/[i:id]', function ($id) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
      http_response_code(400);
      echo json_encode(['status' => 'error', 'message' => 'Datos JSON inválidos.']);
      return;
    }

    try {
      $pdo = Conexion::obtener();
      if (!Persona::consultar($pdo, $id)) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Persona no encontrada.']);
        return;
      }

      $persona = new Persona($data);
      $persona->id_persona = $id;
      $resultado = $persona->actualizar($pdo);

      if ($resultado === true) {
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Persona actualizada exitosamente.']);
      } elseif (is_array($resultado)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Error de validación.', 'errors' => $resultado]);
      } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo actualizar la persona.']);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage()]);
    }
  });

  // DELETE /personas/[i:id] - Eliminar una persona
  $router->map('DELETE', '/personas/[i:id]', function ($id) {
    try {
      $pdo = Conexion::obtener();

      // Verificar si la persona existe antes de intentar eliminar
      if (!Persona::consultar($pdo, $id)) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Persona no encontrada.']);
        return;
      }
      $resultado = Persona::eliminar($pdo, $id);

      if ($resultado === true) {
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Persona eliminada exitosamente.']);
      } elseif (is_array($resultado) && isset($resultado['error_fk'])) {
        http_response_code(409); // Conflict
        echo json_encode(['status' => 'error', 'message' => $resultado['error_fk']]);
      } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo eliminar la persona.']);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage()]);
    }
  });
}
