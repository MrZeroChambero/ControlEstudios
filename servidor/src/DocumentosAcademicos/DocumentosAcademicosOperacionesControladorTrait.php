<?php

namespace Micodigo\DocumentosAcademicos;

use Micodigo\Config\Conexion;
use Micodigo\Utils\RespuestaJson;
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
  public function crearDocumentoAcademico(): void
  {
    try {
      $d = $this->parseJsonInputDocs();
      $pdo = Conexion::obtener();
      $obj = new DocumentosAcademicos($d);
      $r = $obj->crear($pdo);
      if (is_array($r)) {
        RespuestaJson::error('La información proporcionada no es válida.', 400, $r);
        return;
      }
      RespuestaJson::exito($obj, 'Documento académico creado correctamente.', 201);
    } catch (Exception $e) {
      RespuestaJson::error('Ocurrió un problema al crear el documento académico.', 500, null, $e);
    }
  }
  public function actualizarDocumentoAcademico(int $id): void
  {
    try {
      $d = $this->parseJsonInputDocs();
      $pdo = Conexion::obtener();
      $row = self::obtener($pdo, $id);
      if (!$row) {
        RespuestaJson::error('Documento académico no encontrado.', 404);
        return;
      }
      $obj = new DocumentosAcademicos($d);
      $obj->id_documento = $id;
      $r = $obj->actualizar($pdo);
      if (is_array($r)) {
        RespuestaJson::error('La información proporcionada no es válida.', 400, $r);
        return;
      }
      if (!$r) {
        RespuestaJson::error('No se pudo actualizar el documento académico.', 500);
        return;
      }

      $actualizado = self::obtener($pdo, $id);
      RespuestaJson::exito($actualizado, 'Documento académico actualizado correctamente.');
    } catch (Exception $e) {
      RespuestaJson::error('Ocurrió un problema al actualizar el documento académico.', 500, null, $e);
    }
  }
  public function eliminarDocumentoAcademico(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $ok = DocumentosAcademicosGestionTrait::eliminar($pdo, $id);
      if (!$ok) {
        RespuestaJson::error('No fue posible eliminar el documento académico.', 500);
        return;
      }

      RespuestaJson::exito(['id_documento' => $id], 'Documento académico eliminado correctamente.');
    } catch (Exception $e) {
      RespuestaJson::error('Ocurrió un problema al eliminar el documento académico.', 500, null, $e);
    }
  }
  public function listarDocumentosEstudiante(int $fk_estudiante): void
  {
    try {
      $pdo = Conexion::obtener();
      $rows = self::listarPorEstudiante($pdo, $fk_estudiante);
      RespuestaJson::exito($rows, 'Listado de documentos académicos obtenido correctamente.');
    } catch (Exception $e) {
      RespuestaJson::error('Ocurrió un problema al listar los documentos académicos.', 500, null, $e);
    }
  }
}
