<?php

namespace Micodigo\Aula;

use Micodigo\Config\Conexion;
use Exception;

trait OperacionesControladorAula
{
  public function listarAulas()
  {
    try {
      $pdo = Conexion::obtener();
      $aulas = self::consultarTodasLasAulas($pdo);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $aulas, 'message' => 'Aulas obtenidas exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al listar aulas.', 'error_details' => $e->getMessage()]);
    }
  }

  public function listarAulasSelect()
  {
    try {
      $pdo = Conexion::obtener();
      $aulas = self::consultarAulasParaSelect($pdo);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $aulas, 'message' => 'Aulas para select obtenidas exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al listar aulas para select.', 'error_details' => $e->getMessage()]);
    }
  }

  public function crearAula()
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);
      if (json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());

      $data['nombre'] = $this->limpiarTexto($data['nombre'] ?? null);
      $v = $this->crearValidadorAula($data);
      if (!$v->validate()) {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'errors' => $v->errors()]);
        return;
      }

      $pdo = Conexion::obtener();
      $id = self::crearAulaBD($pdo, $data);
      $nueva = self::consultarAulaPorId($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $nueva, 'message' => 'Aula creada exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al crear aula.', 'error_details' => $e->getMessage()]);
    }
  }

  public function obtenerAula($id)
  {
    try {
      $pdo = Conexion::obtener();
      $aula = self::consultarAulaPorId($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $aula, 'message' => 'Aula obtenida exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al obtener aula.', 'error_details' => $e->getMessage()]);
    }
  }

  public function actualizarAula($id)
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);
      if (json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());

      $data['nombre'] = $this->limpiarTexto($data['nombre'] ?? null);
      $v = $this->crearValidadorAula($data);
      if (!$v->validate()) {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'errors' => $v->errors()]);
        return;
      }

      $pdo = Conexion::obtener();
      $ok = self::actualizarAulaBD($pdo, $id, $data);
      $actualizada = self::consultarAulaPorId($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $actualizada, 'message' => 'Aula actualizada exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al actualizar aula.', 'error_details' => $e->getMessage()]);
    }
  }

  public function cambiarEstadoAula($id)
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);
      $estado = $data['estado'] ?? null;
      $pdo = Conexion::obtener();
      $ok = self::cambiarEstadoAulaBD($pdo, $id, $estado);
      header('Content-Type: application/json');
      echo json_encode(['back' => (bool)$ok, 'message' => 'Estado actualizado.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al cambiar estado del aula.', 'error_details' => $e->getMessage()]);
    }
  }

  public function eliminarAula($id)
  {
    try {
      $pdo = Conexion::obtener();
      $ok = self::eliminarAulaBD($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => (bool)$ok, 'message' => 'Aula eliminada.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al eliminar aula.', 'error_details' => $e->getMessage()]);
    }
  }
}
