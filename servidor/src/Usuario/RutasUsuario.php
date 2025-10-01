<?php

use Micodigo\Config\Conexion;
use Micodigo\Usuario\Usuario;

/**
 * Define las rutas para la gestión de Usuarios (CRUD).
 *
 * @param AltoRouter $router La instancia del enrutador.
 */
function registrarRutasUsuario(AltoRouter $router)
{

  // Ruta para OBTENER todos los usuarios
  $router->map('GET', '/usuarios', function () {

    try {
      $pdo = Conexion::obtener();
      $usuarios = Usuario::consultarTodos($pdo);
      http_response_code(200);
      echo json_encode(['status' => 'success', 'message' => 'Usuarios obtenidos exitosamente.', 'back' => 'true', 'data' => $usuarios]);
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'back' => 'true', 'message' => 'Error al obtener los usuarios.']);
    }
  });

  // Ruta para OBTENER un usuario por su ID
  $router->map('GET', '/usuarios/[i:id]', function ($id) {
    try {
      $pdo = Conexion::obtener();
      $usuario = Usuario::consultar($pdo, $id);

      if ($usuario) {
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Usuario obtenido exitosamente.', 'back' => true, 'data' => $usuario]);
      } else {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Usuario no encontrado.', 'back' => true]);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error en el servidor al consultar el usuario.', 'back' => true]);
    }
  });

  // Ruta para CREAR un nuevo usuario
  $router->map('POST', '/usuarios', function () {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
      http_response_code(400);
      echo json_encode(['status' => 'error', 'message' => 'Datos JSON inválidos o vacíos.', 'back' => true]);
      return;
    }

    // ¡IMPORTANTE! Hashear la contraseña antes de guardarla.
    $contrasenaHasheada = password_hash($data['contrasena'], PASSWORD_DEFAULT);

    $usuario = new Usuario(
      $data['id_persona'],
      $data['nombre_usuario'],
      $contrasenaHasheada,
      'activo', // estado por defecto
      $data['rol']
    );

    try {
      $pdo = Conexion::obtener();
      $resultado = $usuario->crear($pdo);

      if (is_numeric($resultado)) {
        http_response_code(201); // Created
        $usuario->id_usuario = $resultado;
        // No devolvemos la contraseña hasheada
        unset($usuario->contrasena_hash);
        echo json_encode(['status' => 'success', 'message' => 'Usuario creado exitosamente.', 'back' => true, 'data' => $usuario]);
      } elseif (is_array($resultado)) {
        http_response_code(400); // Bad Request
        echo json_encode(['status' => 'error', 'message' => 'Datos inválidos.', 'back' => true, 'errors' => $resultado]);
      } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo crear el usuario.', 'back' => true]);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error en el servidor al crear el usuario: ' . $e->getMessage(), 'back' => true]);
    }
  });

  // Ruta para ACTUALIZAR un usuario existente
  $router->map('PUT', '/usuarios/[i:id]', function ($id) {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
      http_response_code(400);
      echo json_encode(['status' => 'error', 'message' => 'Datos JSON inválidos o vacíos.', 'back' => true]);
      return;
    }

    try {
      $pdo = Conexion::obtener();
      $usuarioExistente = Usuario::consultar($pdo, $id);

      if (!$usuarioExistente) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Usuario no encontrado.', 'back' => true]);
        return;
      }

      // Si se proporciona una nueva contraseña, la hasheamos. Si no, mantenemos la anterior.
      $contrasenaHash = !empty($data['contrasena']) ? password_hash($data['contrasena'], PASSWORD_DEFAULT) : $usuarioExistente->contrasena_hash;

      $usuario = new Usuario(
        $data['id_persona'] ?? $usuarioExistente->id_persona,
        $data['nombre_usuario'] ?? $usuarioExistente->nombre_usuario,
        $contrasenaHash,
        $data['estado'] ?? $usuarioExistente->estado,
        $data['rol'] ?? $usuarioExistente->rol,
        $usuarioExistente->fecha_creacion_cuenta, // Mantenemos la fecha de creación original
        $usuarioExistente->ultima_sesion
      );
      $usuario->id_usuario = $id;

      $resultado = $usuario->actualizar($pdo);

      if ($resultado === true) {
        http_response_code(200);
        unset($usuario->contrasena_hash);
        echo json_encode(['status' => 'success', 'message' => 'Usuario actualizado exitosamente.', 'back' => true, 'data' => $usuario]);
      } elseif (is_array($resultado)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Datos inválidos.', 'back' => true, 'errors' => $resultado]);
      } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo actualizar el usuario.', 'back' => true]);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error en el servidor al actualizar el usuario: ' . $e->getMessage(), 'back' => true]);
    }
  });

  // Ruta para ELIMINAR un usuario
  $router->map('DELETE', '/usuarios/[i:id]', function ($id) {
    try {
      $pdo = Conexion::obtener();
      if (!Usuario::verificarID($pdo, $id)) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Usuario no encontrado.', 'back' => true]);
        return;
      }

      if (Usuario::eliminar($pdo, $id)) {
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Usuario eliminado exitosamente.', 'back' => true]);
      } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo eliminar el usuario.', 'back' => true]);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error en el servidor al eliminar el usuario.', 'back' => true]);
    }
  });
}
