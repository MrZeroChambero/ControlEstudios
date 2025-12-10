<?php

namespace Micodigo\AnioEscolar;

use Micodigo\Config\Conexion;
use Micodigo\Login\Login;
use Exception;
use PDOException;
use RuntimeException;

class ControladoraAnioEscolar
{
  public function listar(): void
  {
    try {
      $conexion = Conexion::obtener();
      $modelo = new AnioEscolar();
      $anios = $modelo->consultarAniosCompletos($conexion);
      $this->enviarRespuestaJson(200, 'exito', 'Años escolares consultados correctamente.', $anios);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al listar los años escolares.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function obtener(int $idAnio): void
  {
    try {
      $conexion = Conexion::obtener();
      $modelo = new AnioEscolar();
      $anio = $modelo->consultarPorId($conexion, $idAnio);

      if ($anio === null) {
        $this->enviarRespuestaJson(404, 'error', 'El año escolar solicitado no existe.', null, ['id_anio_escolar' => ['Registro no encontrado.']]);
        return;
      }

      $this->enviarRespuestaJson(200, 'exito', 'Año escolar obtenido correctamente.', $anio);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al obtener el año escolar.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function crear(): void
  {
    try {
      $entrada = $this->obtenerEntradaJson();
      $conexion = Conexion::obtener();
      $modelo = new AnioEscolar($entrada);
      $resultado = $modelo->crear($conexion, $entrada);

      if (isset($resultado['errores'])) {
        $codigo = isset($resultado['errores']['estado']) ? 409 : 422;
        $this->enviarRespuestaJson($codigo, 'error', 'La información enviada no es válida.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(201, 'exito', 'Año escolar registrado correctamente.', $resultado['datos']);
    } catch (RuntimeException $excepcion) {
      $this->enviarRespuestaJson(422, 'error', $excepcion->getMessage(), null, ['momentos' => [$excepcion->getMessage()]]);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al registrar el año escolar.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function actualizar(int $idAnio): void
  {
    try {
      $entrada = $this->obtenerEntradaJson();
      $conexion = Conexion::obtener();
      $modelo = new AnioEscolar();
      $resultado = $modelo->actualizar($conexion, $idAnio, $entrada);

      if (isset($resultado['errores'])) {
        $codigo = isset($resultado['errores']['id_anio_escolar']) ? 404 : 422;
        $this->enviarRespuestaJson($codigo, 'error', 'No fue posible actualizar el año escolar.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(200, 'exito', 'Año escolar actualizado correctamente.', $resultado['datos']);
    } catch (RuntimeException $excepcion) {
      $this->enviarRespuestaJson(422, 'error', $excepcion->getMessage(), null, ['momentos' => [$excepcion->getMessage()]]);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al actualizar el año escolar.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function eliminar(int $idAnio): void
  {
    try {
      $conexion = Conexion::obtener();
      $modelo = new AnioEscolar();
      $resultado = $modelo->eliminar($conexion, $idAnio);

      if (isset($resultado['errores'])) {
        $codigo = 400;
        if (isset($resultado['errores']['relaciones'])) {
          $codigo = 409;
        } elseif (isset($resultado['errores']['id_anio_escolar'])) {
          $codigo = 404;
        }
        $this->enviarRespuestaJson($codigo, 'error', 'No fue posible eliminar el año escolar.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(200, 'exito', 'Año escolar eliminado correctamente.', $resultado['datos']);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al eliminar el año escolar.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function cambiarEstado(int $idAnio): void
  {
    try {
      $entrada = $this->obtenerEntradaJson();
      $accionSolicitada = $entrada['accion'] ?? null;
      if ($accionSolicitada === null && isset($entrada['estado'])) {
        $accionSolicitada = $this->accionDesdeEstado($entrada['estado']);
      }

      $conexion = Conexion::obtener();
      $modelo = new AnioEscolar();
      $anioActual = $modelo->consultarPorId($conexion, $idAnio);
      if ($anioActual === null) {
        $this->enviarRespuestaJson(404, 'error', 'El año escolar solicitado no existe.', null, ['id_anio_escolar' => ['Registro no encontrado.']]);
        return;
      }

      $accionEfectiva = $accionSolicitada;
      if ($accionEfectiva === null || $accionEfectiva === '') {
        $estadoActual = strtolower($anioActual['estado'] ?? 'incompleto');
        $accionEfectiva = $estadoActual === 'activo' ? 'desactivar' : 'activar';
      }

      $accionEfectiva = is_string($accionEfectiva) ? strtolower(trim($accionEfectiva)) : null;
      if ($accionEfectiva !== 'activar' && $accionEfectiva !== 'desactivar') {
        $this->enviarRespuestaJson(422, 'error', 'La acción solicitada es inválida.', null, ['accion' => ['Acción no soportada.']]);
        return;
      }

      if ($accionEfectiva === 'desactivar') {
        $errorContrasena = $this->validarContrasenaDesactivacion($conexion, $entrada);
        if ($errorContrasena !== null) {
          $this->enviarRespuestaJson(
            $errorContrasena['codigo'],
            'error',
            $errorContrasena['mensaje'],
            null,
            $errorContrasena['errores'] ?? null
          );
          return;
        }
      }

      $accionParaModelo = $accionSolicitada ?? $accionEfectiva;
      $resultado = $modelo->cambiarEstado($conexion, $idAnio, $accionParaModelo);

      if (isset($resultado['errores'])) {
        $codigo = isset($resultado['errores']['id_anio_escolar']) ? 404 : 422;
        $this->enviarRespuestaJson($codigo, 'error', 'No fue posible cambiar el estado del año escolar.', null, $resultado['errores']);
        return;
      }

      $estadoFinal = $resultado['datos']['estado'] ?? 'incompleto';
      $mensaje = $estadoFinal === 'activo'
        ? 'El año escolar se activó correctamente.'
        : ($estadoFinal === 'inactivo'
          ? 'El año escolar se desactivó correctamente.'
          : 'El año escolar se marcó como incompleto.');

      $this->enviarRespuestaJson(200, 'exito', $mensaje, $resultado['datos']);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al cambiar el estado del año escolar.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  private function validarContrasenaDesactivacion(\PDO $conexion, array $entrada): ?array
  {
    $contrasena = $entrada['contrasena'] ?? ($entrada['password'] ?? ($entrada['clave'] ?? null));
    if (!is_string($contrasena) || $contrasena === '') {
      return [
        'codigo' => 422,
        'mensaje' => 'Debes confirmar tu contraseña para desactivar el año escolar.',
        'errores' => ['contrasena' => ['La contraseña es requerida.']],
      ];
    }

    $credenciales = $this->obtenerHashUsuarioAutenticado($conexion, $entrada);
    if ($credenciales === null) {
      return [
        'codigo' => 401,
        'mensaje' => 'No fue posible verificar la identidad del usuario.',
        'errores' => ['autenticacion' => ['Sesión no válida o usuario desconocido.']],
      ];
    }

    if (!password_verify($contrasena, $credenciales['hash'])) {
      return [
        'codigo' => 401,
        'mensaje' => 'La contraseña proporcionada no es correcta.',
        'errores' => ['contrasena' => ['Contraseña incorrecta.']],
      ];
    }

    return null;
  }

  private function obtenerHashUsuarioAutenticado(\PDO $conexion, array $entrada): ?array
  {
    $token = $_COOKIE['session_token'] ?? null;

    if (is_string($token) && $token !== '') {
      try {
        $login = new Login($conexion);
        $usuarioSesion = $login->obtenerUsuarioPorHash($token);
        if (is_array($usuarioSesion) && isset($usuarioSesion['id_usuario'])) {
          $hash = $this->obtenerHashUsuarioPorId($conexion, (int) $usuarioSesion['id_usuario']);
          if ($hash !== null) {
            return [
              'id_usuario' => (int) $usuarioSesion['id_usuario'],
              'hash' => $hash,
            ];
          }
        }
      } catch (Exception $excepcion) {
        error_log('[AnioEscolar] Error al validar sesión: ' . $excepcion->getMessage());
      }
    }

    if (isset($entrada['id_usuario']) && is_numeric($entrada['id_usuario'])) {
      $hash = $this->obtenerHashUsuarioPorId($conexion, (int) $entrada['id_usuario']);
      if ($hash !== null) {
        return [
          'id_usuario' => (int) $entrada['id_usuario'],
          'hash' => $hash,
        ];
      }
    }

    $nombreUsuario = $entrada['usuario'] ?? ($entrada['nombre_usuario'] ?? null);
    if (is_string($nombreUsuario) && trim($nombreUsuario) !== '') {
      $datos = $this->obtenerHashUsuarioPorNombre($conexion, trim($nombreUsuario));
      if ($datos !== null) {
        return $datos;
      }
    }

    return null;
  }

  private function obtenerHashUsuarioPorId(\PDO $conexion, int $idUsuario): ?string
  {
    try {
      $sentencia = $conexion->prepare('SELECT contrasena_hash FROM usuarios WHERE id_usuario = ? LIMIT 1');
      $sentencia->execute([$idUsuario]);
      $hash = $sentencia->fetchColumn();
      return is_string($hash) && $hash !== '' ? $hash : null;
    } catch (PDOException $excepcion) {
      error_log('[AnioEscolar] Error consultando hash por id: ' . $excepcion->getMessage());
      return null;
    }
  }

  private function obtenerHashUsuarioPorNombre(\PDO $conexion, string $nombreUsuario): ?array
  {
    try {
      $sentencia = $conexion->prepare('SELECT id_usuario, contrasena_hash FROM usuarios WHERE nombre_usuario = ? AND estado = "activo" LIMIT 1');
      $sentencia->execute([$nombreUsuario]);
      $fila = $sentencia->fetch(\PDO::FETCH_ASSOC);

      if (!$fila) {
        return null;
      }

      $hash = $fila['contrasena_hash'] ?? null;
      if (!is_string($hash) || $hash === '') {
        return null;
      }

      return [
        'id_usuario' => (int) ($fila['id_usuario'] ?? 0),
        'hash' => $hash,
      ];
    } catch (PDOException $excepcion) {
      error_log('[AnioEscolar] Error consultando hash por nombre: ' . $excepcion->getMessage());
      return null;
    }
  }

  private function accionDesdeEstado(string $estado): ?string
  {
    $estadoNormalizado = strtolower(trim($estado));
    return match ($estadoNormalizado) {
      'activo' => 'activar',
      'inactivo' => 'desactivar',
      'incompleto' => 'activar',
      default => null,
    };
  }

  private function obtenerEntradaJson(): array
  {
    $cuerpo = file_get_contents('php://input');
    if ($cuerpo === false || $cuerpo === '') {
      return [];
    }

    $datos = json_decode($cuerpo, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
      throw new Exception('El cuerpo de la solicitud contiene JSON inválido: ' . json_last_error_msg());
    }

    return is_array($datos) ? $datos : [];
  }

  private function enviarRespuestaJson(int $codigoHttp, string $estado, string $mensaje, mixed $datos = null, ?array $errores = null): void
  {
    http_response_code($codigoHttp);
    header('Content-Type: application/json; charset=utf-8');

    $respuesta = [
      'estado' => $estado,
      'exito' => $estado === 'exito',
      'mensaje' => $mensaje,
    ];

    if ($datos !== null) {
      $respuesta['datos'] = $datos;
    }

    if ($errores !== null) {
      $respuesta['errores'] = $errores;
    }

    echo json_encode($respuesta, JSON_UNESCAPED_UNICODE);
  }
}
