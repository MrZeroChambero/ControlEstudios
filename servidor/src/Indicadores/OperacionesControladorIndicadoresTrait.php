<?php

namespace Micodigo\Indicadores;

use Micodigo\Config\Conexion;
use Exception;
use RuntimeException;

trait OperacionesControladorIndicadoresTrait
{
  public function listarIndicadoresPorCompetencia(int $idCompetencia): void
  {
    try {
      $conexion = Conexion::obtener();
      $competencia = $this->obtenerCompetenciaContexto($conexion, $idCompetencia);

      if ($competencia === null) {
        $this->enviarRespuestaJson(404, false, 'La competencia indicada no existe.', null);
        return;
      }

      if (($competencia['estado_componente'] ?? '') !== 'activo' || ($competencia['estado_area'] ?? '') !== 'activo') {
        $this->enviarRespuestaJson(409, false, 'La competencia no esta disponible porque su componente o area estan inactivos.', null);
        return;
      }

      $indicadores = $this->obtenerIndicadoresPorCompetencia($conexion, $idCompetencia);

      $this->enviarRespuestaJson(200, true, 'Indicadores consultados correctamente.', [
        'competencia' => [
          'id_competencia' => (int) $competencia['id_competencia'],
          'nombre_competencia' => (string) $competencia['nombre_competencia'],
          'fk_componente' => (int) $competencia['fk_componente'],
          'componente' => (string) $competencia['nombre_componente'],
          'fk_area' => (int) $competencia['fk_area'],
          'area' => (string) $competencia['nombre_area'],
        ],
        'indicadores' => $indicadores,
      ]);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'Hubo un problema al consultar los indicadores.', null, [
        'detalle' => [$excepcion->getMessage()],
      ]);
    }
  }

  public function crearIndicador(): void
  {
    try {
      $entrada = $this->leerEntradaJson();
      $conexion = Conexion::obtener();

      $resultado = $this->registrarIndicador($conexion, $entrada);
      if (isset($resultado['errores'])) {
        $this->enviarRespuestaJson(422, false, 'La informacion enviada no es valida.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(201, true, 'Indicador registrado correctamente.', $resultado['datos']);
    } catch (RuntimeException $excepcion) {
      $this->enviarRespuestaJson(400, false, $excepcion->getMessage(), null);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'Hubo un problema al registrar el indicador.', null, [
        'detalle' => [$excepcion->getMessage()],
      ]);
    }
  }

  public function actualizarIndicador(int $idIndicador): void
  {
    try {
      $entrada = $this->leerEntradaJson();
      $conexion = Conexion::obtener();

      $resultado = $this->actualizarIndicadorDatos($conexion, $idIndicador, $entrada);
      if (isset($resultado['errores'])) {
        $codigo = isset($resultado['errores']['id_indicador']) ? 404 : 422;
        $this->enviarRespuestaJson($codigo, false, 'La informacion enviada no es valida.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(200, true, 'Indicador actualizado correctamente.', $resultado['datos']);
    } catch (RuntimeException $excepcion) {
      $this->enviarRespuestaJson(400, false, $excepcion->getMessage(), null);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'Hubo un problema al actualizar el indicador.', null, [
        'detalle' => [$excepcion->getMessage()],
      ]);
    }
  }

  public function eliminarIndicador(int $idIndicador): void
  {
    try {
      $conexion = Conexion::obtener();
      $resultado = $this->eliminarIndicadorDatos($conexion, $idIndicador);

      if (isset($resultado['errores'])) {
        $this->enviarRespuestaJson(404, false, 'El indicador indicado no existe.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(200, true, 'Indicador eliminado correctamente.', $resultado['datos']);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'No fue posible eliminar el indicador.', null, [
        'detalle' => [$excepcion->getMessage()],
      ]);
    }
  }

  public function cambiarOcultarIndicador(int $idIndicador): void
  {
    try {
      $entrada = $this->leerEntradaJson();
      $estado = strtolower((string) ($entrada['ocultar'] ?? 'no'));
      $conexion = Conexion::obtener();

      $resultado = $this->actualizarOcultarIndicador($conexion, $idIndicador, $estado);
      if (isset($resultado['errores'])) {
        $this->enviarRespuestaJson(404, false, 'El indicador indicado no existe.', null, $resultado['errores']);
        return;
      }

      $mensaje = ($resultado['datos']['ocultar'] ?? 'no') === 'si'
        ? 'Indicador ocultado correctamente.'
        : 'Indicador visible nuevamente.';

      $this->enviarRespuestaJson(200, true, $mensaje, $resultado['datos']);
    } catch (RuntimeException $excepcion) {
      $this->enviarRespuestaJson(400, false, $excepcion->getMessage(), null);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'No fue posible actualizar la visibilidad del indicador.', null, [
        'detalle' => [$excepcion->getMessage()],
      ]);
    }
  }
}
