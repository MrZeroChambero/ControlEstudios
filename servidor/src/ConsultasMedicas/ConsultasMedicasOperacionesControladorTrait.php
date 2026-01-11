<?php

namespace Micodigo\ConsultasMedicas;

use Micodigo\Config\Conexion;
use Micodigo\Utils\RespuestaJson;
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
  public function crearConsultaMedica(): void
  {
    try {
      $d = $this->parseJsonInputConsultas();
      $pdo = Conexion::obtener();
      $obj = new ConsultasMedicas($d);
      $r = $obj->crear($pdo);
      if (is_array($r)) {
        RespuestaJson::error('La información proporcionada no es válida.', 400, $r);
        return;
      }
      RespuestaJson::exito($obj, 'Consulta creada correctamente.', 201);
    } catch (Exception $e) {
      RespuestaJson::error('Ocurrió un problema al crear la consulta médica.', 500, null, $e);
    }
  }
  public function actualizarConsultaMedica(int $id): void
  {
    try {
      $d = $this->parseJsonInputConsultas();
      $pdo = Conexion::obtener();
      $row = self::obtener($pdo, $id);
      if (!$row) {
        RespuestaJson::error('Consulta médica no encontrada.', 404);
        return;
      }
      $obj = new ConsultasMedicas($d);
      $obj->id_consulta = $id;
      $r = $obj->actualizar($pdo);
      if (is_array($r)) {
        RespuestaJson::error('La información proporcionada no es válida.', 400, $r);
        return;
      }
      if (!$r) {
        RespuestaJson::error('No se pudo actualizar la consulta médica.', 500);
        return;
      }

      $actualizada = self::obtener($pdo, $id);
      RespuestaJson::exito($actualizada, 'Consulta médica actualizada correctamente.');
    } catch (Exception $e) {
      RespuestaJson::error('Ocurrió un problema al actualizar la consulta médica.', 500, null, $e);
    }
  }
  public function eliminarConsultaMedica(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $ok = ConsultasMedicasGestionTrait::eliminar($pdo, $id);
      if (!$ok) {
        RespuestaJson::error('No fue posible eliminar la consulta médica.', 500);
        return;
      }

      RespuestaJson::exito(['id_consulta' => $id], 'Consulta médica eliminada correctamente.');
    } catch (Exception $e) {
      RespuestaJson::error('Ocurrió un problema al eliminar la consulta médica.', 500, null, $e);
    }
  }
  public function listarConsultasMedicasEstudiante(int $fk_estudiante): void
  {
    try {
      $pdo = Conexion::obtener();
      $rows = self::listarPorEstudiante($pdo, $fk_estudiante);
      RespuestaJson::exito($rows, 'Listado de consultas médicas obtenido correctamente.');
    } catch (Exception $e) {
      RespuestaJson::error('Ocurrió un problema al listar las consultas médicas.', 500, null, $e);
    }
  }
}
