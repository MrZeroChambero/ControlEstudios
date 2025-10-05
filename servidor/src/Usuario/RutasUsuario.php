<?php

use Micodigo\Config\Conexion;
use Micodigo\Usuario\Usuario;
use Valitron\Validator;

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
      echo json_encode(['status' => 'success', 'message' => 'Usuarios obtenidos exitosamente.', 'back' => 'true', 'data' => $usuarios], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'back' => 'true', 'message' => 'Error al obtener los usuarios.', 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
  });

  // Ruta para OBTENER un usuario por su ID
  $router->map('GET', '/usuarios/[i:id]', function ($id) {
    try {
      $pdo = Conexion::obtener();
      $usuario = Usuario::consultar($pdo, $id);

      if ($usuario) {
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Usuario obtenido exitosamente.', 'back' => true, 'data' => $usuario], JSON_UNESCAPED_UNICODE);
      } else {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Usuario no encontrado.', 'back' => true], JSON_UNESCAPED_UNICODE);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error en el servidor al consultar el usuario.', 'back' => true], JSON_UNESCAPED_UNICODE);
    }
  });

  // Ruta para CREAR un nuevo usuario
  $router->map('POST', '/usuarios', function () {
    $json = file_get_contents('php://input');

    $data = json_decode($json, true);
    $data['estado']  = "activo";



    if (!$data) {
      http_response_code(400);
      echo json_encode(['status' => 'error', 'message' => 'Datos JSON inválidos o vacíos.', 'back' => true], JSON_UNESCAPED_UNICODE);
      return;
    }

    // ¡IMPORTANTE! Hashear la contraseña antes de guardarla.
    $contrasena_hash = password_hash($data['contrasena'], PASSWORD_DEFAULT);
    $data['clave'] = $contrasena_hash;

    $usuario = new Usuario(
      $data['id_persona'],
      $data['nombre_usuario'],
      $data['clave'],
      $data['estado'], //estado "activo", // estado por defecto
      $data['rol']
    );

    $errores = $usuario->validarDatos($data);

    if ($errores !== true) {
      http_response_code(400);
      // Modifica el mensaje para que se refiera solo a 'contraseña'
      $errores = str_replace('contrasena_hash', 'contraseña', json_encode($errores, JSON_UNESCAPED_UNICODE));
      echo json_encode(['status' => 'error', 'message' => 'Datos inválidos.', 'back' => true, 'errors' => json_decode($errores, true)], JSON_UNESCAPED_UNICODE);
      return;
    }


    try {
      $pdo = Conexion::obtener();
      $resultado = $usuario->crear($pdo);


      if (is_numeric($resultado)) {
        http_response_code(201); // Created
        $usuario->id_usuario = $resultado;
        // No devolvemos la contraseña hasheada
        unset($usuario->contrasena_hash);
        echo json_encode(['status' => 'success', 'message' => 'Usuario creado exitosamente.', 'back' => true, 'data' => $usuario], JSON_UNESCAPED_UNICODE);
      } else {
        // Si `crear` devuelve false, es un error de base de datos.
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo crear el usuario.', 'error' => $resultado, 'back' => true], JSON_UNESCAPED_UNICODE);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error en el servidor al crear el usuario: ' . $e->getMessage(), 'back' => true], JSON_UNESCAPED_UNICODE);
    }
  });

  // Ruta para ACTUALIZAR un usuario existente
  $router->map('PUT', '/usuarios/[i:id]', function ($id) {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
      http_response_code(400);
      echo json_encode(['status' => 'error', 'message' => 'Datos JSON inválidos o vacíos.', 'back' => true], JSON_UNESCAPED_UNICODE);
      return;
    }

    try {
      $pdo = Conexion::obtener();
      $usuarioExistente = Usuario::consultar($pdo, $id);

      if (!$usuarioExistente) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Usuario no encontrado.', 'back' => true], JSON_UNESCAPED_UNICODE);
        return;
      }

      // Si se proporciona una nueva contraseña, la hasheamos. Si no, mantenemos la anterior.
      $contrasena_hash = !empty($data['contrasena']) ? password_hash($data['contrasena'], PASSWORD_DEFAULT) : $usuarioExistente->contrasena_hash;

      $usuario = new Usuario(
        $data['id_persona'] ?? $usuarioExistente->id_persona,
        $data['nombre_usuario'] ?? $usuarioExistente->nombre_usuario,
        $contrasenaHash,
        $data['estado'] ?? $usuarioExistente->estado,
        $data['rol'] ?? $usuarioExistente->rol,

      );
      $usuario->id_usuario = $id;

      $errores = $usuario->validarDatos($data);
      if ($errores !== true) {
        http_response_code(400);
        // Modifica el mensaje para que se refiera solo a 'contraseña'
        $errores = str_replace('contrasena_hash', 'contraseña', json_encode($errores, JSON_UNESCAPED_UNICODE));
        echo json_encode(['status' => 'error', 'message' => 'Datos inválidos.', 'back' => true, 'errors' => json_decode($errores, true)], JSON_UNESCAPED_UNICODE);
        return;
      }

      $resultado = $usuario->actualizar($pdo);

      if ($resultado === true) {
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Usuario actualizado exitosamente.', 'back' => true, 'data' => $usuario], JSON_UNESCAPED_UNICODE);
      } elseif (is_array($resultado)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Datos inválidos.', 'back' => true, 'errors' => $resultado], JSON_UNESCAPED_UNICODE);
      } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo actualizar el usuario.', 'back' => true], JSON_UNESCAPED_UNICODE);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error en el servidor al actualizar el usuario: ' . $e->getMessage(), 'back' => true], JSON_UNESCAPED_UNICODE);
    }
  });

  // Ruta para ELIMINAR un usuario
  $router->map('DELETE', '/usuarios/[i:id]', function ($id) {
    try {
      $pdo = Conexion::obtener();
      if (!Usuario::verificarID($pdo, $id)) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Usuario no encontrado.', 'back' => true], JSON_UNESCAPED_UNICODE);
        return;
      }

      if (Usuario::eliminar($pdo, $id)) {
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Usuario eliminado exitosamente.', 'back' => true], JSON_UNESCAPED_UNICODE);
      } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo eliminar el usuario.', 'back' => true], JSON_UNESCAPED_UNICODE);
      }
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['status' => 'error', 'message' => 'Error en el servidor al eliminar el usuario.', 'back' => true], JSON_UNESCAPED_UNICODE);
    }
  });
}
