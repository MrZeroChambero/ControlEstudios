<?php

namespace Micodigo\MomentoAcademico;

use Micodigo\Config\Conexion;
use Micodigo\Utils\RespuestaJson;
use Exception;
use RuntimeException;

trait OperacionesControladorMomentoAcademico
{
  public function listarMomentos()
  {
    try {
      $pdo = Conexion::obtener();
      $datos = self::consultarTodosLosMomentos($pdo);
      RespuestaJson::exito($datos, 'Momentos académicos obtenidos exitosamente.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al listar momentos académicos.', 500, null, $e);
    }
  }

  public function listarMomentosPorAnio($id_anio)
  {
    try {
      $pdo = Conexion::obtener();
      $datos = self::consultarMomentosPorAnio($pdo, $id_anio);
      RespuestaJson::exito($datos, 'Momentos del año obtenidos exitosamente.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al listar momentos por año.', 500, null, $e);
    }
  }

  public function crearMomento()
  {
    try {
      $data = $this->leerEntradaJson();
      $data['nombre'] = $this->limpiarTexto($data['nombre'] ?? null);
      $v = $this->crearValidadorMomento($data);
      if (!$v->validate()) {
        RespuestaJson::error('Errores de validación.', 422, $v->errors());
        return;
      }

      $pdo = Conexion::obtener();

      // Validaciones adicionales: duración entre 65 y 70 días
      $dias = ValidacionesMomentoAcademico::calcularDuracionDias($data['fecha_inicio'], $data['fecha_fin']);
      if ($dias < 65 || $dias > 70) {
        RespuestaJson::error('La duración del momento debe estar entre 65 y 70 días.', 422, null, null, ['dias' => $dias]);
        return;
      }

      // Verificar fk_anio_escolar existe en petición
      $fk_anio = isset($data['fk_anio_escolar']) ? (int)$data['fk_anio_escolar'] : null;
      if ($fk_anio === null) {
        RespuestaJson::error('fk_anio_escolar es requerido para crear un momento.', 422);
        return;
      }

      $data['fk_anio_escolar'] = $fk_anio;

      if (ValidacionesMomentoAcademico::verificarSolapamientoMomento($pdo, $fk_anio, $data['fecha_inicio'], $data['fecha_fin'], null)) {
        RespuestaJson::error('El momento se solapa con otro momento del mismo año escolar.', 422);
        return;
      }

      $id = self::crearMomentoBD($pdo, $data);
      $nuevo = self::consultarMomentoPorId($pdo, $id);
      RespuestaJson::exito($nuevo, 'Momento creado exitosamente.', 201);
    } catch (RuntimeException $e) {
      RespuestaJson::error($e->getMessage(), 422);
    } catch (Exception $e) {
      RespuestaJson::error('Error al crear momento académico.', 500, null, $e);
    }
  }

  public function obtenerMomento($id)
  {
    try {
      $pdo = Conexion::obtener();
      $dato = self::consultarMomentoPorId($pdo, $id);
      RespuestaJson::exito($dato, 'Momento académico obtenido.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al obtener momento académico.', 500, null, $e);
    }
  }

  public function actualizarMomento($id)
  {
    try {
      $data = $this->leerEntradaJson();
      $data['nombre'] = $this->limpiarTexto($data['nombre'] ?? null);
      $v = $this->crearValidadorMomento($data);
      if (!$v->validate()) {
        RespuestaJson::error('Errores de validación.', 422, $v->errors());
        return;
      }

      $pdo = Conexion::obtener();

      // Validación duración
      $dias = ValidacionesMomentoAcademico::calcularDuracionDias($data['fecha_inicio'], $data['fecha_fin']);
      if ($dias < 65 || $dias > 70) {
        RespuestaJson::error('La duración del momento debe estar entre 65 y 70 días.', 422, null, null, ['dias' => $dias]);
        return;
      }

      $fk_anio = isset($data['fk_anio_escolar']) ? (int)$data['fk_anio_escolar'] : null;
      if ($fk_anio === null) {
        // intentar obtener fk_anio desde la base por el id del momento
        $exist = self::consultarMomentoPorId($pdo, $id);
        $fk_anio = $exist['fk_anio_escolar'] ?? null;
      }

      if ($fk_anio === null) {
        RespuestaJson::error('fk_anio_escolar es requerido para actualizar un momento.', 422);
        return;
      }

      $data['fk_anio_escolar'] = $fk_anio;

      if (ValidacionesMomentoAcademico::verificarSolapamientoMomento($pdo, $fk_anio, $data['fecha_inicio'], $data['fecha_fin'], $id)) {
        RespuestaJson::error('El momento se solapa con otro momento del mismo año escolar.', 422);
        return;
      }

      $ok = self::actualizarMomentoBD($pdo, $id, $data);
      $actualizado = self::consultarMomentoPorId($pdo, $id);
      RespuestaJson::exito($actualizado, 'Momento académico actualizado.');
    } catch (RuntimeException $e) {
      RespuestaJson::error($e->getMessage(), 422);
    } catch (Exception $e) {
      RespuestaJson::error('Error al actualizar momento académico.', 500, null, $e);
    }
  }

  public function eliminarMomento($id)
  {
    try {
      $pdo = Conexion::obtener();
      $ok = self::eliminarMomentoBD($pdo, $id);
      if (!$ok) {
        RespuestaJson::error('No se pudo eliminar el momento académico.', 404);
        return;
      }

      RespuestaJson::exito(null, 'Momento académico eliminado.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al eliminar momento académico.', 500, null, $e);
    }
  }

  private function leerEntradaJson(): array
  {
    $contenido = file_get_contents('php://input');
    if ($contenido === false) {
      throw new RuntimeException('No fue posible leer la solicitud.');
    }

    $contenido = trim($contenido);
    if ($contenido === '') {
      return [];
    }

    $decodificado = json_decode($contenido, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($decodificado)) {
      throw new RuntimeException('JSON inválido: ' . json_last_error_msg());
    }

    return $decodificado;
  }
}
