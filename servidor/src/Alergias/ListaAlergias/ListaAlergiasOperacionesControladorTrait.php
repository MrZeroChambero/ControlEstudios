<?php

namespace Micodigo\Alergias\ListaAlergias;

use Micodigo\Config\Conexion;
use Micodigo\Utils\RespuestaJson;
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
  public function asignarAlergia(): void
  {
    try {
      $d = $this->parseJsonInputListaAlergias();
      $pdo = Conexion::obtener();
      $obj = new ListaAlergias(['fk_alergia' => $d['fk_alergia'] ?? null, 'fk_estudiante' => $d['fk_estudiante'] ?? null]);
      $r = $obj->crear($pdo);
      if (is_array($r)) {
        RespuestaJson::error('La información proporcionada no es válida.', 400, $r);
        return;
      }
      RespuestaJson::exito($obj, 'Alergia asignada correctamente.', 201);
    } catch (Exception $e) {
      RespuestaJson::error('Ocurrió un problema al asignar la alergia.', 500, null, $e);
    }
  }
  public function eliminarAlergiaAsignada(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $ok = ListaAlergiasGestionTrait::eliminar($pdo, $id);
      if (!$ok) {
        RespuestaJson::error('No fue posible eliminar la asignación.', 500);
        return;
      }

      RespuestaJson::exito(['id_lista_alergia' => $id], 'Alergia desasignada correctamente.');
    } catch (Exception $e) {
      RespuestaJson::error('Ocurrió un problema al eliminar la asignación de alergia.', 500, null, $e);
    }
  }
  public function listarAlergiasEstudiante(int $id_estudiante): void
  {
    try {
      $pdo = Conexion::obtener();
      $rows = self::listarPorEstudiante($pdo, $id_estudiante);
      RespuestaJson::exito($rows, 'Listado de alergias del estudiante obtenido correctamente.');
    } catch (Exception $e) {
      RespuestaJson::error('Ocurrió un problema al listar las alergias del estudiante.', 500, null, $e);
    }
  }
}
