<?php

namespace Micodigo\AnioEscolar;

use Micodigo\Config\Conexion;
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
      $resultado = $modelo->cambiarEstado($conexion, $idAnio, $accionSolicitada);

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
