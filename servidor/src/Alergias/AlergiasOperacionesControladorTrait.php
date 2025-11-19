<?php

namespace Micodigo\Alergias;

use Micodigo\Config\Conexion;
use Exception;

trait AlergiasOperacionesControladorTrait
{
  private function parseJsonInputAlergia(): array
  {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());
    return $data ?? [];
  }

  private function sendJsonAlergia(int $code, string $status, string $message, $data = null, $errors = null): void
  {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    $resp = ['status' => $status, 'message' => $message, 'back' => $status === 'success'];
    if ($data !== null) $resp['data'] = $data;
    if ($errors !== null) $resp['errors'] = $errors;
    echo json_encode($resp, JSON_UNESCAPED_UNICODE);
  }

  public function crearAlergia(): void
  {
    try {
      $data = $this->parseJsonInputAlergia();
      if (empty($data['nombre'])) {
        $this->sendJsonAlergia(400, 'error', 'Nombre requerido');
        return;
      }
      $pdo = Conexion::obtener();
      $al = new Alergias(['nombre' => $data['nombre']]);
      $res = $al->crear($pdo);
      if (is_array($res)) {
        $this->sendJsonAlergia(400, 'error', 'Validación fallida', null, $res);
        return;
      }
      $this->sendJsonAlergia(201, 'success', 'Alergia creada', $al);
    } catch (Exception $e) {
      $this->sendJsonAlergia(500, 'error', 'Error: ' . $e->getMessage());
    }
  }

  public function actualizarAlergia(int $id): void
  {
    try {
      $data = $this->parseJsonInputAlergia();
      $pdo = Conexion::obtener();
      $row = self::obtener($pdo, $id);
      if (!$row) {
        $this->sendJsonAlergia(404, 'error', 'No encontrada');
        return;
      }
      $al = new Alergias(['nombre' => $data['nombre'] ?? $row['nombre']]);
      $al->id_alergia = $id;
      $res = $al->actualizar($pdo);
      if (is_array($res)) {
        $this->sendJsonAlergia(400, 'error', 'Validación fallida', null, $res);
        return;
      }
      $this->sendJsonAlergia($res ? 200 : 500, $res ? 'success' : 'error', $res ? 'Alergia actualizada' : 'No se pudo actualizar', self::obtener($pdo, $id));
    } catch (Exception $e) {
      $this->sendJsonAlergia(500, 'error', 'Error: ' . $e->getMessage());
    }
  }

  public function eliminarAlergia(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $ok = AlergiasGestionTrait::eliminar($pdo, $id);
      $this->sendJsonAlergia($ok ? 200 : 500, $ok ? 'success' : 'error', $ok ? 'Eliminada' : 'No eliminada');
    } catch (Exception $e) {
      $this->sendJsonAlergia(500, 'error', 'Error: ' . $e->getMessage());
    }
  }

  public function listarAlergias(): void
  {
    try {
      $pdo = Conexion::obtener();
      $rows = self::listar($pdo);
      $this->sendJsonAlergia(200, 'success', 'Listado obtenido', $rows);
    } catch (Exception $e) {
      $this->sendJsonAlergia(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
}
