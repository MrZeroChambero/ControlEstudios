<?php

namespace Micodigo\Impartir;

use Micodigo\Config\Conexion;
use Exception;
use RuntimeException;

trait OperacionesControladorImpartirTrait
{
  public function obtenerGestionDocentes(): void
  {
    try {
      $conexion = Conexion::obtener();
      $anioId = null;
      if (isset($_GET['anio_id'])) {
        $anioFiltrado = filter_var($_GET['anio_id'], FILTER_VALIDATE_INT);
        if ($anioFiltrado !== false && $anioFiltrado > 0) {
          $anioId = (int) $anioFiltrado;
        }
      }

      $resumen = $this->obtenerResumenGestion($conexion, $anioId);
      $mensaje = $resumen['anio'] !== null
        ? 'Resumen de asignaciones obtenido correctamente.'
        : 'No existe un año escolar activo o incompleto. Configure uno para gestionar las asignaciones.';

      $this->enviarRespuestaJson(200, true, $mensaje, $resumen);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'No fue posible obtener la gestion de aulas.', null);
    }
  }

  public function asignarDocenteTitular(int $id): void
  {
    try {
      $entrada = $this->leerEntradaJson();
      $conexion = Conexion::obtener();

      $this->registrarDocenteTitular($conexion, (int) $id, $entrada);
      $resumen = $this->obtenerResumenGestion($conexion);

      $this->enviarRespuestaJson(200, true, 'Docente titular asignado correctamente.', $resumen);
    } catch (RuntimeException $excepcion) {
      $errores = $this->decodificarErrores($excepcion->getMessage());
      if ($errores !== null) {
        $this->enviarRespuestaJson(422, false, 'La informacion enviada no es valida.', null, $errores);
        return;
      }

      $this->enviarRespuestaJson(409, false, $excepcion->getMessage(), null);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'No fue posible asignar el docente titular.', null);
    }
  }

  public function eliminarDocenteTitular(int $id): void
  {
    try {
      $conexion = Conexion::obtener();
      $this->removerDocenteTitular($conexion, (int) $id);
      $resumen = $this->obtenerResumenGestion($conexion);

      $this->enviarRespuestaJson(200, true, 'Docente titular removido correctamente.', $resumen);
    } catch (RuntimeException $excepcion) {
      $this->enviarRespuestaJson(404, false, $excepcion->getMessage(), null);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'No fue posible remover el docente titular.', null);
    }
  }

  public function asignarEspecialista(int $id): void
  {
    try {
      $entrada = $this->leerEntradaJson();
      $conexion = Conexion::obtener();

      $this->registrarEspecialista($conexion, (int) $id, $entrada);
      $resumen = $this->obtenerResumenGestion($conexion);

      $this->enviarRespuestaJson(200, true, 'Especialista asignado correctamente.', $resumen);
    } catch (RuntimeException $excepcion) {
      $errores = $this->decodificarErrores($excepcion->getMessage());
      if ($errores !== null) {
        $this->enviarRespuestaJson(422, false, 'La informacion enviada no es valida.', null, $errores);
        return;
      }

      $this->enviarRespuestaJson(409, false, $excepcion->getMessage(), null);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'No fue posible asignar el especialista.', null);
    }
  }

  public function eliminarEspecialista(int $id, int $componenteId): void
  {
    try {
      $conexion = Conexion::obtener();
      $this->removerEspecialista($conexion, (int) $id, (int) $componenteId);
      $resumen = $this->obtenerResumenGestion($conexion);

      $this->enviarRespuestaJson(200, true, 'Especialista removido correctamente.', $resumen);
    } catch (RuntimeException $excepcion) {
      $this->enviarRespuestaJson(404, false, $excepcion->getMessage(), null);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'No fue posible remover el especialista asignado.', null);
    }
  }

  protected function decodificarErrores(string $mensaje): ?array
  {
    $decodificado = json_decode($mensaje, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($decodificado)) {
      return null;
    }

    return $decodificado;
  }
}
