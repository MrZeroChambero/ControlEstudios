<?php

namespace Micodigo\DocumentosAcademicos;

use Micodigo\Config\Conexion;
use Exception;

trait DocumentosAcademicosOperacionesControladorTrait
{
  private function parseJsonInputDocs(): array
  {
    $raw = file_get_contents('php://input');
    $d = json_decode($raw, true);
    if ($d === null && json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());
    return $d ?? [];
  }
  private function sendJsonDocs(int $c, string $s, string $m, $data = null, $err = null): void
  {
    http_response_code($c);
    header('Content-Type: application/json; charset=utf-8');
    $r = ['status' => $s, 'message' => $m, 'back' => $s === 'success'];
    if ($data !== null) $r['data'] = $data;
    if ($err !== null) $r['errors'] = $err;
    echo json_encode($r, JSON_UNESCAPED_UNICODE);
  }
  public function crearDocumentoAcademico(): void
  {
    try {
      $d = $this->parseJsonInputDocs();
      $pdo = Conexion::obtener();
      $obj = new DocumentosAcademicos($d);
      $r = $obj->crear($pdo);
      if (is_array($r)) {
        $this->sendJsonDocs(400, 'error', 'Validación', null, $r);
        return;
      }
      $this->sendJsonDocs(201, 'success', 'Documento creado', $obj);
    } catch (Exception $e) {
      $this->sendJsonDocs(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
  public function actualizarDocumentoAcademico(int $id): void
  {
    try {
      $d = $this->parseJsonInputDocs();
      $pdo = Conexion::obtener();
      $row = self::obtener($pdo, $id);
      if (!$row) {
        $this->sendJsonDocs(404, 'error', 'No encontrado');
        return;
      }
      $obj = new DocumentosAcademicos($d);
      $obj->id_documento = $id;
      $r = $obj->actualizar($pdo);
      if (is_array($r)) {
        $this->sendJsonDocs(400, 'error', 'Validación', null, $r);
        return;
      }
      $this->sendJsonDocs($r ? 200 : 500, $r ? 'success' : 'error', $r ? 'Actualizado' : 'Fallo', self::obtener($pdo, $id));
    } catch (Exception $e) {
      $this->sendJsonDocs(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
  public function eliminarDocumentoAcademico(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $ok = DocumentosAcademicosGestionTrait::eliminar($pdo, $id);
      $this->sendJsonDocs($ok ? 200 : 500, $ok ? 'success' : 'error', $ok ? 'Eliminado' : 'No eliminado');
    } catch (Exception $e) {
      $this->sendJsonDocs(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
  public function listarDocumentosEstudiante(int $fk_estudiante): void
  {
    try {
      $pdo = Conexion::obtener();
      $rows = self::listarPorEstudiante($pdo, $fk_estudiante);
      $this->sendJsonDocs(200, 'success', 'Listado obtenido', $rows);
    } catch (Exception $e) {
      $this->sendJsonDocs(500, 'error', 'Error: ' . $e->getMessage());
    }
  }
}
