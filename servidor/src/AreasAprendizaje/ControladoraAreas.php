<?php

namespace Micodigo\AreasAprendizaje;

use Micodigo\Config\Conexion;
use Exception;
use PDOException;

class ControladoraAreas
{
  public function listar(): void
  {
    try {
      $conexion = Conexion::obtener();
      $modelo = new AreasAprendizaje();
      $areas = $modelo->consultarAreasCompletas($conexion);
      $this->enviarRespuestaJson(200, 'exito', 'Áreas de aprendizaje consultadas correctamente.', $areas);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al listar las áreas.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function listarSelect(): void
  {
    try {
      $conexion = Conexion::obtener();
      $modelo = new AreasAprendizaje();
      $areas = $modelo->consultarParaSelect($conexion);
      $this->enviarRespuestaJson(200, 'exito', 'Áreas disponibles para selección obtenidas.', $areas);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al obtener las áreas para la lista.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function crear(): void
  {
    try {
      $entrada = $this->obtenerEntradaJson();
      $conexion = Conexion::obtener();
      $modelo = new AreasAprendizaje($entrada);
      $resultado = $modelo->crear($conexion, $entrada);

      if (isset($resultado['errores'])) {
        $this->enviarRespuestaJson(422, 'error', 'La información enviada no es válida.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(201, 'exito', 'Área de aprendizaje creada correctamente.', $resultado['datos']);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al registrar el área.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function actualizar(int $idArea): void
  {
    try {
      $entrada = $this->obtenerEntradaJson();
      $conexion = Conexion::obtener();
      $modelo = new AreasAprendizaje();
      $resultado = $modelo->actualizar($conexion, $idArea, $entrada);

      if (isset($resultado['errores'])) {
        $codigo = isset($resultado['errores']['id_area_aprendizaje']) ? 404 : 422;
        $this->enviarRespuestaJson($codigo, 'error', 'No fue posible actualizar el área.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(200, 'exito', 'Área de aprendizaje actualizada correctamente.', $resultado['datos']);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al actualizar el área.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function eliminar(int $idArea): void
  {
    try {
      $conexion = Conexion::obtener();
      $modelo = new AreasAprendizaje();
      $resultado = $modelo->eliminar($conexion, $idArea);

      if (isset($resultado['errores'])) {
        $codigo = 400;
        if (isset($resultado['errores']['relaciones'])) {
          $codigo = 409;
        } elseif (isset($resultado['errores']['id_area_aprendizaje'])) {
          $codigo = 404;
        }
        $this->enviarRespuestaJson($codigo, 'error', 'No fue posible eliminar el área.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(200, 'exito', 'Área de aprendizaje eliminada correctamente.', $resultado['datos']);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al eliminar el área.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function cambiarEstado(int $idArea): void
  {
    try {
      $entrada = $this->obtenerEntradaJson();
      $estadoSolicitado = $entrada['estado_area'] ?? null;

      $conexion = Conexion::obtener();
      $modelo = new AreasAprendizaje();
      $resultado = $modelo->cambiarEstado($conexion, $idArea, $estadoSolicitado);

      if (isset($resultado['errores'])) {
        $codigo = isset($resultado['errores']['id_area_aprendizaje']) ? 404 : 422;
        $this->enviarRespuestaJson($codigo, 'error', 'No fue posible cambiar el estado del área.', null, $resultado['errores']);
        return;
      }

      $mensaje = $resultado['datos']['estado_area'] === 'activo'
        ? 'El área se activó correctamente.'
        : 'El área se desactivó correctamente.';

      $this->enviarRespuestaJson(200, 'exito', $mensaje, $resultado['datos']);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al cambiar el estado del área.', null, ['detalle' => [$excepcion->getMessage()]]);
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
      'mensaje' => $mensaje
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
