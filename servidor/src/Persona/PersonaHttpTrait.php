<?php

namespace Micodigo\Persona;

use Micodigo\Config\Conexion;
use Exception;
use PDO;

trait PersonaHttpTrait
{
  private function parseJsonInput(): array
  {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
      throw new Exception('JSON inválido: ' . json_last_error_msg());
    }
    return $data ?? [];
  }

  private function sendJson(int $code, string $status, string $message, $data = null, $errors = null): void
  {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    $resp = [
      'status' => $status,
      'message' => $message,
      'back' => $status === 'success'
    ];
    if ($data !== null) $resp['data'] = $data;
    if ($errors !== null) $resp['errors'] = $errors;
    echo json_encode($resp, JSON_UNESCAPED_UNICODE);
  }

  public function listarPersonas(): void
  {
    try {
      $pdo = Conexion::obtener();
      $filtros = [];
      if (isset($_GET['tipo_persona'])) {
        $filtros['tipo_persona'] = $_GET['tipo_persona'];
      }
      $personas = self::consultarTodos($pdo, $filtros);
      $this->sendJson(200, 'success', 'Personas obtenidas.', $personas);
    } catch (Exception $e) {
      $this->sendJson(500, 'error', 'Error del servidor al obtener personas.');
    }
  }

  public function obtenerPersona(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $persona = self::consultar($pdo, $id);
      if ($persona) {
        $this->sendJson(200, 'success', 'Persona encontrada.', $persona);
      } else {
        $this->sendJson(404, 'error', 'Persona no encontrada.');
      }
    } catch (Exception $e) {
      $this->sendJson(500, 'error', 'Error del servidor al consultar persona.');
    }
  }

  public function crearPersona(): void
  {
    try {
      $data = $this->parseJsonInput();
      if (empty($data)) {
        $this->sendJson(400, 'error', 'Datos JSON inválidos o vacíos.');
        return;
      }
      $persona = new Persona($data);
      $pdo = Conexion::obtener();
      $resultado = $persona->crear($pdo);
      if (is_numeric($resultado)) {
        $persona->id_persona = $resultado;
        $this->sendJson(201, 'success', 'Persona creada exitosamente.', $persona);
      } elseif (is_array($resultado)) {
        $this->sendJson(400, 'error', 'Error de validación.', null, $resultado);
      } else {
        $this->sendJson(500, 'error', 'No se pudo crear la persona.');
      }
    } catch (Exception $e) {
      $this->sendJson(500, 'error', 'Error en el servidor: ' . $e->getMessage());
    }
  }

  public function actualizarPersona(int $id): void
  {
    try {
      $data = $this->parseJsonInput();
      if (empty($data)) {
        $this->sendJson(400, 'error', 'Datos JSON inválidos.');
        return;
      }
      $pdo = Conexion::obtener();
      if (!self::consultar($pdo, $id)) {
        $this->sendJson(404, 'error', 'Persona no encontrada.');
        return;
      }
      $persona = new Persona($data);
      $persona->id_persona = $id;
      $resultado = $persona->actualizar($pdo);
      if ($resultado === true) {
        $this->sendJson(200, 'success', 'Persona actualizada exitosamente.');
      } elseif (is_array($resultado)) {
        $this->sendJson(400, 'error', 'Error de validación.', null, $resultado);
      } else {
        $this->sendJson(500, 'error', 'No se pudo actualizar la persona.');
      }
    } catch (Exception $e) {
      $this->sendJson(500, 'error', 'Error en el servidor: ' . $e->getMessage());
    }
  }

  public function cambiarEstadoPersona(int $id): void
  {
    try {
      $data = $this->parseJsonInput();
      if (!isset($data['estado'])) {
        $this->sendJson(400, 'error', 'El estado es requerido.');
        return;
      }
      $pdo = Conexion::obtener();
      $stmt = $pdo->prepare('UPDATE personas SET estado = ? WHERE id_persona = ?');
      $stmt->execute([$data['estado'], $id]);
      if ($stmt->rowCount() > 0) {
        $this->sendJson(200, 'success', 'Estado actualizado exitosamente.');
      } else {
        $this->sendJson(404, 'error', 'Persona no encontrada o estado sin cambios.');
      }
    } catch (Exception $e) {
      $this->sendJson(500, 'error', 'Error en el servidor: ' . $e->getMessage());
    }
  }

  public function eliminarPersona(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      if (!self::consultar($pdo, $id)) {
        $this->sendJson(404, 'error', 'Persona no encontrada.');
        return;
      }
      $resultado = self::eliminar($pdo, $id);
      if ($resultado === true) {
        $this->sendJson(200, 'success', 'Persona eliminada exitosamente.');
      } elseif (is_array($resultado) && isset($resultado['error_fk'])) {
        $this->sendJson(409, 'error', $resultado['error_fk']);
      } else {
        $this->sendJson(500, 'error', 'No se pudo eliminar la persona.');
      }
    } catch (Exception $e) {
      $this->sendJson(500, 'error', 'Error en el servidor: ' . $e->getMessage());
    }
  }
}
