<?php

namespace Micodigo\Alergias;

use Micodigo\Config\Conexion;
use Micodigo\Utils\RespuestaJson;
use Exception;

trait AlergiasOperacionesControladorTrait
{
  private function parseJsonInputAlergia(): array
  {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());
    return $data ?? [];
  }

  public function crearAlergia(): void
  {
    try {
      $data = $this->parseJsonInputAlergia();
      if (empty($data['nombre'])) {
        RespuestaJson::error('El nombre de la alergia es requerido.', 400, ['nombre' => ['Campo obligatorio.']]);
        return;
      }
      $pdo = Conexion::obtener();
      $al = new Alergias(['nombre' => $data['nombre']]);
      $res = $al->crear($pdo);
      if (is_array($res)) {
        RespuestaJson::error('La información proporcionada no es válida.', 400, $res);
        return;
      }
      RespuestaJson::exito($al, 'Alergia creada.', 201);
    } catch (Exception $e) {
      RespuestaJson::error('Ocurrió un problema al crear la alergia.', 500, null, $e);
    }
  }

  public function actualizarAlergia(int $id): void
  {
    try {
      $data = $this->parseJsonInputAlergia();
      $pdo = Conexion::obtener();
      $row = self::obtener($pdo, $id);
      if (!$row) {
        RespuestaJson::error('La alergia solicitada no existe.', 404);
        return;
      }
      $al = new Alergias(['nombre' => $data['nombre'] ?? $row['nombre']]);
      $al->id_alergia = $id;
      $res = $al->actualizar($pdo);
      if (is_array($res)) {
        RespuestaJson::error('La información proporcionada no es válida.', 400, $res);
        return;
      }
      if (!$res) {
        RespuestaJson::error('No se pudo actualizar la alergia.', 500);
        return;
      }

      $actualizada = self::obtener($pdo, $id);
      RespuestaJson::exito($actualizada, 'Alergia actualizada correctamente.');
    } catch (Exception $e) {
      RespuestaJson::error('Ocurrió un problema al actualizar la alergia.', 500, null, $e);
    }
  }

  public function eliminarAlergia(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $ok = AlergiasGestionTrait::eliminar($pdo, $id);
      if (!$ok) {
        RespuestaJson::error('No fue posible eliminar la alergia.', 500);
        return;
      }

      RespuestaJson::exito(['id_alergia' => $id], 'Alergia eliminada correctamente.');
    } catch (Exception $e) {
      RespuestaJson::error('Ocurrió un problema al eliminar la alergia.', 500, null, $e);
    }
  }

  public function listarAlergias(): void
  {
    try {
      $pdo = Conexion::obtener();
      $rows = self::listar($pdo);
      RespuestaJson::exito($rows, 'Listado de alergias obtenido correctamente.');
    } catch (Exception $e) {
      RespuestaJson::error('Ocurrió un problema al listar las alergias.', 500, null, $e);
    }
  }
}
