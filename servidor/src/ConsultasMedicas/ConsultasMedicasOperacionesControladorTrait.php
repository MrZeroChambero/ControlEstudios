<?php

namespace Micodigo\ConsultasMedicas;

use Micodigo\Config\Conexion;
use Exception;

trait ConsultasMedicasOperacionesControladorTrait
{
  private function parseJsonInputConsultas(): array
  {
    $raw = file_get_contents('php://input');
    $d = json_decode($raw, true);
    if ($d === null && json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());
    return $d ?? [];
  }
  private function sendJsonConsultas(int $c, string $s, string $m, $data = null, $err = null): void
  {
    http_response_code($c);
    header('Content-Type: application/json; charset=utf-8');
    $r = ['status' => $s, 'message' => $m, 'back' => $s === 'success'];
    if ($data !== null) $r['data'] = $data;
    if ($err !== null) $r['errors'] = $err;
    echo json_encode($r, JSON_UNESCAPED_UNICODE);
  }
  public function crearConsultaMedica(): void
  {
    try {
      $d = $this->parseJsonInputConsultas();
      $pdo = Conexion::obtener();
      $obj = new ConsultasMedicas($d);
      $r = $obj->crear($pdo);
      if (is_array($r)) {
        $this->sendJsonConsultas(400, 'error', 'Validación', null, $r);
        return;
      }
      $this->sendJsonConsultas(201, 'success', 'Consulta creada', $obj);
    } catch (Exception $e) {
      $this->sendJsonConsultas(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
  public function actualizarConsultaMedica(int $id): void
  {
    try {
      $d = $this->parseJsonInputConsultas();
      $pdo = Conexion::obtener();
      $row = self::obtener($pdo, $id);
      if (!$row) {
        $this->sendJsonConsultas(404, 'error', 'No encontrada');
        return;
      }
      $obj = new ConsultasMedicas($d);
      $obj->id_consulta = $id;
      $r = $obj->actualizar($pdo);
      if (is_array($r)) {
        $this->sendJsonConsultas(400, 'error', 'Validación', null, $r);
        return;
      }
      $this->sendJsonConsultas($r ? 200 : 500, $r ? 'success' : 'error', $r ? 'Actualizada' : 'Fallo', self::obtener($pdo, $id));
    } catch (Exception $e) {
      $this->sendJsonConsultas(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
  public function eliminarConsultaMedica(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $ok = ConsultasMedicasGestionTrait::eliminar($pdo, $id);
      $this->sendJsonConsultas($ok ? 200 : 500, $ok ? 'success' : 'error', $ok ? 'Eliminada' : 'No eliminada');
    } catch (Exception $e) {
      $this->sendJsonConsultas(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
  public function listarConsultasMedicasEstudiante(int $fk_estudiante): void
  {
    try {
      $pdo = Conexion::obtener();
      $rows = self::listarPorEstudiante($pdo, $fk_estudiante);
      $this->sendJsonConsultas(200, 'success', 'Listado obtenido', $rows);
    } catch (Exception $e) {
      $this->sendJsonConsultas(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
}
