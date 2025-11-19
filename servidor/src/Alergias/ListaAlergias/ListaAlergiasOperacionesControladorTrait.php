<?php

namespace Micodigo\Alergias\ListaAlergias;

use Micodigo\Config\Conexion;
use Exception;

trait ListaAlergiasOperacionesControladorTrait
{
  private function parseJsonInputListaAlergias(): array
  {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());
    return $data ?? [];
  }
  private function sendJsonListaAlergias(int $code, string $status, string $message, $data = null, $errors = null): void
  {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    $resp = ['status' => $status, 'message' => $message, 'back' => $status === 'success'];
    if ($data !== null) $resp['data'] = $data;
    if ($errors !== null) $resp['errors'] = $errors;
    echo json_encode($resp, JSON_UNESCAPED_UNICODE);
  }
  public function asignarAlergia(): void
  {
    try {
      $d = $this->parseJsonInputListaAlergias();
      $pdo = Conexion::obtener();
      $obj = new ListaAlergias(['fk_alergia' => $d['fk_alergia'] ?? null, 'fk_estudiante' => $d['fk_estudiante'] ?? null]);
      $r = $obj->crear($pdo);
      if (is_array($r)) {
        $this->sendJsonListaAlergias(400, 'error', 'Validación fallida', null, $r);
        return;
      }
      $this->sendJsonListaAlergias(201, 'success', 'Alergia asignada', $obj);
    } catch (Exception $e) {
      $this->sendJsonListaAlergias(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
  public function eliminarAlergiaAsignada(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $ok = ListaAlergiasGestionTrait::eliminar($pdo, $id);
      $this->sendJsonListaAlergias($ok ? 200 : 500, $ok ? 'success' : 'error', $ok ? 'Eliminada' : 'No eliminada');
    } catch (Exception $e) {
      $this->sendJsonListaAlergias(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
  public function listarAlergiasEstudiante(int $id_estudiante): void
  {
    try {
      $pdo = Conexion::obtener();
      $rows = self::listarPorEstudiante($pdo, $id_estudiante);
      $this->sendJsonListaAlergias(200, 'success', 'Listado obtenido', $rows);
    } catch (Exception $e) {
      $this->sendJsonListaAlergias(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
}
