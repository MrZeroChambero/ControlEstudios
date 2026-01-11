<?php

namespace Micodigo\Estudiante;

use Micodigo\Config\Conexion;
use Micodigo\Persona\Persona;
use Micodigo\Utils\RespuestaJson;
use Exception;

trait OperacionesControladorEstudiante
{
  private function parseJsonInput(): array
  {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());
    return $data ?? [];
  }

  // Crear persona candidata (estado incompleto)
  public function crearCandidato(): void
  {
    try {
      $data = $this->parseJsonInput();
      $v = $this->crearValidadorPersonaEstudiante($data);
      if (!$v->validate()) {
        RespuestaJson::error('Errores de validación.', 400, $v->errors());
        return;
      }
      $pdo = Conexion::obtener();
      $id_persona = self::crearPersonaEstudiante($pdo, $data);
      $persona = Persona::consultar($pdo, $id_persona);
      RespuestaJson::exito($persona, 'Candidato creado exitosamente.', 201);
    } catch (Exception $e) {
      RespuestaJson::error('Error al crear candidato.', 500, null, $e);
    }
  }

  // Registrar estudiante (activo) desde candidato
  public function registrarEstudianteEndpoint(int $id_persona): void
  {
    try {
      $data = $this->parseJsonInput();
      $v = $this->crearValidadorRegistroEstudiante($data);
      if (!$v->validate()) {
        RespuestaJson::error('Errores de validación.', 400, $v->errors());
        return;
      }
      $pdo = Conexion::obtener();
      $persona = Persona::consultar($pdo, $id_persona);
      if (!$persona) {
        RespuestaJson::error('Persona no encontrada.', 404);
        return;
      }
      if ($persona['tipo_persona'] !== 'estudiante' || $persona['estado'] !== 'incompleto') {
        RespuestaJson::error('La persona no es candidata válida.', 400);
        return;
      }
      try {
        $id_est = self::registrarEstudiante($pdo, $id_persona, $data);
      } catch (\RuntimeException $e) {
        RespuestaJson::error($e->getMessage(), 400);
        return;
      }
      $est = self::consultarEstudiantePorId($pdo, $id_est);
      RespuestaJson::exito($est, 'Estudiante registrado exitosamente.', 201);
    } catch (Exception $e) {
      RespuestaJson::error('Error al registrar estudiante.', 500, null, $e);
    }
  }

  public function listarCandidatos(): void
  {
    try {
      $pdo = Conexion::obtener();
      $rows = self::consultarCandidatos($pdo);
      RespuestaJson::exito($rows, 'Candidatos obtenidos.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al listar candidatos.', 500, null, $e);
    }
  }

  public function listarEstudiantes(): void
  {
    try {
      $pdo = Conexion::obtener();
      $rows = self::consultarTodosEstudiantes($pdo);
      RespuestaJson::exito($rows, 'Estudiantes obtenidos.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al listar estudiantes.', 500, null, $e);
    }
  }

  public function obtenerEstudiante(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $row = self::consultarEstudiantePorId($pdo, $id);
      if ($row) {
        RespuestaJson::exito($row, 'Estudiante encontrado.');
      } else {
        RespuestaJson::error('Estudiante no encontrado.', 404);
      }
    } catch (Exception $e) {
      RespuestaJson::error('Error al obtener estudiante.', 500, null, $e);
    }
  }

  public function actualizarEstudianteEndpoint(int $id_estudiante): void
  {
    try {
      $data = $this->parseJsonInput();
      $pdo = Conexion::obtener();
      $actual = self::consultarEstudiantePorId($pdo, $id_estudiante);
      if (!$actual) {
        RespuestaJson::error('Estudiante no encontrado.', 404);
        return;
      }
      $ok = self::actualizarEstudiante($pdo, $id_estudiante, $data);
      $row = self::consultarEstudiantePorId($pdo, $id_estudiante);
      if (!$ok) {
        RespuestaJson::error('No se pudo actualizar el estudiante.', 500, null, $row ? ['id_estudiante' => ['Sin cambios aplicados.']] : null);
        return;
      }

      RespuestaJson::exito($row, 'Estudiante actualizado.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al actualizar estudiante.', 500, null, $e);
    }
  }

  public function cambiarEstadoEstudianteEndpoint(int $id_estudiante): void
  {
    try {
      $data = $this->parseJsonInput();
      if (!isset($data['estado'])) {
        RespuestaJson::error('Estado requerido.', 400, ['estado' => ['Campo obligatorio.']]);
        return;
      }
      $pdo = Conexion::obtener();
      $ok = self::cambiarEstadoEstudiante($pdo, $id_estudiante, $data['estado']);
      $row = self::consultarEstudiantePorId($pdo, $id_estudiante);
      if (!$ok) {
        RespuestaJson::error('Estado inválido o no se pudo actualizar.', 400);
        return;
      }

      RespuestaJson::exito($row, 'Estado cambiado.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al cambiar estado.', 500, null, $e);
    }
  }
}
