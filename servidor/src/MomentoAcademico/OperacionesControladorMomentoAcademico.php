<?php

namespace Micodigo\MomentoAcademico;

use Micodigo\Config\Conexion;
use Exception;

trait OperacionesControladorMomentoAcademico
{
  public function listarMomentos()
  {
    try {
      $pdo = Conexion::obtener();
      $datos = self::consultarTodosLosMomentos($pdo);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $datos, 'message' => 'Momentos académicos obtenidos exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al listar momentos académicos.', 'error_details' => $e->getMessage()]);
    }
  }

  public function listarMomentosPorAnio($id_anio)
  {
    try {
      $pdo = Conexion::obtener();
      $datos = self::consultarMomentosPorAnio($pdo, $id_anio);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $datos, 'message' => 'Momentos del año obtenidos exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al listar momentos por año.', 'error_details' => $e->getMessage()]);
    }
  }

  public function crearMomento()
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);
      if (json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());
      $data['nombre'] = $this->limpiarTexto($data['nombre'] ?? null);
      $v = $this->crearValidadorMomento($data);
      if (!$v->validate()) {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'errors' => $v->errors()]);
        return;
      }

      $pdo = Conexion::obtener();

      // Validaciones adicionales: duración entre 65 y 70 días
      $dias = ValidacionesMomentoAcademico::calcularDuracionDias($data['fecha_inicio'], $data['fecha_fin']);
      if ($dias < 65 || $dias > 70) {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'message' => 'La duración del momento debe estar entre 65 y 70 días.', 'dias' => $dias]);
        return;
      }

      // Verificar fk_anio_escolar existe en petición
      $fk_anio = isset($data['fk_anio_escolar']) ? (int)$data['fk_anio_escolar'] : null;
      if ($fk_anio === null) {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'message' => 'fk_anio_escolar es requerido para crear un momento.']);
        return;
      }

      if (ValidacionesMomentoAcademico::verificarSolapamientoMomento($pdo, $fk_anio, $data['fecha_inicio'], $data['fecha_fin'], null)) {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'message' => 'El momento se solapa con otro momento del mismo año escolar.']);
        return;
      }

      $id = self::crearMomentoBD($pdo, $data);
      $nuevo = self::consultarMomentoPorId($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $nuevo, 'message' => 'Momento creado exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al crear momento académico.', 'error_details' => $e->getMessage()]);
    }
  }

  public function obtenerMomento($id)
  {
    try {
      $pdo = Conexion::obtener();
      $dato = self::consultarMomentoPorId($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $dato, 'message' => 'Momento académico obtenido.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al obtener momento académico.', 'error_details' => $e->getMessage()]);
    }
  }

  public function actualizarMomento($id)
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);
      if (json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());
      $data['nombre'] = $this->limpiarTexto($data['nombre'] ?? null);
      $v = $this->crearValidadorMomento($data);
      if (!$v->validate()) {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'errors' => $v->errors()]);
        return;
      }

      $pdo = Conexion::obtener();

      // Validación duración
      $dias = ValidacionesMomentoAcademico::calcularDuracionDias($data['fecha_inicio'], $data['fecha_fin']);
      if ($dias < 65 || $dias > 70) {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'message' => 'La duración del momento debe estar entre 65 y 70 días.', 'dias' => $dias]);
        return;
      }

      $fk_anio = isset($data['fk_anio_escolar']) ? (int)$data['fk_anio_escolar'] : null;
      if ($fk_anio === null) {
        // intentar obtener fk_anio desde la base por el id del momento
        $exist = self::consultarMomentoPorId($pdo, $id);
        $fk_anio = $exist['fk_anio_escolar'] ?? null;
      }

      if ($fk_anio === null) {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'message' => 'fk_anio_escolar es requerido para actualizar un momento.']);
        return;
      }

      if (ValidacionesMomentoAcademico::verificarSolapamientoMomento($pdo, $fk_anio, $data['fecha_inicio'], $data['fecha_fin'], $id)) {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'message' => 'El momento se solapa con otro momento del mismo año escolar.']);
        return;
      }

      $ok = self::actualizarMomentoBD($pdo, $id, $data);
      $actualizado = self::consultarMomentoPorId($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $actualizado, 'message' => 'Momento académico actualizado.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al actualizar momento académico.', 'error_details' => $e->getMessage()]);
    }
  }

  public function eliminarMomento($id)
  {
    try {
      $pdo = Conexion::obtener();
      $ok = self::eliminarMomentoBD($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => (bool)$ok, 'message' => 'Momento académico eliminado.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al eliminar momento académico.', 'error_details' => $e->getMessage()]);
    }
  }
}
