<?php

namespace Micodigo\Vacuna;

use Micodigo\Config\Conexion;
use Exception;

trait VacunaOperacionesControladorTrait
{
  private function parseJsonInputVacuna(): array
  {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());
    return $data ?? [];
  }
  private function sendJsonVacuna(int $c, string $s, string $m, $d = null, $e = null): void
  {
    http_response_code($c);
    header('Content-Type: application/json; charset=utf-8');
    $r = ['status' => $s, 'message' => $m, 'back' => $s === 'success'];
    if ($d !== null) $r['data'] = $d;
    if ($e !== null) $r['errors'] = $e;
    echo json_encode($r, JSON_UNESCAPED_UNICODE);
  }
  public function crearVacuna(): void
  {
    try {
      $data = $this->parseJsonInputVacuna();
      if (empty($data['nombre'])) {
        $this->sendJsonVacuna(400, 'error', 'Nombre requerido');
        return;
      }
      $pdo = Conexion::obtener();
      $v = new Vacuna(['nombre' => $data['nombre']]);
      $res = $v->crear($pdo);
      if (is_array($res)) {
        $this->sendJsonVacuna(400, 'error', 'Validación', null, $res);
        return;
      }
      $this->sendJsonVacuna(201, 'success', 'Vacuna creada', $v);
    } catch (Exception $e) {
      $this->sendJsonVacuna(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
  public function actualizarVacuna(int $id): void
  {
    try {
      $data = $this->parseJsonInputVacuna();
      $pdo = Conexion::obtener();
      $row = self::obtener($pdo, $id);
      if (!$row) {
        $this->sendJsonVacuna(404, 'error', 'No encontrada');
        return;
      }
      $v = new Vacuna(['nombre' => $data['nombre'] ?? $row['nombre']]);
      $v->id_vacuna = $id;
      $res = $v->actualizar($pdo);
      if (is_array($res)) {
        $this->sendJsonVacuna(400, 'error', 'Validación', null, $res);
        return;
      }
      $this->sendJsonVacuna($res ? 200 : 500, $res ? 'success' : 'error', $res ? 'Actualizada' : 'Fallo', self::obtener($pdo, $id));
    } catch (Exception $e) {
      $this->sendJsonVacuna(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
  public function eliminarVacuna(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $ok = VacunaGestionTrait::eliminar($pdo, $id);
      $this->sendJsonVacuna($ok ? 200 : 500, $ok ? 'success' : 'error', $ok ? 'Eliminada' : 'No eliminada');
    } catch (Exception $e) {
      $this->sendJsonVacuna(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
  public function listarVacunas(): void
  {
    try {
      $pdo = Conexion::obtener();
      $rows = self::listar($pdo);
      $this->sendJsonVacuna(200, 'success', 'Listado', $rows);
    } catch (Exception $e) {
      $this->sendJsonVacuna(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
}
