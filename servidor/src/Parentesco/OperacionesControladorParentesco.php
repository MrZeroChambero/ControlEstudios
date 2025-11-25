<?php

namespace Micodigo\Parentesco;

use Micodigo\Config\Conexion;
use Exception;
use PDO;

trait OperacionesControladorParentesco
{
  private function parseJsonInput(): array
  {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());
    return $data ?? [];
  }

  private function sendJson(int $code, string $status, string $message, $data = null, $errors = null): void
  {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    $resp = ['status' => $status, 'message' => $message, 'back' => $status === 'success'];
    if ($data !== null) $resp['data'] = $data;
    if ($errors !== null) $resp['errors'] = $errors;
    echo json_encode($resp, JSON_UNESCAPED_UNICODE);
  }

  public function listarParentescos(): void
  {
    try {
      $pdo = Conexion::obtener();
      $lista = ConsultasParentesco::consultarTodosParentescos($pdo);
      $this->sendJson(200, 'success', 'Parentescos obtenidos.', $lista);
    } catch (Exception $e) {
      $this->sendJson(500, 'error', 'Error al listar parentescos.');
    }
  }

  public function obtenerParentesco(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $r = ConsultasParentesco::consultarParentescoPorId($pdo, $id);
      if ($r) $this->sendJson(200, 'success', 'Parentesco obtenido.', $r);
      else $this->sendJson(404, 'error', 'Parentesco no encontrado.');
    } catch (Exception $e) {
      $this->sendJson(500, 'error', 'Error al obtener parentesco.');
    }
  }

  public function listarPorEstudiante(int $id_estudiante): void
  {
    try {
      $pdo = Conexion::obtener();
      $lista = ConsultasParentesco::consultarParentescosPorEstudiante($pdo, $id_estudiante);
      $this->sendJson(200, 'success', 'Parentescos del estudiante.', $lista);
    } catch (Exception $e) {
      $this->sendJson(500, 'error', 'Error al listar por estudiante.');
    }
  }

  public function listarPorRepresentante(int $id_representante): void
  {
    try {
      $pdo = Conexion::obtener();
      $lista = ConsultasParentesco::consultarParentescosPorRepresentante($pdo, $id_representante);
      $this->sendJson(200, 'success', 'Parentescos del representante.', $lista);
    } catch (Exception $e) {
      $this->sendJson(500, 'error', 'Error al listar por representante.');
    }
  }

  public function crearParentesco(): void
  {
    try {
      $data = $this->parseJsonInput();
      $pdo = Conexion::obtener();
      $val = ValidacionesParentesco::validarDatosCrear($pdo, $data);
      if ($val !== true) {
        $this->sendJson(422, 'error', 'Datos inválidos.', null, $val);
        return;
      }
      $id = GestionParentesco::crearParentescoBD($pdo, $data);
      $nuevo = ConsultasParentesco::consultarParentescoPorId($pdo, $id);
      $this->sendJson(201, 'success', 'Parentesco creado.', $nuevo);
    } catch (Exception $e) {
      $this->sendJson(500, 'error', 'Error al crear parentesco.');
    }
  }

  public function actualizarParentesco(int $id): void
  {
    try {
      $data = $this->parseJsonInput();
      $pdo = Conexion::obtener();
      $val = ValidacionesParentesco::validarDatosActualizar($pdo, $id, $data);
      if ($val !== true) {
        $this->sendJson(422, 'error', 'Datos inválidos.', null, $val);
        return;
      }
      $ok = GestionParentesco::actualizarParentescoBD($pdo, $id, $data);
      $act = ConsultasParentesco::consultarParentescoPorId($pdo, $id);
      $this->sendJson(200, 'success', 'Parentesco actualizado.', ['updated' => $ok, 'data' => $act]);
    } catch (Exception $e) {
      $this->sendJson(500, 'error', 'Error al actualizar parentesco.');
    }
  }

  public function eliminarParentesco(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $ok = GestionParentesco::eliminarParentescoBD($pdo, $id);
      $this->sendJson(200, 'success', 'Parentesco eliminado.', ['deleted' => $ok]);
    } catch (Exception $e) {
      $this->sendJson(500, 'error', 'Error al eliminar parentesco.');
    }
  }
}
