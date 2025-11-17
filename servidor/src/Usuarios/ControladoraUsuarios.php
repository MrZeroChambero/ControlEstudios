<?php

namespace Micodigo\Usuarios;

use Micodigo\Config\Conexion;
use Valitron\Validator;
use Exception;

class ControladoraUsuarios
{
  public function __construct()
  {
    Validator::lang('es');
  }

  private function limpiarTexto($texto)
  {
    if ($texto === null) return null;
    $texto = trim($texto);
    $texto = preg_replace('/\s+/', ' ', $texto);
    return $texto === '' ? null : $texto;
  }

  private function validarTextoEspanol($campo, $valor, $obligatorio = false)
  {
    if ($valor === null || $valor === '') {
      if ($obligatorio) {
        return "El campo {$campo} es requerido";
      }
      return null;
    }

    // Solo letras (incluyendo acentos y ñ), números y espacios
    if (!preg_match('/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]+$/', $valor)) {
      return "El campo {$campo} solo puede contener letras, números y espacios";
    }

    if (strlen(trim($valor)) === 0) {
      return "El campo {$campo} no puede contener solo espacios";
    }

    if ($obligatorio && strlen(trim($valor)) < 2) {
      return "El campo {$campo} debe tener al menos 2 caracteres";
    }

    return null;
  }

  public function listar()
  {
    try {
      $pdo = Conexion::obtener();
      $usuarios = Usuarios::consultarTodos($pdo);

      header('Content-Type: application/json');
      echo json_encode([
        'back' => true,
        'data' => $usuarios,
        'message' => 'Usuarios obtenidos exitosamente.'
      ]);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error al obtener los usuarios.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  public function listarPersonalParaSelect()
  {
    try {
      $pdo = Conexion::obtener();
      $personal = Usuarios::consultarPersonalActivoParaSelect($pdo);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => true,
        'data' => $personal,
        'message' => 'Personal para select obtenido exitosamente.'
      ]);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error al obtener el personal para select.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  public function obtenerCompleto($id)
  {
    try {
      $pdo = Conexion::obtener();
      $usuario = Usuarios::consultarCompleto($pdo, $id);

      if (!$usuario) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Usuario no encontrado.'
        ]);
        return;
      }

      header('Content-Type: application/json');
      echo json_encode([
        'back' => true,
        'data' => $usuario,
        'message' => 'Usuario obtenido exitosamente.'
      ]);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error al obtener el usuario.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  public function crear()
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);

