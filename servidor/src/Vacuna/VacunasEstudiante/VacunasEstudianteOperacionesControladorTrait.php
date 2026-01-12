<?php

namespace Micodigo\Vacuna\VacunasEstudiante;

use Micodigo\Config\Conexion;
use Micodigo\Utils\RespuestaJson;
use Exception;
use RuntimeException;

trait VacunasEstudianteOperacionesControladorTrait
{
  private function leerEntradaJsonVacunasEst(): array
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
  public function asignarVacuna(): void
  {
    try {
      $d = $this->leerEntradaJsonVacunasEst();
      $pdo = Conexion::obtener();
      $obj = new VacunasEstudiante($d);
      $res = $obj->crear($pdo);
      if (is_array($res)) {
        RespuestaJson::error('Los datos proporcionados no son válidos.', 422, $res);
        return;
      }
      RespuestaJson::exito($obj, 'Vacuna asignada correctamente.', 201);
    } catch (RuntimeException $e) {
      RespuestaJson::error($e->getMessage(), 400);
    } catch (Exception $e) {
      RespuestaJson::error('Error al gestionar las vacunas del estudiante.', 500, null, $e);
    }
  }
  public function actualizarVacunaEstudiante(int $id): void
  {
    try {
      $d = $this->leerEntradaJsonVacunasEst();
      $pdo = Conexion::obtener();
      $row = self::obtener($pdo, $id);
      if (!$row) {
        RespuestaJson::error('La vacuna asignada no existe.', 404);
        return;
      }
      $obj = new VacunasEstudiante($d);
      $obj->id_vacuna_estudiante = $id;
      $res = $obj->actualizar($pdo);
      if (is_array($res)) {
        RespuestaJson::error('Los datos proporcionados no son válidos.', 422, $res);
        return;
      }
      if ($res !== true) {
        RespuestaJson::error('No se pudo actualizar el registro de vacuna.', 500);
        return;
      }

      RespuestaJson::exito(self::obtener($pdo, $id), 'Registro de vacuna actualizado correctamente.');
    } catch (RuntimeException $e) {
      RespuestaJson::error($e->getMessage(), 400);
    } catch (Exception $e) {
      RespuestaJson::error('Error al gestionar las vacunas del estudiante.', 500, null, $e);
    }
  }
  public function eliminarVacunaEstudiante(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $ok = VacunasEstudianteGestionTrait::eliminar($pdo, $id);
      if (!$ok) {
        RespuestaJson::error('No se pudo eliminar el registro de vacuna.', 500);
        return;
      }

      RespuestaJson::exito(null, 'Registro de vacuna eliminado correctamente.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al gestionar las vacunas del estudiante.', 500, null, $e);
    }
  }
  public function listarVacunasEstudiante(int $fk_estudiante): void
  {
    try {
      $pdo = Conexion::obtener();
      $rows = self::listarPorEstudiante($pdo, $fk_estudiante);
      RespuestaJson::exito($rows, 'Vacunas del estudiante obtenidas correctamente.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al gestionar las vacunas del estudiante.', 500, null, $e);
    }
  }
}
