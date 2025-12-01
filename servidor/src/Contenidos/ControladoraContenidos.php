<?php

namespace Micodigo\Contenidos;

use Micodigo\Config\Conexion;
use Exception;
use PDOException;

class ControladoraContenidos
{
  public function listar(): void
  {
    try {
      $conexion = Conexion::obtener();
      $modelo = new Contenidos();
      $contenidos = $modelo->consultarContenidosCompletos($conexion);
      $this->enviarRespuestaJson(200, 'exito', 'Contenidos consultados correctamente.', $contenidos);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al listar los contenidos.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function listarSelect(): void
  {
    try {
      $conexion = Conexion::obtener();
      $modelo = new Contenidos();
      $contenidos = $modelo->consultarParaSelect($conexion);
      $this->enviarRespuestaJson(200, 'exito', 'Contenidos activos obtenidos correctamente.', $contenidos);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al obtener los contenidos para selección.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function crear(): void
  {
    try {
      $entrada = $this->obtenerEntradaJson();
      $conexion = Conexion::obtener();
      $modelo = new Contenidos($entrada);
      $resultado = $modelo->crear($conexion, $entrada);

      if (isset($resultado['errores'])) {
        $this->enviarRespuestaJson(422, 'error', 'La información enviada no es válida.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(201, 'exito', 'Contenido registrado correctamente.', $resultado['datos']);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al registrar el contenido.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function actualizar(int $idContenido): void
  {
    try {
      $entrada = $this->obtenerEntradaJson();
      $conexion = Conexion::obtener();
      $modelo = new Contenidos();
      $resultado = $modelo->actualizar($conexion, $idContenido, $entrada);

      if (isset($resultado['errores'])) {
        $codigo = isset($resultado['errores']['id_contenido']) ? 404 : 422;
        $this->enviarRespuestaJson($codigo, 'error', 'No fue posible actualizar el contenido.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(200, 'exito', 'Contenido actualizado correctamente.', $resultado['datos']);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al actualizar el contenido.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function eliminar(int $idContenido): void
  {
    try {
      $conexion = Conexion::obtener();
      $modelo = new Contenidos();
      $resultado = $modelo->eliminar($conexion, $idContenido);

      if (isset($resultado['errores'])) {
        $codigo = isset($resultado['errores']['relaciones']) ? 409 : 404;
        $this->enviarRespuestaJson($codigo, 'error', 'No fue posible eliminar el contenido.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(200, 'exito', 'Contenido eliminado correctamente.', $resultado['datos']);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al eliminar el contenido.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function cambiarEstado(int $idContenido): void
  {
    try {
      $entrada = $this->obtenerEntradaJson();
      $estadoSolicitado = $entrada['estado'] ?? null;

      $conexion = Conexion::obtener();
      $modelo = new Contenidos();
      $resultado = $modelo->cambiarEstado($conexion, $idContenido, $estadoSolicitado);

      if (isset($resultado['errores'])) {
        $codigo = isset($resultado['errores']['id_contenido']) ? 404 : 422;
        $this->enviarRespuestaJson($codigo, 'error', 'No fue posible cambiar el estado del contenido.', null, $resultado['errores']);
        return;
      }

      $mensaje = $resultado['datos']['estado'] === 'activo'
        ? 'El contenido se activó correctamente.'
        : 'El contenido se desactivó correctamente.';

      $this->enviarRespuestaJson(200, 'exito', $mensaje, $resultado['datos']);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al cambiar el estado del contenido.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
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
