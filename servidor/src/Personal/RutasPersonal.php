<?php

use Micodigo\Config\Conexion;
use Micodigo\Personal\Personal;

/**
 * Define rutas CRUD para personal (seguir patrón de Persona/RutasPersona.php)
 */
function registrarRutasPersonal(AltoRouter $router)
{
  // Reusar middleware de autenticación como en Persona/RutasPersona.php
  $mapAuthenticated = function ($method, $path, $target) use ($router) {
    $router->map($method, $path, function () use ($target) {
      header('Content-Type: text/html; charset=utf-8');
      if (!isset($_COOKIE['session_token'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Acceso no autorizado. Por favor, inicie sesión.', 'back' => true], JSON_UNESCAPED_UNICODE);
        exit();
      }
      $pdo = Conexion::obtener();
      $login = new \Micodigo\Login\Login($pdo);
      if (!$login->obtenerUsuarioPorHash($_COOKIE['session_token'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Sesión inválida.'], JSON_UNESCAPED_UNICODE);
        exit();
      }
      call_user_func_array($target, func_get_args());
    });
  };

  // GET /personal
  $mapAuthenticated('GET', '/personal', function () {
    try {
      $pdo = Conexion::obtener();
      $items = Personal::consultarTodosConPersona($pdo);
      http_response_code(200);
      echo json_encode(['status' => 'success', 'data' => $items, 'back' => true], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error al obtener personal.', 'back' => true], JSON_UNESCAPED_UNICODE);
    }
  });

  // GET /personal/[i:id]
  $mapAuthenticated('GET', '/personal/[i:id]', function ($id) {
    try {
      $pdo = Conexion::obtener();
      $item = Personal::consultarConPersona($pdo, $id);
      if ($item) {
        http_response_code(200);
        echo json_encode(['status' => 'success', 'data' => $item, 'back' => true], JSON_UNESCAPED_UNICODE);
      } else {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Personal no encontrado.', 'back' => true], JSON_UNESCAPED_UNICODE);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error del servidor.', 'back' => true], JSON_UNESCAPED_UNICODE);
    }
  });

  // POST /personal
  $mapAuthenticated('POST', '/personal', function () {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
      http_response_code(400);
      echo json_encode(['status' => 'error', 'message' => 'Datos JSON inválidos.', 'back' => true], JSON_UNESCAPED_UNICODE);
      return;
    }
    try {
      $pdo = Conexion::obtener();
      $personal = new Personal($data);
      $resultado = $personal->crear($pdo);
      if (is_numeric($resultado)) {
        http_response_code(201);
        $personal->id_personal = $resultado;
        echo json_encode(['status' => 'success', 'message' => 'Personal creado.', 'data' => $personal, 'back' => true], JSON_UNESCAPED_UNICODE);
      } elseif (is_array($resultado)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Errores de validación.', 'errors' => $resultado, 'back' => true], JSON_UNESCAPED_UNICODE);
      } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo crear personal.', 'back' => true], JSON_UNESCAPED_UNICODE);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error del servidor: ' . $e->getMessage(), 'back' => true], JSON_UNESCAPED_UNICODE);
    }
  });

  // PUT /personal/[i:id]
  $mapAuthenticated('PUT', '/personal/[i:id]', function ($id) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
      http_response_code(400);
      echo json_encode(['status' => 'error', 'message' => 'Datos JSON inválidos.', 'back' => true], JSON_UNESCAPED_UNICODE);
      return;
    }
    try {
      $pdo = Conexion::obtener();
      $personal = new Personal($data);
      $personal->id_personal = $id;
      $resultado = $personal->actualizar($pdo);
      if ($resultado === true) {
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Personal actualizado.', 'data' => $personal, 'back' => true], JSON_UNESCAPED_UNICODE);
      } elseif (is_array($resultado)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Errores de validación.', 'errors' => $resultado, 'back' => true], JSON_UNESCAPED_UNICODE);
      } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo actualizar personal.', 'back' => true], JSON_UNESCAPED_UNICODE);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error del servidor: ' . $e->getMessage(), 'back' => true], JSON_UNESCAPED_UNICODE);
    }
  });

  // PUT /personal/estado/[i:id]
  $mapAuthenticated('PUT', '/personal/estado/[i:id]', function ($id) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['estado'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'El estado es requerido.', 'back' => true], JSON_UNESCAPED_UNICODE);
        return;
    }

    try {
        $pdo = Conexion::obtener();
        $resultado = Personal::cambiarEstado($pdo, $id, $data['estado']);

        if ($resultado === true) {
            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Estado del personal actualizado exitosamente.', 'back' => true], JSON_UNESCAPED_UNICODE);
        } elseif (is_array($resultado)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Error de validación.', 'errors' => $resultado, 'back' => true], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'No se pudo actualizar el estado del personal.', 'back' => true], JSON_UNESCAPED_UNICODE);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage(), 'back' => true], JSON_UNESCAPED_UNICODE);
    }
  });

  // DELETE /personal/[i:id]
  $mapAuthenticated('DELETE', '/personal/[i:id]', function ($id) {
    try {
      $pdo = Conexion::obtener();
      $resultado = Personal::eliminar($pdo, $id);
      if ($resultado === true) {
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Personal eliminado.', 'back' => true], JSON_UNESCAPED_UNICODE);
      } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo eliminar personal.', 'back' => true], JSON_UNESCAPED_UNICODE);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error del servidor: ' . $e->getMessage(), 'back' => true], JSON_UNESCAPED_UNICODE);
    }
  });
}
