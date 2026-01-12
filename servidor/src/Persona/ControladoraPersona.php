<?php

namespace Micodigo\Persona;

use Micodigo\Config\Conexion;
use Micodigo\Utils\RespuestaJson;
use Exception;
use PDO;
use RuntimeException;

class ControladoraPersona
{
  /**
   * Parsear JSON del cuerpo de la petición.
   */
  private function parseJsonInput(): array
  {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
      throw new RuntimeException('El cuerpo de la solicitud debe contener JSON válido.');
    }
    return $data ?? [];
  }

  /** Listar personas (opcional filtro tipo_persona). */
  public function listarPersonas(): void
  {
    try {
      $pdo = Conexion::obtener();
      $filtros = [];
      if (isset($_GET['tipo_persona'])) {
        $filtros['tipo_persona'] = $_GET['tipo_persona'];
      }
      $personas = Persona::consultarTodos($pdo, $filtros);
      RespuestaJson::exito($personas, 'Personas obtenidas.');
    } catch (Exception $e) {
      RespuestaJson::error('Error del servidor al obtener personas.', 500, null, $e);
    }
  }

  /** Obtener persona por ID. */
  public function obtenerPersona(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $persona = Persona::consultar($pdo, $id);
      if ($persona) {
        RespuestaJson::exito($persona, 'Persona encontrada.');
      } else {
        RespuestaJson::error('Persona no encontrada.', 404);
      }
    } catch (Exception $e) {
      RespuestaJson::error('Error del servidor al consultar persona.', 500, null, $e);
    }
  }

  /** Crear nueva persona. */
  public function crearPersona(): void
  {
    try {
      $data = $this->parseJsonInput();
      if (empty($data)) {
        RespuestaJson::error('El cuerpo de la solicitud está vacío.', 400);
        return;
      }
      $persona = new Persona($data);
      $pdo = Conexion::obtener();
      $resultado = $persona->crear($pdo);
      if (is_numeric($resultado)) {
        $persona->id_persona = $resultado;
        RespuestaJson::exito($persona, 'Persona creada exitosamente.', 201);
      } elseif (is_array($resultado)) {
        RespuestaJson::error('Error de validación.', 422, $resultado);
      } else {
        RespuestaJson::error('No se pudo crear la persona.', 500);
      }
    } catch (RuntimeException $e) {
      RespuestaJson::error($e->getMessage(), 400);
    } catch (Exception $e) {
      RespuestaJson::error('Error en el servidor al crear la persona.', 500, null, $e);
    }
  }

  /** Actualizar persona existente. */
  public function actualizarPersona(int $id): void
  {
    try {
      $data = $this->parseJsonInput();
      if (empty($data)) {
        RespuestaJson::error('El cuerpo de la solicitud está vacío.', 400);
        return;
      }
      $pdo = Conexion::obtener();
      if (!Persona::consultar($pdo, $id)) {
        RespuestaJson::error('Persona no encontrada.', 404);
        return;
      }
      $persona = new Persona($data);
      $persona->id_persona = $id;
      $resultado = $persona->actualizar($pdo);
      if ($resultado === true) {
        RespuestaJson::exito(null, 'Persona actualizada exitosamente.');
      } elseif (is_array($resultado)) {
        RespuestaJson::error('Error de validación.', 422, $resultado);
      } else {
        RespuestaJson::error('No se pudo actualizar la persona.', 500);
      }
    } catch (RuntimeException $e) {
      RespuestaJson::error($e->getMessage(), 400);
    } catch (Exception $e) {
      RespuestaJson::error('Error en el servidor al actualizar la persona.', 500, null, $e);
    }
  }

  /** Cambiar estado de persona. */
  public function cambiarEstadoPersona(int $id): void
  {
    try {
      $data = $this->parseJsonInput();
      if (!isset($data['estado'])) {
        RespuestaJson::error('El estado es requerido.', 400, [
          'estado' => ['Este campo es obligatorio.'],
        ]);
        return;
      }
      $pdo = Conexion::obtener();
      $stmt = $pdo->prepare('UPDATE personas SET estado = ? WHERE id_persona = ?');
      $stmt->execute([$data['estado'], $id]);
      if ($stmt->rowCount() > 0) {
        RespuestaJson::exito(null, 'Estado actualizado exitosamente.');
      } else {
        RespuestaJson::error('Persona no encontrada o estado sin cambios.', 404);
      }
    } catch (RuntimeException $e) {
      RespuestaJson::error($e->getMessage(), 400);
    } catch (Exception $e) {
      RespuestaJson::error('Error en el servidor al actualizar el estado.', 500, null, $e);
    }
  }

  /** Eliminar persona. */
  public function eliminarPersona(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      if (!Persona::consultar($pdo, $id)) {
        RespuestaJson::error('Persona no encontrada.', 404);
        return;
      }
      $resultado = Persona::eliminar($pdo, $id);
      if ($resultado === true) {
        RespuestaJson::exito(null, 'Persona eliminada exitosamente.');
      } elseif (is_array($resultado) && isset($resultado['error_fk'])) {
        RespuestaJson::error($resultado['error_fk'], 409);
      } else {
        RespuestaJson::error('No se pudo eliminar la persona.', 500);
      }
    } catch (Exception $e) {
      RespuestaJson::error('Error en el servidor al eliminar la persona.', 500, null, $e);
    }
  }
}
