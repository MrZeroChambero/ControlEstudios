<?php

namespace Micodigo\Usuarios;

use Micodigo\Config\Conexion;
use Micodigo\Login\Login;
use Micodigo\PreguntasSeguridad\PreguntasSeguridad;
use Micodigo\Utils\RespuestaJson;
use Valitron\Validator;
use Exception;
use RuntimeException;

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

  private function obtenerUsuarioAutenticado(): ?array
  {
    if (!isset($_COOKIE['session_token'])) {
      return null;
    }

    try {
      $pdo = Conexion::obtener();
      $login = new Login($pdo);
      $usuario = $login->obtenerUsuarioPorHash($_COOKIE['session_token']);
      return $usuario ?: null;
    } catch (Exception $e) {
      return null;
    }
  }

  private function puedeGestionarPreguntas(?array $actor, int $usuarioObjetivoId = null, ?string $rolObjetivo = null): bool
  {
    if (!$actor) {
      return false;
    }

    $actorId = (int) ($actor['id_usuario'] ?? 0);
    $actorRol = $actor['rol'] ?? '';

    if ($usuarioObjetivoId !== null && $actorId === $usuarioObjetivoId) {
      return true;
    }

    if (strcasecmp($actorRol, 'Director') === 0) {
      if ($rolObjetivo !== null && strcasecmp($rolObjetivo, 'Director') === 0 && $actorId !== $usuarioObjetivoId) {
        return false;
      }

      return true;
    }

    return false;
  }

  private function mapearErroresPreguntas(array $errores): array
  {
    $mensajes = [];
    foreach ($errores as $entrada) {
      if (is_array($entrada)) {
        foreach ($entrada as $mensaje) {
          $mensajes[] = $mensaje;
        }
      } elseif (is_string($entrada)) {
        $mensajes[] = $entrada;
      }
    }

    return $mensajes;
  }

  private function obtenerCuerpoJson(): array
  {
    $contenido = file_get_contents('php://input');
    if ($contenido === false) {
      throw new RuntimeException('No se pudo leer el cuerpo de la solicitud.');
    }

    if ($contenido === '') {
      return [];
    }

    $data = json_decode($contenido, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
      throw new RuntimeException('Formato JSON inválido: ' . json_last_error_msg());
    }

    return $data;
  }

  private function responderExito(mixed $datos, string $mensaje, int $codigo = 200, array $extra = []): void
  {
    RespuestaJson::exito($datos, $mensaje, $codigo, $extra);
  }

  private function responderError(
    string $mensaje,
    int $codigo,
    ?array $errores = null,
    $detalle = null,
    array $extra = []
  ): void {
    RespuestaJson::error($mensaje, $codigo, $errores, $detalle, $extra);
  }

  public function listar()
  {
    try {
      $pdo = Conexion::obtener();
      $usuarios = Usuarios::consultarTodos($pdo);
      $this->responderExito($usuarios, 'Usuarios obtenidos exitosamente.');
    } catch (Exception $e) {
      $this->responderError('Error al obtener los usuarios.', 500, null, $e);
    }
  }

  public function listarPersonalParaSelect()
  {
    try {
      $pdo = Conexion::obtener();
      $personal = Usuarios::consultarPersonalActivoParaSelect($pdo);
      $this->responderExito($personal, 'Personal para select obtenido exitosamente.');
    } catch (Exception $e) {
      $this->responderError('Error al obtener el personal para select.', 500, null, $e);
    }
  }

  public function obtenerCompleto($id)
  {
    try {
      $pdo = Conexion::obtener();
      $usuario = Usuarios::consultarCompleto($pdo, $id);

      if (!$usuario) {
        $this->responderError('Usuario no encontrado.', 404);
        return;
      }

      $this->responderExito($usuario, 'Usuario obtenido exitosamente.');
    } catch (Exception $e) {
      $this->responderError('Error al obtener el usuario.', 500, null, $e);
    }
  }

  public function crear()
  {
    $pdo = null;
    try {
      $data = $this->obtenerCuerpoJson();

      $data['nombre_usuario'] = $this->limpiarTexto($data['nombre_usuario'] ?? '');
      $data['contrasena'] = $data['contrasena'] ?? '';

      $preguntas = isset($data['preguntas']) && is_array($data['preguntas']) ? $data['preguntas'] : [];
      $preguntasSeguridad = new PreguntasSeguridad();
      $actor = $this->obtenerUsuarioAutenticado();

      $errores = [];

      if (empty($data['fk_personal'])) {
        $errores['fk_personal'] = 'El personal es requerido';
      }

      if (empty($data['nombre_usuario'])) {
        $errores['nombre_usuario'] = 'El nombre de usuario es requerido';
      }

      if (empty($data['contrasena'])) {
        $errores['contrasena'] = 'La contrasena es requerida';
      }

      if (empty($data['rol'])) {
        $errores['rol'] = 'El rol es requerido';
      }

      $errorNombreUsuario = $this->validarTextoEspanol('nombre_usuario', $data['nombre_usuario'], true);
      if ($errorNombreUsuario) {
        $errores['nombre_usuario'] = $errorNombreUsuario;
      }

      if (strlen($data['nombre_usuario']) > 50) {
        $errores['nombre_usuario'] = 'El nombre de usuario no debe exceder los 50 caracteres';
      }

      $rolesPermitidos = ['Director', 'Docente', 'Secretaria'];
      if (!empty($data['rol']) && !in_array($data['rol'], $rolesPermitidos, true)) {
        $errores['rol'] = 'El rol debe ser uno de: ' . implode(', ', $rolesPermitidos);
      }

      if (count($preguntas) < 3) {
        $errores['preguntas'][] = 'Debes registrar al menos 3 preguntas de seguridad.';
      }

      if (!empty($preguntas)) {
        $erroresPreguntas = $preguntasSeguridad->validarPreguntas($preguntas);
        if (!empty($erroresPreguntas)) {
          $errores['preguntas'] = array_merge($errores['preguntas'] ?? [], $this->mapearErroresPreguntas($erroresPreguntas));
        }

        if (!$this->puedeGestionarPreguntas($actor)) {
          $errores['permisos'][] = 'Solo un usuario con rol Director puede registrar preguntas de seguridad de otros usuarios.';
        }
      }

      $pdo = Conexion::obtener();

      if (!empty($data['nombre_usuario']) && Usuarios::verificarNombreUsuario($pdo, $data['nombre_usuario'])) {
        $errores['nombre_usuario'] = 'El nombre de usuario ya está en uso';
      }

      if (!empty($data['fk_personal'])) {
        if (Usuarios::verificarPersonalTieneUsuario($pdo, $data['fk_personal'])) {
          $errores['fk_personal'] = 'El personal seleccionado ya tiene un usuario';
        }

        if (!Usuarios::verificarFuncionPermitida($pdo, $data['fk_personal'])) {
          $errores['fk_personal'] = 'El personal seleccionado no tiene una función permitida para crear usuarios (solo Docente, Especialista o Administrativo)';
        }
      }

      if (!empty($data['rol']) && $data['rol'] === 'Director') {
        $cantidadDirectores = Usuarios::contarDirectores($pdo);
        if ($cantidadDirectores >= 2) {
          $errores['rol'] = 'Solo se permiten 2 usuarios con rol de Director';
        }
      }

      if (!empty($errores)) {
        $this->responderError('Datos inválidos en la solicitud.', 400, $errores);
        return;
      }

      $usuario = new Usuarios(
        $data['fk_personal'],
        $data['nombre_usuario'],
        password_hash($data['contrasena'], PASSWORD_DEFAULT),
        $data['rol']
      );

      $pdo->beginTransaction();
      $id = $usuario->crear($pdo);
      $preguntasGuardadas = $preguntasSeguridad->reemplazarParaUsuario($pdo, (int) $id, $preguntas);
      $pdo->commit();

      $respuestaUsuario = [
        'id_usuario' => (int) $id,
        'fk_personal' => (int) $data['fk_personal'],
        'nombre_usuario' => $data['nombre_usuario'],
        'rol' => $data['rol'],
        'estado' => 'activo',
      ];

      $this->responderExito(
        [
          'usuario' => $respuestaUsuario,
          'preguntas' => $preguntasGuardadas,
        ],
        'Usuario creado exitosamente.',
        201
      );
    } catch (RuntimeException $e) {
      if ($pdo instanceof \PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
      }

      $this->responderError($e->getMessage(), 400);
    } catch (Exception $e) {
      if ($pdo instanceof \PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
      }

      $this->responderError('Error en el servidor al crear el usuario.', 500, null, $e);
    }
  }

  public function actualizar($id)
  {
    $pdo = null;
    try {
      $data = $this->obtenerCuerpoJson();

      $pdo = Conexion::obtener();
      $usuario = Usuarios::consultarActualizar($pdo, $id);

      if (!$usuario) {
        $this->responderError('Usuario no encontrado.', 404);
        return;
      }

      $data['nombre_usuario'] = $this->limpiarTexto($data['nombre_usuario'] ?? '');
      $contrasena = $data['contrasena'] ?? '';
      $actor = $this->obtenerUsuarioAutenticado();
      $preguntasSeguridad = new PreguntasSeguridad();

      $actualizarPreguntas = array_key_exists('preguntas', $data);
      $preguntas = $actualizarPreguntas && is_array($data['preguntas']) ? $data['preguntas'] : [];

      $errores = [];

      if (empty($data['nombre_usuario'])) {
        $errores['nombre_usuario'] = 'El nombre de usuario es requerido';
      }

      if (empty($data['rol'])) {
        $errores['rol'] = 'El rol es requerido';
      }

      $errorNombreUsuario = $this->validarTextoEspanol('nombre_usuario', $data['nombre_usuario'], true);
      if ($errorNombreUsuario) {
        $errores['nombre_usuario'] = $errorNombreUsuario;
      }

      if (strlen($data['nombre_usuario']) > 50) {
        $errores['nombre_usuario'] = 'El nombre de usuario no debe exceder los 50 caracteres';
      }

      $rolesPermitidos = ['Director', 'Docente', 'Secretaria'];
      if (!empty($data['rol']) && !in_array($data['rol'], $rolesPermitidos, true)) {
        $errores['rol'] = 'El rol debe ser uno de: ' . implode(', ', $rolesPermitidos);
      }

      if (Usuarios::verificarNombreUsuario($pdo, $data['nombre_usuario'], $id)) {
        $errores['nombre_usuario'] = 'El nombre de usuario ya está en uso';
      }

      if (!empty($data['rol']) && $data['rol'] === 'Director' && $usuario->rol !== 'Director') {
        $cantidadDirectores = Usuarios::contarDirectores($pdo);
        if ($cantidadDirectores >= 2) {
          $errores['rol'] = 'Solo se permiten 2 usuarios con rol de Director';
        }
      }

      if ($actualizarPreguntas) {
        if (count($preguntas) < 3) {
          $errores['preguntas'][] = 'El usuario debe mantener al menos 3 preguntas de seguridad.';
        }

        $erroresPreguntas = $preguntasSeguridad->validarPreguntas($preguntas);
        if (!empty($erroresPreguntas)) {
          $errores['preguntas'] = array_merge($errores['preguntas'] ?? [], $this->mapearErroresPreguntas($erroresPreguntas));
        }

        if (!$this->puedeGestionarPreguntas($actor, (int) $usuario->id_usuario, $usuario->rol)) {
          $errores['permisos'][] = 'No tienes permisos para modificar las preguntas de seguridad de este usuario.';
        }
      } else {
        if (!$preguntasSeguridad->tieneMinimoPreguntas($pdo, (int) $usuario->id_usuario)) {
          $errores['preguntas'][] = 'El usuario debe mantener al menos 3 preguntas de seguridad.';
        }
      }

      if (!empty($errores)) {
        $this->responderError('Datos inválidos en la solicitud.', 400, $errores);
        return;
      }

      $usuario->nombre_usuario = $data['nombre_usuario'];
      $usuario->rol = $data['rol'];

      if (!empty($contrasena)) {
        $usuario->contrasena_hash = password_hash($contrasena, PASSWORD_DEFAULT);
      }

      $pdo->beginTransaction();

      if ($actualizarPreguntas) {
        $preguntasSeguridad->reemplazarParaUsuario($pdo, (int) $usuario->id_usuario, $preguntas);
      }

      if (!$usuario->actualizar($pdo)) {
        throw new Exception('No se pudo actualizar el usuario en la base de datos');
      }

      $pdo->commit();

      $respuesta = [
        'id_usuario' => (int) $usuario->id_usuario,
        'nombre_usuario' => $usuario->nombre_usuario,
        'rol' => $usuario->rol,
        'estado' => $usuario->estado,
      ];

      $this->responderExito(
        [
          'usuario' => $respuesta,
          'preguntas' => $actualizarPreguntas ? $preguntasSeguridad->listarPorUsuario($pdo, (int) $usuario->id_usuario) : null,
        ],
        'Usuario actualizado exitosamente.'
      );
    } catch (RuntimeException $e) {
      if ($pdo instanceof \PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
      }

      $this->responderError($e->getMessage(), 400);
    } catch (Exception $e) {
      if ($pdo instanceof \PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
      }

      $this->responderError('Error en el servidor al actualizar el usuario.', 500, null, $e);
    }
  }

  public function eliminar($id)
  {
    try {
      $pdo = Conexion::obtener();
      if (Usuarios::eliminar($pdo, $id)) {
        $this->responderExito(null, 'Usuario eliminado exitosamente.');
      } else {
        $this->responderError('Error al eliminar el usuario.', 500);
      }
    } catch (Exception $e) {
      $this->responderError('Error en el servidor al eliminar el usuario.', 500, null, $e);
    }
  }

  public function cambiarEstado($id)
  {
    try {
      $pdo = Conexion::obtener();
      if (Usuarios::cambiarEstado($pdo, $id)) {
        $this->responderExito(null, 'Estado del usuario cambiado exitosamente.');
      } else {
        $this->responderError('Error al cambiar el estado del usuario.', 500);
      }
    } catch (Exception $e) {
      $this->responderError('Error en el servidor al cambiar el estado del usuario.', 500, null, $e);
    }
  }

  public function obtenerPreguntas($idUsuario)
  {
    try {
      $pdo = Conexion::obtener();
      $usuario = Usuarios::consultarActualizar($pdo, $idUsuario);

      if (!$usuario) {
        $this->responderError('Usuario no encontrado.', 404);
        return;
      }

      $actor = $this->obtenerUsuarioAutenticado();
      if (!$this->puedeGestionarPreguntas($actor, (int) $usuario->id_usuario, $usuario->rol)) {
        $this->responderError('No tienes permisos para consultar las preguntas de seguridad de este usuario.', 403);
        return;
      }

      $preguntasSeguridad = new PreguntasSeguridad();
      $preguntas = $preguntasSeguridad->listarPorUsuario($pdo, (int) $usuario->id_usuario);

      $this->responderExito($preguntas, 'Preguntas de seguridad obtenidas correctamente.');
    } catch (Exception $e) {
      $this->responderError('Error al consultar las preguntas de seguridad.', 500, null, $e);
    }
  }
}
