<?php

namespace Micodigo\ImparticionClases;

use Micodigo\Config\Conexion;
use Exception;

trait OperacionesControladorImparticionClases
{
  public function listarImparticiones()
  {
    try {
      $pdo = Conexion::obtener();
      $datos = self::consultarTodasLasImparticiones($pdo);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $datos, 'message' => 'Imparticiones obtenidas exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al listar imparticiones.', 'error_details' => $e->getMessage()]);
    }
  }

  public function crearImparticion()
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);
      if (json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());

      $v = $this->crearValidadorImparticion($data);
      if (!$v->validate()) {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'errors' => $v->errors()]);
        return;
      }

      $pdo = Conexion::obtener();
      $id = self::crearImparticionBD($pdo, $data);
      $nuevo = self::consultarImparticionPorId($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $nuevo, 'message' => 'Impartición creada exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al crear impartición.', 'error_details' => $e->getMessage()]);
    }
  }

  public function obtenerImparticion($id)
  {
    try {
      $pdo = Conexion::obtener();
      $dato = self::consultarImparticionPorId($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $dato, 'message' => 'Impartición obtenida.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al obtener impartición.', 'error_details' => $e->getMessage()]);
    }
  }

  public function actualizarImparticion($id)
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);
      if (json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());

      $v = $this->crearValidadorImparticion($data);
      if (!$v->validate()) {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'errors' => $v->errors()]);
        return;
      }

      $pdo = Conexion::obtener();
      $ok = self::actualizarImparticionBD($pdo, $id, $data);
      $actualizado = self::consultarImparticionPorId($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $actualizado, 'message' => 'Impartición actualizada.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al actualizar impartición.', 'error_details' => $e->getMessage()]);
    }
  }

  public function eliminarImparticion($id)
  {
    try {
      $pdo = Conexion::obtener();
      $ok = self::eliminarImparticionBD($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => (bool)$ok, 'message' => 'Impartición eliminada.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al eliminar impartición.', 'error_details' => $e->getMessage()]);
    }
  }
}
