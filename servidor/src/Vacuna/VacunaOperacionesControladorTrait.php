<?php

namespace Micodigo\Vacuna;

use Micodigo\Config\Conexion;
use Micodigo\Utils\RespuestaJson;
use Exception;
use RuntimeException;

trait VacunaOperacionesControladorTrait
{
  private function leerEntradaJsonVacuna(): array
  {
    $contenido = file_get_contents('php://input');
    if ($contenido === false) {
      throw new RuntimeException('No fue posible leer la solicitud.');
    }

    $contenido = trim($contenido);
    if ($contenido === '') {
      return [];
    }

    $datos = json_decode($contenido, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($datos)) {
      throw new RuntimeException('El cuerpo de la solicitud debe contener JSON válido: ' . json_last_error_msg());
    }

    return $datos;
  }
  public function crearVacuna(): void
  {
    try {
      $data = $this->leerEntradaJsonVacuna();
      $nombre = isset($data['nombre']) ? trim((string) $data['nombre']) : '';

      if ($nombre === '') {
        RespuestaJson::error('El nombre de la vacuna es requerido.', 422, [
          'nombre' => ['Este campo es obligatorio.'],
        ]);
        return;
      }
      $pdo = Conexion::obtener();
      $vacuna = new Vacuna(['nombre' => $nombre]);
      $resultado = $vacuna->crear($pdo);
      if (is_array($resultado)) {
        RespuestaJson::error('Los datos proporcionados no son válidos.', 422, $resultado);
        return;
      }
      RespuestaJson::exito($vacuna, 'Vacuna creada.', 201);
    } catch (RuntimeException $e) {
      RespuestaJson::error($e->getMessage(), 400);
    } catch (Exception $e) {
      RespuestaJson::error('Error al gestionar la vacuna.', 500, null, $e);
    }
  }
  public function actualizarVacuna(int $id): void
  {
    try {
      $data = $this->leerEntradaJsonVacuna();
      $pdo = Conexion::obtener();
      $row = self::obtener($pdo, $id);
      if (!$row) {
        RespuestaJson::error('La vacuna solicitada no existe.', 404);
        return;
      }
      $vacuna = new Vacuna(['nombre' => $data['nombre'] ?? $row['nombre']]);
      $vacuna->id_vacuna = $id;
      $resultado = $vacuna->actualizar($pdo);
      if (is_array($resultado)) {
        RespuestaJson::error('Los datos proporcionados no son válidos.', 422, $resultado);
        return;
      }
      if ($resultado !== true) {
        RespuestaJson::error('No se pudo actualizar la vacuna.', 500);
        return;
      }

      RespuestaJson::exito(self::obtener($pdo, $id), 'Vacuna actualizada correctamente.');
    } catch (RuntimeException $e) {
      RespuestaJson::error($e->getMessage(), 400);
    } catch (Exception $e) {
      RespuestaJson::error('Error al gestionar la vacuna.', 500, null, $e);
    }
  }
  public function eliminarVacuna(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $ok = VacunaGestionTrait::eliminar($pdo, $id);
      if (!$ok) {
        RespuestaJson::error('No se pudo eliminar la vacuna.', 500);
        return;
      }

      RespuestaJson::exito(null, 'Vacuna eliminada correctamente.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al gestionar la vacuna.', 500, null, $e);
    }
  }
  public function listarVacunas(): void
  {
    try {
      $pdo = Conexion::obtener();
      $rows = self::listar($pdo);
      RespuestaJson::exito($rows, 'Vacunas obtenidas correctamente.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al gestionar la vacuna.', 500, null, $e);
    }
  }
}
