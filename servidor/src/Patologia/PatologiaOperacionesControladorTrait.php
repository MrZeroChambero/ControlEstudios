<?php

namespace Micodigo\Patologia;

use Micodigo\Config\Conexion;
use Exception;

trait PatologiaOperacionesControladorTrait
{
  private function parseJsonInputPatologia(): array
  {
    $raw = file_get_contents('php://input');
    $d = json_decode($raw, true);
    if ($d === null && json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());
    return $d ?? [];
  }
  private function sendJsonPatologia(int $c, string $s, string $m, $data = null, $err = null): void
  {
    http_response_code($c);
    header('Content-Type: application/json; charset=utf-8');
    $r = ['status' => $s, 'message' => $m, 'back' => $s === 'success'];
    if ($data !== null) $r['data'] = $data;
    if ($err !== null) $r['errors'] = $err;
    echo json_encode($r, JSON_UNESCAPED_UNICODE);
  }
  public function crearPatologia(): void
  {
    try {
      $d = $this->parseJsonInputPatologia();
      if (empty($d['nombre_patologia'])) {
        $this->sendJsonPatologia(400, 'error', 'Nombre requerido');
        return;
      }
      $pdo = Conexion::obtener();
      $p = new Patologia($d);
      $res = $p->crear($pdo);
      if (is_array($res)) {
        $this->sendJsonPatologia(400, 'error', 'Validación', null, $res);
        return;
      }
      $this->sendJsonPatologia(201, 'success', 'Patología creada', $p);
    } catch (Exception $e) {
      $this->sendJsonPatologia(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
  public function actualizarPatologia(int $id): void
  {
    try {
      $d = $this->parseJsonInputPatologia();
      $pdo = Conexion::obtener();
      $row = self::obtener($pdo, $id);
      if (!$row) {
        $this->sendJsonPatologia(404, 'error', 'No encontrada');
        return;
      }
      $p = new Patologia(['nombre_patologia' => $d['nombre_patologia'] ?? $row['nombre_patologia'], 'descripcion' => $d['descripcion'] ?? $row['descripcion']]);
      $p->id_patologia = $id;
      $res = $p->actualizar($pdo);
      if (is_array($res)) {
        $this->sendJsonPatologia(400, 'error', 'Validación', null, $res);
        return;
      }
      $this->sendJsonPatologia($res ? 200 : 500, $res ? 'success' : 'error', $res ? 'Actualizada' : 'Fallo', self::obtener($pdo, $id));
    } catch (Exception $e) {
      $this->sendJsonPatologia(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
  public function eliminarPatologia(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $ok = PatologiaGestionTrait::eliminar($pdo, $id);
      $this->sendJsonPatologia($ok ? 200 : 500, $ok ? 'success' : 'error', $ok ? 'Eliminada' : 'No eliminada');
    } catch (Exception $e) {
      $this->sendJsonPatologia(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
  public function listarPatologias(): void
  {
    try {
      $pdo = Conexion::obtener();
      $rows = self::listar($pdo);
      $this->sendJsonPatologia(200, 'success', 'Listado', $rows);
    } catch (Exception $e) {
      $this->sendJsonPatologia(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
}