      if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error en el formato JSON: ' . json_last_error_msg());
      }

      // Limpiar textos
      $data['nombre_usuario'] = $this->limpiarTexto($data['nombre_usuario'] ?? '');
      $data['contrasena'] = $data['contrasena'] ?? ''; // No limpiar contraseña porque puede tener caracteres especiales

      $errores = [];

      // Validar campos requeridos
      if (empty($data['fk_personal'])) {
        $errores['fk_personal'] = 'El personal es requerido';
      }

      if (empty($data['nombre_usuario'])) {
        $errores['nombre_usuario'] = 'El nombre de usuario es requerido';
      }

      if (empty($data['contrasena'])) {
        $errores['contrasena'] = 'La contraseña es requerida';
      }

      if (empty($data['rol'])) {
        $errores['rol'] = 'El rol es requerido';
      }

      // Validar formato de campos
      $errorNombreUsuario = $this->validarTextoEspanol('nombre_usuario', $data['nombre_usuario'], true);
      if ($errorNombreUsuario) $errores['nombre_usuario'] = $errorNombreUsuario;

      // Validar longitud máxima
      if (strlen($data['nombre_usuario']) > 50) {
        $errores['nombre_usuario'] = 'El nombre de usuario no debe exceder los 50 caracteres';
      }

      // Validar rol
      $rolesPermitidos = ['Administrador', 'Docente', 'Secretaria', 'Representante'];
      if (!empty($data['rol']) && !in_array($data['rol'], $rolesPermitidos)) {
        $errores['rol'] = 'El rol debe ser uno de: ' . implode(', ', $rolesPermitidos);
      }

      // Validar que el nombre de usuario sea único
      if (!empty($data['nombre_usuario'])) {
        $pdo = Conexion::obtener();
        if (Usuarios::verificarNombreUsuario($pdo, $data['nombre_usuario'])) {
          $errores['nombre_usuario'] = 'El nombre de usuario ya está en uso';
        }
      }

      // Validar que el personal no tenga ya un usuario
      if (!empty($data['fk_personal'])) {
        $pdo = Conexion::obtener();
        if (Usuarios::verificarPersonalTieneUsuario($pdo, $data['fk_personal'])) {
          $errores['fk_personal'] = 'El personal seleccionado ya tiene un usuario';
        }

        // Validar que el personal tenga una función permitida (Docente, Especialista, Administrativo)
        if (!Usuarios::verificarFuncionPermitida($pdo, $data['fk_personal'])) {
          $errores['fk_personal'] = 'El personal seleccionado no tiene una función permitida para crear usuarios (solo Docente, Especialista o Administrativo)';
        }
      }

      // Validar máximo de directivos (2)
      if (!empty($data['rol']) && $data['rol'] === 'Administrador') {
        $pdo = Conexion::obtener();
        $cantidadDirectores = Usuarios::contarDirectores($pdo);
        if ($cantidadDirectores >= 2) {
          $errores['rol'] = 'Solo se permiten 2 usuarios con rol de Administrador';
        }
      }

      if (!empty($errores)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'errors' => $errores,
          'message' => 'Datos inválidos en la solicitud.'
        ]);
        return;
      }

      $pdo = Conexion::obtener();
      $usuario = new Usuarios(
        $data['fk_personal'],
        $data['nombre_usuario'],
        password_hash($data['contrasena'], PASSWORD_DEFAULT),
        $data['rol']
      );

      $id = $usuario->crear($pdo);

      if ($id) {
        http_response_code(201);
        $usuario->id_usuario = $id;

        header('Content-Type: application/json');
        echo json_encode([
          'back' => true,
          'data' => $usuario,
          'message' => 'Usuario creado exitosamente.'
        ]);
      } else {
        throw new Exception('No se pudo crear el usuario en la base de datos');
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error en el servidor al crear el usuario.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  public function actualizar($id)
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);

      if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error en el formato JSON: ' . json_last_error_msg());
      }

      $pdo = Conexion::obtener();
      $usuario = Usuarios::consultarActualizar($pdo, $id);

      if (!$usuario) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Usuario no encontrado.'
        ]);
        return;
      }

      // Limpiar textos
      $data['nombre_usuario'] = $this->limpiarTexto($data['nombre_usuario'] ?? '');
      $contrasena = $data['contrasena'] ?? '';

      $errores = [];

      // Validar campos requeridos
      if (empty($data['nombre_usuario'])) {
        $errores['nombre_usuario'] = 'El nombre de usuario es requerido';
      }

      if (empty($data['rol'])) {
        $errores['rol'] = 'El rol es requerido';
      }

      // Validar formato de campos
      $errorNombreUsuario = $this->validarTextoEspanol('nombre_usuario', $data['nombre_usuario'], true);
      if ($errorNombreUsuario) $errores['nombre_usuario'] = $errorNombreUsuario;

      // Validar longitud máxima
      if (strlen($data['nombre_usuario']) > 50) {
        $errores['nombre_usuario'] = 'El nombre de usuario no debe exceder los 50 caracteres';
      }

      // Validar rol
      $rolesPermitidos = ['Administrador', 'Docente', 'Secretaria', 'Representante'];
      if (!empty($data['rol']) && !in_array($data['rol'], $rolesPermitidos)) {
        $errores['rol'] = 'El rol debe ser uno de: ' . implode(', ', $rolesPermitidos);
      }

      // Validar que el nombre de usuario sea único (excepto para este usuario)
      if (!empty($data['nombre_usuario'])) {
        if (Usuarios::verificarNombreUsuario($pdo, $data['nombre_usuario'], $id)) {
          $errores['nombre_usuario'] = 'El nombre de usuario ya está en uso';
        }
      }

      // Validar máximo de directivos (2) - solo si se está cambiando a Administrador
      if (!empty($data['rol']) && $data['rol'] === 'Administrador' && $usuario->rol !== 'Administrador') {
        $cantidadDirectores = Usuarios::contarDirectores($pdo);
        if ($cantidadDirectores >= 2) {
          $errores['rol'] = 'Solo se permiten 2 usuarios con rol de Administrador';
        }
      }

      // Nota: No validamos el personal porque no se debe cambiar.

      if (!empty($errores)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'errors' => $errores,
          'message' => 'Datos inválidos en la solicitud.'
        ]);
        return;
      }

      $usuario->nombre_usuario = $data['nombre_usuario'];
      $usuario->rol = $data['rol'];

      // Si se proporciona una nueva contraseña, hashearla
      if (!empty($contrasena)) {
        $usuario->contrasena_hash = password_hash($contrasena, PASSWORD_DEFAULT);
      }

      if ($usuario->actualizar($pdo)) {
        header('Content-Type: application/json');
        echo json_encode([
          'back' => true,
          'data' => $usuario,
          'message' => 'Usuario actualizado exitosamente.'
        ]);
      } else {
        throw new Exception('No se pudo actualizar el usuario en la base de datos');
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error en el servidor al actualizar el usuario.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  public function eliminar($id)
  {
    try {
      $pdo = Conexion::obtener();
      if (Usuarios::eliminar($pdo, $id)) {
        header('Content-Type: application/json');
        echo json_encode([
          'back' => true,
          'message' => 'Usuario eliminado exitosamente.'
        ]);
      } else {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Error al eliminar el usuario.'
        ]);
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error en el servidor al eliminar el usuario.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  public function cambiarEstado($id)
  {
    try {
      $pdo = Conexion::obtener();
      if (Usuarios::cambiarEstado($pdo, $id)) {
        header('Content-Type: application/json');
        echo json_encode([
          'back' => true,
          'message' => 'Estado del usuario cambiado exitosamente.'
        ]);
      } else {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Error al cambiar el estado del usuario.'
        ]);
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error en el servidor al cambiar el estado del usuario.',
        'error_details' => $e->getMessage()
      ]);
    }
  }
}
