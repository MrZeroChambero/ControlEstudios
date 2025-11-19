<?php

namespace Micodigo\Estudiante;

use Micodigo\Config\Conexion;
use Micodigo\Persona\Persona;
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

  private function sendJson(int $code, string $status, string $message, $data = null, $errors = null): void
  {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    $resp = ['status' => $status, 'message' => $message, 'back' => $status === 'success'];
    if ($data !== null) $resp['data'] = $data;
    if ($errors !== null) $resp['errors'] = $errors;
    echo json_encode($resp, JSON_UNESCAPED_UNICODE);
  }

  // Crear persona candidata (estado incompleto)
  public function crearCandidato(): void
  {
    try {
      $data = $this->parseJsonInput();
      $v = $this->crearValidadorPersonaEstudiante($data);
      if (!$v->validate()) {
        $this->sendJson(400, 'error', 'Errores de validación.', null, $v->errors());
        return;
      }
      $pdo = Conexion::obtener();
      $id_persona = self::crearPersonaEstudiante($pdo, $data);
      $persona = Persona::consultar($pdo, $id_persona);
      $this->sendJson(201, 'success', 'Candidato creado exitosamente.', $persona);
    } catch (Exception $e) {
      $this->sendJson(500, 'error', 'Error al crear candidato: ' . $e->getMessage());
    }
  }

  // Registrar estudiante (activo) desde candidato
  public function registrarEstudianteEndpoint(int $id_persona): void
  {
    try {
      $data = $this->parseJsonInput();
      $v = $this->crearValidadorRegistroEstudiante($data);
      if (!$v->validate()) {
        $this->sendJson(400, 'error', 'Errores de validación.', null, $v->errors());
        return;
      }
      $grado = (int)$data['grado'];
      $pdo = Conexion::obtener();
      $persona = Persona::consultar($pdo, $id_persona);
      if (!$persona) {
        $this->sendJson(404, 'error', 'Persona no encontrada.');
        return;
      }
      if ($persona['tipo_persona'] !== 'estudiante' || $persona['estado'] !== 'incompleto') {
        $this->sendJson(400, 'error', 'La persona no es candidata válida.');
        return;
      }
      $edadValid = (new Persona([]))->validarEdadPorGrado($persona['fecha_nacimiento'], $grado); // instancia temporal para lógica
      if ($edadValid !== true) {
        $this->sendJson(400, 'error', 'Validación de edad/grade falló.', null, $edadValid);
        return;
      }
      $id_est = self::registrarEstudiante($pdo, $id_persona, $data);
      $est = self::consultarEstudiantePorId($pdo, $id_est);
      $this->sendJson(201, 'success', 'Estudiante registrado exitosamente.', $est);
    } catch (Exception $e) {
      $this->sendJson(500, 'error', 'Error al registrar estudiante: ' . $e->getMessage());
    }
  }

  public function listarCandidatos(): void
  {
    try {
      $pdo = Conexion::obtener();
      $rows = self::consultarCandidatos($pdo);
      $this->sendJson(200, 'success', 'Candidatos obtenidos.', $rows);
    } catch (Exception $e) {
      $this->sendJson(500, 'error', 'Error al listar candidatos: ' . $e->getMessage());
    }
  }

  public function listarEstudiantes(): void
  {
    try {
      $pdo = Conexion::obtener();
      $rows = self::consultarTodosEstudiantes($pdo);
      $this->sendJson(200, 'success', 'Estudiantes obtenidos.', $rows);
    } catch (Exception $e) {
      $this->sendJson(500, 'error', 'Error al listar estudiantes: ' . $e->getMessage());
    }
  }

  public function obtenerEstudiante(int $id): void
  {
    try {
      $pdo = Conexion::obtener();
      $row = self::consultarEstudiantePorId($pdo, $id);
      if ($row) {
        $this->sendJson(200, 'success', 'Estudiante encontrado.', $row);
      } else {
        $this->sendJson(404, 'error', 'Estudiante no encontrado.');
      }
    } catch (Exception $e) {
      $this->sendJson(500, 'error', 'Error al obtener estudiante: ' . $e->getMessage());
    }
  }

  public function actualizarEstudianteEndpoint(int $id_estudiante): void
  {
    try {
      $data = $this->parseJsonInput();
      if (empty($data['grado'])) {
        $this->sendJson(400, 'error', 'Grado requerido.');
        return;
      }
      $pdo = Conexion::obtener();
      $actual = self::consultarEstudiantePorId($pdo, $id_estudiante);
      if (!$actual) {
        $this->sendJson(404, 'error', 'Estudiante no encontrado.');
        return;
      }
      $persona = \Micodigo\Persona\Persona::consultar($pdo, $actual['fk_persona']);
      $edadValid = (new Persona([]))->validarEdadPorGrado($persona['fecha_nacimiento'], (int)$data['grado']);
      if ($edadValid !== true) {
        $this->sendJson(400, 'error', 'Validación de edad/grade falló.', null, $edadValid);
        return;
      }
      $ok = self::actualizarEstudiante($pdo, $id_estudiante, $data);
      $row = self::consultarEstudiantePorId($pdo, $id_estudiante);
      $this->sendJson($ok ? 200 : 500, $ok ? 'success' : 'error', $ok ? 'Estudiante actualizado.' : 'No se pudo actualizar.', $row);
    } catch (Exception $e) {
      $this->sendJson(500, 'error', 'Error al actualizar estudiante: ' . $e->getMessage());
    }
  }

  public function cambiarEstadoEstudianteEndpoint(int $id_estudiante): void
  {
    try {
      $data = $this->parseJsonInput();
      if (!isset($data['estado'])) {
        $this->sendJson(400, 'error', 'Estado requerido.');
        return;
      }
      $pdo = Conexion::obtener();
      $ok = self::cambiarEstadoEstudiante($pdo, $id_estudiante, $data['estado']);
      $row = self::consultarEstudiantePorId($pdo, $id_estudiante);
      $this->sendJson($ok ? 200 : 400, $ok ? 'success' : 'error', $ok ? 'Estado cambiado.' : 'Estado inválido o fallo.', $row);
    } catch (Exception $e) {
      $this->sendJson(500, 'error', 'Error al cambiar estado: ' . $e->getMessage());
    }
  }
}
