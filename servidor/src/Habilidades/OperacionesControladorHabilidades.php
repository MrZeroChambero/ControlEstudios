<?php

namespace Micodigo\Habilidades;

use Micodigo\Config\Conexion;
use Exception;

trait OperacionesControladorHabilidades
{
  public function crearHabilidad()
  {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $errs = $this->validarInputCrear($input);
    if (!empty($errs)) {
      http_response_code(422);
      header('Content-Type: application/json; charset=utf-8');
      echo json_encode(['back' => false, 'message' => 'Validación fallida', 'errors' => $errs], JSON_UNESCAPED_UNICODE);
      return;
    }

    $pdo = Conexion::obtener();
    $repErr = $this->validarRepresentanteActivo($pdo, (int)$input['fk_representante']);
    if (!empty($repErr)) {
      http_response_code(422);
      header('Content-Type: application/json; charset=utf-8');
      echo json_encode(['back' => false, 'message' => 'Error en representante', 'errors' => $repErr], JSON_UNESCAPED_UNICODE);
      return;
    }

    // Verificar duplicado
    if (self::existeHabilidadNombre($pdo, (int)$input['fk_representante'], $input['nombre_habilidad'])) {
      http_response_code(422);
      header('Content-Type: application/json; charset=utf-8');
      echo json_encode(['back' => false, 'message' => 'La habilidad ya existe para este representante'], JSON_UNESCAPED_UNICODE);
      return;
    }

    try {
      $id = self::crearHabilidadBD($pdo, (int)$input['fk_representante'], $input['nombre_habilidad']);
      header('Content-Type: application/json; charset=utf-8');
      echo json_encode(['back' => true, 'data' => ['id_habilidad' => (int)$id], 'message' => 'Habilidad creada.'], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json; charset=utf-8');
      echo json_encode(['back' => false, 'message' => 'Error creando habilidad', 'error_details' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
  }

  public function eliminarHabilidad($id)
  {
    try {
      $pdo = Conexion::obtener();
      $h = self::obtenerPorIdBD($pdo, (int)$id);
      if (!$h) {
        http_response_code(404);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['back' => false, 'message' => 'Habilidad no encontrada'], JSON_UNESCAPED_UNICODE);
        return;
      }
      $ok = self::eliminarHabilidadBD($pdo, (int)$id);
      header('Content-Type: application/json; charset=utf-8');
      echo json_encode(['back' => true, 'data' => ['deleted' => (bool)$ok], 'message' => 'Habilidad eliminada.'], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json; charset=utf-8');
      echo json_encode(['back' => false, 'message' => 'Error eliminando habilidad', 'error_details' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
  }

  public function listarPorRepresentante($fk_representante)
  {
    try {
      $pdo = Conexion::obtener();
      // Validar existencia y persona activa
      $repErr = $this->validarRepresentanteActivo($pdo, (int)$fk_representante);
      if (!empty($repErr)) {
        http_response_code(422);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['back' => false, 'message' => 'Error representante', 'errors' => $repErr], JSON_UNESCAPED_UNICODE);
        return;
      }
      $lista = self::listarPorRepresentanteBD($pdo, (int)$fk_representante);
      header('Content-Type: application/json; charset=utf-8');
      echo json_encode(['back' => true, 'data' => $lista, 'message' => 'Habilidades obtenidas.'], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json; charset=utf-8');
      echo json_encode(['back' => false, 'message' => 'Error listando habilidades', 'error_details' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
  }

  public function obtenerHabilidad($id)
  {
    try {
      $pdo = Conexion::obtener();
      $h = self::obtenerPorIdBD($pdo, (int)$id);
      if (!$h) {
        http_response_code(404);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['back' => false, 'message' => 'Habilidad no encontrada'], JSON_UNESCAPED_UNICODE);
        return;
      }
      header('Content-Type: application/json; charset=utf-8');
      echo json_encode(['back' => true, 'data' => $h, 'message' => 'Habilidad obtenida.'], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json; charset=utf-8');
      echo json_encode(['back' => false, 'message' => 'Error obteniendo habilidad', 'error_details' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
  }

  public function actualizarHabilidad($id)
  {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($input['nombre_habilidad'])) {
      http_response_code(422);
      header('Content-Type: application/json; charset=utf-8');
      echo json_encode(['back' => false, 'message' => 'Nombre requerido'], JSON_UNESCAPED_UNICODE);
      return;
    }
    try {
      $pdo = Conexion::obtener();
      $h = self::obtenerPorIdBD($pdo, (int)$id);
      if (!$h) {
        http_response_code(404);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['back' => false, 'message' => 'Habilidad no encontrada'], JSON_UNESCAPED_UNICODE);
        return;
      }
      // Evitar duplicados con otro nombre mismo representante
      if ($h && self::existeHabilidadNombre($pdo, (int)$h['fk_representante'], $input['nombre_habilidad'])) {
        if (mb_strtolower($h['nombre_habilidad']) !== mb_strtolower($input['nombre_habilidad'])) {
          http_response_code(422);
          header('Content-Type: application/json; charset=utf-8');
          echo json_encode(['back' => false, 'message' => 'La habilidad ya existe para este representante'], JSON_UNESCAPED_UNICODE);
          return;
        }
      }
      $ok = self::actualizarHabilidadBD($pdo, (int)$id, $input['nombre_habilidad']);
      header('Content-Type: application/json; charset=utf-8');
      echo json_encode(['back' => true, 'data' => ['updated' => (bool)$ok], 'message' => 'Habilidad actualizada.'], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json; charset=utf-8');
      echo json_encode(['back' => false, 'message' => 'Error actualizando habilidad', 'error_details' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
  }
}
