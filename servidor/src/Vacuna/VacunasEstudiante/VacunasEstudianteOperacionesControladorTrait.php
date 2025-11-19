<?php

namespace Micodigo\Vacuna\VacunasEstudiante;

use Micodigo\Config\Conexion;
use Exception;

trait VacunasEstudianteOperacionesControladorTrait
{
  private function parseJsonInputVacunasEst(): array
  {
    $raw = file_get_contents('php://input');
    $d = json_decode($raw, true);
    if ($d === null && json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());
    return $d ?? [];
  }
  private function sendJsonVacunasEst(int $c, string $s, string $m, $data = null, $err = null): void
  {
    http_response_code($c);
    header('Content-Type: application/json; charset=utf-8');
    $r = ['status' => $s, 'message' => $m, 'back' => $s === 'success'];
    if ($data !== null) $r['data'] = $data;
    if ($err !== null) $r['errors'] = $err;
    echo json_encode($r, JSON_UNESCAPED_UNICODE);
  }
  public function asignarVacuna(): void
  {
    try {
      $d = $this->parseJsonInputVacunasEst();
      $pdo = Conexion::obtener();
      $obj = new VacunasEstudiante($d);
      $res = $obj->crear($pdo);
      if (is_array($res)) {
        $this->sendJsonVacunasEst(400, 'error', 'Validación fallida', null, $res);
        return;
      }
      $this->sendJsonVacunasEst(201, 'success', 'Vacuna asignada', $obj);
    } catch (Exception $e) {
      $this->sendJsonVacunasEst(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
  public function actualizarVacunaEstudiante(int $id): void
  {
    try {
      $d = $this->parseJsonInputVacunasEst();
      $pdo = Conexion::obtener();
      $row = self::obtener($pdo, $id);
      if (!$row) {
        $this->sendJsonVacunasEst(404, 'error', 'No encontrado');
        return;
      }
      $obj = new VacunasEstudiante($d);
      $obj->id_vacuna_estudiante = $id;
      $res = $obj->actualizar($pdo);
      if (is_array($res)) {
        $this->sendJsonVacunasEst(400, 'error', 'Validación', null, $res);
        return;
      }
      $this->sendJsonVacunasEst($res ? 200 : 500, $res ? 'success' : 'error', $res ? 'Actualizado' : 'Fallo', self::obtener($pdo, $id));
    } catch (Exception $e) {
      $this->sendJsonVacunasEst(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
  public function eliminarVacunaEstudiante(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $ok = VacunasEstudianteGestionTrait::eliminar($pdo, $id);
      $this->sendJsonVacunasEst($ok ? 200 : 500, $ok ? 'success' : 'error', $ok ? 'Eliminada' : 'No eliminada');
    } catch (Exception $e) {
      $this->sendJsonVacunasEst(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
  public function listarVacunasEstudiante(int $fk_estudiante): void
  {
    try {
      $pdo = Conexion::obtener();
      $rows = self::listarPorEstudiante($pdo, $fk_estudiante);
      $this->sendJsonVacunasEst(200, 'success', 'Listado obtenido', $rows);
    } catch (Exception $e) {
      $this->sendJsonVacunasEst(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
}
