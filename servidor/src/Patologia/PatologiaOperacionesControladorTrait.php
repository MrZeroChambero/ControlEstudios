<?php

namespace Micodigo\Patologia;

use Micodigo\Config\Conexion;
use Micodigo\Utils\RespuestaJson;
use Exception;
use RuntimeException;

trait PatologiaOperacionesControladorTrait
{
  private function parseJsonInputPatologia(): array
  {
    $raw = file_get_contents('php://input');
    $d = json_decode($raw, true);
    if ($d === null && json_last_error() !== JSON_ERROR_NONE) {
      throw new RuntimeException('El cuerpo de la solicitud debe contener JSON válido.');
    }
    return $d ?? [];
  }
  public function crearPatologia(): void
  {
    try {
      $d = $this->parseJsonInputPatologia();
      if (empty($d['nombre_patologia'])) {
        RespuestaJson::error('El nombre de la patología es requerido.', 400, [
          'nombre_patologia' => ['Este campo es obligatorio.'],
        ]);
        return;
      }
      $pdo = Conexion::obtener();
      $p = new Patologia($d);
      $res = $p->crear($pdo);
      if (is_array($res)) {
        RespuestaJson::error('Los datos proporcionados no son válidos.', 422, $res);
        return;
      }
      RespuestaJson::exito($p, 'Patología creada.', 201);
    } catch (RuntimeException $e) {
      RespuestaJson::error($e->getMessage(), 400);
    } catch (Exception $e) {
      RespuestaJson::error('Error al crear la patología.', 500, null, $e);
    }
  }
  public function actualizarPatologia(int $id): void
  {
    try {
      $d = $this->parseJsonInputPatologia();
      $pdo = Conexion::obtener();
      $row = self::obtener($pdo, $id);
      if (!$row) {
        RespuestaJson::error('La patología solicitada no existe.', 404);
        return;
      }
      $p = new Patologia(['nombre_patologia' => $d['nombre_patologia'] ?? $row['nombre_patologia'], 'descripcion' => $d['descripcion'] ?? $row['descripcion']]);
      $p->id_patologia = $id;
      $res = $p->actualizar($pdo);
      if (is_array($res)) {
        RespuestaJson::error('Los datos proporcionados no son válidos.', 422, $res);
        return;
      }
      if (!$res) {
        RespuestaJson::error('No se pudo actualizar la patología.', 500);
        return;
      }

      RespuestaJson::exito(self::obtener($pdo, $id), 'Patología actualizada.');
    } catch (RuntimeException $e) {
      RespuestaJson::error($e->getMessage(), 400);
    } catch (Exception $e) {
      RespuestaJson::error('Error al actualizar la patología.', 500, null, $e);
    }
  }
  public function eliminarPatologia(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $ok = PatologiaGestionTrait::eliminar($pdo, $id);
      if (!$ok) {
        RespuestaJson::error('No se pudo eliminar la patología.', 404);
        return;
      }

      RespuestaJson::exito(null, 'Patología eliminada.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al eliminar la patología.', 500, null, $e);
    }
  }
  public function listarPatologias(): void
  {
    try {
      $pdo = Conexion::obtener();
      $rows = self::listar($pdo);
      RespuestaJson::exito($rows, 'Listado de patologías obtenido.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al listar patologías.', 500, null, $e);
    }
  }
}
