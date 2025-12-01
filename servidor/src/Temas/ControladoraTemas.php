<?php

namespace Micodigo\Temas;

use Micodigo\Config\Conexion;
use Micodigo\Contenidos\Contenidos as ContenidosModelo;
use Exception;
use PDOException;

class ControladoraTemas
{
  public function listarPorContenido(int $idContenido): void
  {
    if ($idContenido <= 0) {
      $this->enviarRespuestaJson(400, 'error', 'El identificador del contenido es inválido.');
      return;
    }

    try {
      $conexion = Conexion::obtener();
      $modelo = new Temas();
      $temas = $modelo->consultarTemasPorContenido($conexion, $idContenido);

      if (empty($temas)) {
        $contenidosModelo = new ContenidosModelo();
        if (!$contenidosModelo->existePorId($conexion, $idContenido)) {
          $this->enviarRespuestaJson(404, 'error', 'El contenido solicitado no existe.');
          return;
        }
      }

      $this->enviarRespuestaJson(200, 'exito', 'Temas consultados correctamente.', $temas);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al listar los temas.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function listarSelect(?int $idContenido = null): void
  {
    if ($idContenido !== null && $idContenido <= 0) {
      $idContenido = null;
    }

    try {
      $conexion = Conexion::obtener();
      $modelo = new Temas();
      $temas = $modelo->consultarParaSelect($conexion, $idContenido);
      $this->enviarRespuestaJson(200, 'exito', 'Temas disponibles obtenidos correctamente.', $temas);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al obtener los temas para selección.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function crear(): void
  {
    try {
      $entrada = $this->obtenerEntradaJson();
      $conexion = Conexion::obtener();
      $modelo = new Temas($entrada);
      $resultado = $modelo->crear($conexion, $entrada);

      if (isset($resultado['errores'])) {
        $this->enviarRespuestaJson(422, 'error', 'La información enviada no es válida.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(201, 'exito', 'Tema registrado correctamente.', $resultado['datos']);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al registrar el tema.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function actualizar(int $idTema): void
  {
    try {
      $entrada = $this->obtenerEntradaJson();
      $conexion = Conexion::obtener();
      $modelo = new Temas();
      $resultado = $modelo->actualizar($conexion, $idTema, $entrada);

      if (isset($resultado['errores'])) {
        $codigo = isset($resultado['errores']['id_tema']) ? 404 : 422;
        $this->enviarRespuestaJson($codigo, 'error', 'No fue posible actualizar el tema.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(200, 'exito', 'Tema actualizado correctamente.', $resultado['datos']);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al actualizar el tema.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function eliminar(int $idTema): void
  {
    try {
      $conexion = Conexion::obtener();
      $modelo = new Temas();
      $resultado = $modelo->eliminar($conexion, $idTema);

      if (isset($resultado['errores'])) {
        $codigo = isset($resultado['errores']['id_tema']) ? 404 : 409;
        $this->enviarRespuestaJson($codigo, 'error', 'No fue posible eliminar el tema.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(200, 'exito', 'Tema eliminado correctamente.', $resultado['datos']);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al eliminar el tema.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function cambiarEstado(int $idTema): void
  {
    try {
      $entrada = $this->obtenerEntradaJson();
      $estadoSolicitado = $entrada['estado'] ?? null;

      $conexion = Conexion::obtener();
      $modelo = new Temas();
      $resultado = $modelo->cambiarEstado($conexion, $idTema, $estadoSolicitado);

      if (isset($resultado['errores'])) {
        $codigo = isset($resultado['errores']['id_tema']) ? 404 : 422;
        $this->enviarRespuestaJson($codigo, 'error', 'No fue posible cambiar el estado del tema.', null, $resultado['errores']);
        return;
      }

      $mensaje = $resultado['datos']['estado'] === 'activo'
        ? 'El tema se activó correctamente.'
        : 'El tema se desactivó correctamente.';

      $this->enviarRespuestaJson(200, 'exito', $mensaje, $resultado['datos']);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al cambiar el estado del tema.', null, ['detalle' => [$excepcion->getMessage()]]);
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
