<?php

namespace Micodigo\CondicionesSalud;

use Micodigo\Config\Conexion;
use Exception;

trait CondicionesSaludOperacionesControladorTrait
{
  private function parseJsonInputCondiciones(): array
  {
    $raw = file_get_contents('php://input');
    $d = json_decode($raw, true);
    if ($d === null && json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());
    return $d ?? [];
  }
  private function sendJsonCondiciones(int $c, string $s, string $m, $data = null, $err = null): void
  {
    http_response_code($c);
    header('Content-Type: application/json; charset=utf-8');
    $r = ['status' => $s, 'message' => $m, 'back' => $s === 'success'];
    if ($data !== null) $r['data'] = $data;
    if ($err !== null) $r['errors'] = $err;
    echo json_encode($r, JSON_UNESCAPED_UNICODE);
  }
  public function crearCondicion(): void
  {
    try {
      $d = $this->parseJsonInputCondiciones();
      $pdo = Conexion::obtener();
      $obj = new CondicionesSalud($d);
      $r = $obj->crear($pdo);
      if (is_array($r)) {
        $this->sendJsonCondiciones(400, 'error', 'Validación', null, $r);
        return;
      }
      $this->sendJsonCondiciones(201, 'success', 'Condición creada', $obj);
    } catch (Exception $e) {
      $this->sendJsonCondiciones(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
  public function actualizarCondicion(int $id): void
  {
    try {
      $d = $this->parseJsonInputCondiciones();
      $pdo = Conexion::obtener();
      $row = self::obtener($pdo, $id);
      if (!$row) {
        $this->sendJsonCondiciones(404, 'error', 'No encontrada');
        return;
      }
      $obj = new CondicionesSalud($d);
      $obj->id_condicion = $id;
      $r = $obj->actualizar($pdo);
      if (is_array($r)) {
        $this->sendJsonCondiciones(400, 'error', 'Validación', null, $r);
        return;
      }
      $this->sendJsonCondiciones($r ? 200 : 500, $r ? 'success' : 'error', $r ? 'Actualizada' : 'Fallo', self::obtener($pdo, $id));
    } catch (Exception $e) {
      $this->sendJsonCondiciones(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
  public function eliminarCondicion(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $ok = CondicionesSaludGestionTrait::eliminar($pdo, $id);
      $this->sendJsonCondiciones($ok ? 200 : 500, $ok ? 'success' : 'error', $ok ? 'Eliminada' : 'No eliminada');
    } catch (Exception $e) {
      $this->sendJsonCondiciones(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
  public function listarCondicionesEstudiante(int $fk_estudiante): void
  {
    try {
      $pdo = Conexion::obtener();
      $rows = self::listarPorEstudiante($pdo, $fk_estudiante);
      $this->sendJsonCondiciones(200, 'success', 'Listado obtenido', $rows);
    } catch (Exception $e) {
      $this->sendJsonCondiciones(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
}
