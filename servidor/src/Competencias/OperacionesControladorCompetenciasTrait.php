<?php

namespace Micodigo\Competencias;

use Micodigo\Config\Conexion;
use Exception;
use RuntimeException;

trait OperacionesControladorCompetenciasTrait
{
  public function listarCompetencias(): void
  {
    try {
      $conexion = Conexion::obtener();
      $area = isset($_GET['area']) ? $this->normalizarEntero($_GET['area']) : null;
      $componente = isset($_GET['componente']) ? $this->normalizarEntero($_GET['componente']) : null;

      $registros = $this->obtenerCompetencias($conexion, $area, $componente);

      $datos = [
        'competencias' => $registros,
        'filtros' => [
          'area' => $area,
          'componente' => $componente,
        ],
      ];

      $this->enviarRespuestaJson(200, true, 'Competencias consultadas correctamente.', $datos);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'Hubo un problema al consultar las competencias.', null, [
        'detalle' => [$excepcion->getMessage()],
      ]);
    }
  }

  public function obtenerCompetencia(int $id): void
  {
    try {
      $conexion = Conexion::obtener();
      $detalle = $this->obtenerCompetenciaDetalle($conexion, $id);

      if ($detalle === null) {
        $this->enviarRespuestaJson(404, false, 'La competencia indicada no existe.', null);
        return;
      }

      $this->enviarRespuestaJson(200, true, 'Competencia obtenida exitosamente.', $detalle);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'No fue posible obtener la competencia solicitada.', null, [
        'detalle' => [$excepcion->getMessage()],
      ]);
    }
  }

  public function crearCompetencia(): void
  {
    try {
      $entrada = $this->leerEntradaJson();
      $conexion = Conexion::obtener();

      $resultado = $this->registrarCompetencia($conexion, $entrada);
      if (isset($resultado['errores'])) {
        $this->enviarRespuestaJson(422, false, 'La informacion enviada no es valida.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(201, true, 'Competencia registrada correctamente.', $resultado['datos']);
    } catch (RuntimeException $excepcion) {
      $this->enviarRespuestaJson(400, false, $excepcion->getMessage(), null);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'Hubo un problema al registrar la competencia.', null, [
        'detalle' => [$excepcion->getMessage()],
      ]);
    }
  }

  public function actualizarCompetencia(int $id): void
  {
    try {
      $entrada = $this->leerEntradaJson();
      $conexion = Conexion::obtener();

      $resultado = $this->actualizarCompetenciaDatos($conexion, $id, $entrada);
      if (isset($resultado['errores'])) {
        $codigo = isset($resultado['errores']['id_competencia']) ? 404 : 422;
        $this->enviarRespuestaJson($codigo, false, 'La informacion enviada no es valida.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(200, true, 'Competencia actualizada correctamente.', $resultado['datos']);
    } catch (RuntimeException $excepcion) {
      $this->enviarRespuestaJson(400, false, $excepcion->getMessage(), null);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'Hubo un problema al actualizar la competencia.', null, [
        'detalle' => [$excepcion->getMessage()],
      ]);
    }
  }

  public function eliminarCompetencia(int $id): void
  {
    try {
      $conexion = Conexion::obtener();
      $resultado = $this->eliminarCompetenciaDatos($conexion, $id);

      if (isset($resultado['errores'])) {
        $this->enviarRespuestaJson(404, false, 'La competencia indicada no existe.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(200, true, 'Competencia eliminada correctamente.', $resultado['datos']);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'No fue posible eliminar la competencia.', null, [
        'detalle' => [$excepcion->getMessage()],
      ]);
    }
  }
}
