<?php

namespace Micodigo\Parentesco;

use Micodigo\Config\Conexion;
use Micodigo\Utils\RespuestaJson;
use Exception;
use PDO;
use RuntimeException;

trait OperacionesControladorParentesco
{
  private function parseJsonInput(): array
  {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
      throw new RuntimeException('El cuerpo de la solicitud debe contener JSON válido.');
    }
    return $data ?? [];
  }

  public function listarParentescos(): void
  {
    try {
      $pdo = Conexion::obtener();
      $lista = ConsultasParentesco::consultarTodosParentescos($pdo);
      RespuestaJson::exito($lista, 'Parentescos obtenidos.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al listar parentescos.', 500, null, $e);
    }
  }

  public function obtenerParentesco(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $r = ConsultasParentesco::consultarParentescoPorId($pdo, $id);
      if ($r) {
        RespuestaJson::exito($r, 'Parentesco obtenido.');
      } else {
        RespuestaJson::error('Parentesco no encontrado.', 404);
      }
    } catch (Exception $e) {
      RespuestaJson::error('Error al obtener parentesco.', 500, null, $e);
    }
  }

  public function listarPorEstudiante(int $id_estudiante): void
  {
    try {
      $pdo = Conexion::obtener();
      $lista = ConsultasParentesco::consultarParentescosPorEstudiante($pdo, $id_estudiante);
      RespuestaJson::exito($lista, 'Parentescos del estudiante.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al listar por estudiante.', 500, null, $e);
    }
  }

  public function listarPorRepresentante(int $id_representante): void
  {
    try {
      $pdo = Conexion::obtener();
      $lista = ConsultasParentesco::consultarParentescosPorRepresentante($pdo, $id_representante);
      RespuestaJson::exito($lista, 'Parentescos del representante.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al listar por representante.', 500, null, $e);
    }
  }

  public function crearParentesco(): void
  {
    try {
      $data = $this->parseJsonInput();
      $pdo = Conexion::obtener();
      $val = ValidacionesParentesco::validarDatosCrear($pdo, $data);
      if ($val !== true) {
        RespuestaJson::error('Datos inválidos.', 422, $val);
        return;
      }
      $id = GestionParentesco::crearParentescoBD($pdo, $data);
      $nuevo = ConsultasParentesco::consultarParentescoPorId($pdo, $id);
      RespuestaJson::exito($nuevo, 'Parentesco creado.', 201);
    } catch (RuntimeException $e) {
      RespuestaJson::error($e->getMessage(), 400);
    } catch (Exception $e) {
      RespuestaJson::error('Error al crear parentesco.', 500, null, $e);
    }
  }

  public function actualizarParentesco(int $id): void
  {
    try {
      $data = $this->parseJsonInput();
      $pdo = Conexion::obtener();
      $val = ValidacionesParentesco::validarDatosActualizar($pdo, $id, $data);
      if ($val !== true) {
        RespuestaJson::error('Datos inválidos.', 422, $val);
        return;
      }
      $ok = GestionParentesco::actualizarParentescoBD($pdo, $id, $data);
      $act = ConsultasParentesco::consultarParentescoPorId($pdo, $id);
      RespuestaJson::exito([
        'updated' => $ok,
        'data' => $act,
      ], 'Parentesco actualizado.');
    } catch (RuntimeException $e) {
      RespuestaJson::error($e->getMessage(), 400);
    } catch (Exception $e) {
      RespuestaJson::error('Error al actualizar parentesco.', 500, null, $e);
    }
  }

  public function eliminarParentesco(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $ok = GestionParentesco::eliminarParentescoBD($pdo, $id);
      if (!$ok) {
        RespuestaJson::error('No se pudo eliminar el parentesco.', 404);
        return;
      }

      RespuestaJson::exito(['deleted' => true], 'Parentesco eliminado.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al eliminar parentesco.', 500, null, $e);
    }
  }

  public function listarTipos(): void
  {
    try {
      $pdo = Conexion::obtener();
      // Usar configuración dinámica desde JSON con fallback
      $tipos = TiposParentesco::obtenerTiposPermitidos($pdo);
      RespuestaJson::exito($tipos, 'Tipos de parentesco.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al obtener tipos.', 500, null, $e);
    }
  }
}
