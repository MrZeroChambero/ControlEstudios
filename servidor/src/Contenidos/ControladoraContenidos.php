<?php

namespace Micodigo\Contenidos;

use Micodigo\Config\Conexion;
use Micodigo\Utils\RespuestaJson;
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
      RespuestaJson::exito($contenidos, 'Contenidos consultados correctamente.');
    } catch (Exception | PDOException $excepcion) {
      RespuestaJson::error('Ocurrió un problema al listar los contenidos.', 500, null, $excepcion);
    }
  }

  public function listarSelect(): void
  {
    try {
      $conexion = Conexion::obtener();
      $modelo = new Contenidos();
      $contenidos = $modelo->consultarParaSelect($conexion);
      RespuestaJson::exito($contenidos, 'Contenidos activos obtenidos correctamente.');
    } catch (Exception | PDOException $excepcion) {
      RespuestaJson::error('Ocurrió un problema al obtener los contenidos para selección.', 500, null, $excepcion);
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
        RespuestaJson::error('La información enviada no es válida.', 422, $resultado['errores']);
        return;
      }

      RespuestaJson::exito($resultado['datos'], 'Contenido registrado correctamente.', 201);
    } catch (Exception | PDOException $excepcion) {
      RespuestaJson::error('Ocurrió un problema al registrar el contenido.', 500, null, $excepcion);
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
        RespuestaJson::error('No fue posible actualizar el contenido.', $codigo, $resultado['errores']);
        return;
      }

      RespuestaJson::exito($resultado['datos'], 'Contenido actualizado correctamente.');
    } catch (Exception | PDOException $excepcion) {
      RespuestaJson::error('Ocurrió un problema al actualizar el contenido.', 500, null, $excepcion);
    }
  }

  public function eliminar(int $idContenido): void
  {
    try {
      $idContenido = (int) $idContenido;
      $conexion = Conexion::obtener();
      $modelo = new Contenidos(['id_contenido' => $idContenido]);
      $resultado = $modelo->eliminar($conexion, $idContenido);

      if (isset($resultado['errores'])) {
        $codigo = isset($resultado['errores']['relaciones']) ? 409 : 404;
        RespuestaJson::error('No fue posible eliminar el contenido.', $codigo, $resultado['errores']);
        return;
      }

      RespuestaJson::exito($resultado['datos'], 'Contenido eliminado correctamente.');
    } catch (Exception | PDOException $excepcion) {
      RespuestaJson::error('Ocurrió un problema al eliminar el contenido.', 500, null, $excepcion);
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
        RespuestaJson::error('No fue posible cambiar el estado del contenido.', $codigo, $resultado['errores']);
        return;
      }

      $mensaje = $resultado['datos']['estado'] === 'activo'
        ? 'El contenido se activó correctamente.'
        : 'El contenido se desactivó correctamente.';

      RespuestaJson::exito($resultado['datos'], $mensaje);
    } catch (Exception | PDOException $excepcion) {
      RespuestaJson::error('Ocurrió un problema al cambiar el estado del contenido.', 500, null, $excepcion);
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
}
