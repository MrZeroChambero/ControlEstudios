<?php

namespace Micodigo\GradosSecciones;

use Micodigo\Config\Conexion;
use Exception;

trait OperacionesControladorGradosSecciones
{
  public function listarGradosSecciones()
  {
    try {
      $pdo = Conexion::obtener();
      $filtros = $this->obtenerFiltrosListadoGradosSecciones();
      $datos = empty($filtros)
        ? self::consultarTodosLosGradosSecciones($pdo)
        : self::consultarGradosSeccionesPorFiltro($pdo, $filtros);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $datos, 'message' => 'Grados y secciones obtenidos exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al listar grados y secciones.', 'error_details' => $e->getMessage()]);
    }
  }

  public function crearGradoSeccion()
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);
      if (json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());

      $data['grado'] = $this->limpiarTexto($data['grado'] ?? null);
      $data['seccion'] = $this->limpiarTexto($data['seccion'] ?? null);
      $v = $this->crearValidadorGradoSeccion($data);
      if (!$v->validate()) {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'errors' => $v->errors()]);
        return;
      }

      $pdo = Conexion::obtener();
      $id = self::crearGradoSeccionBD($pdo, $data);
      $nuevo = self::consultarGradoSeccionPorId($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $nuevo, 'message' => 'Grado-sección creada exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al crear grado-sección.', 'error_details' => $e->getMessage()]);
    }
  }

  public function obtenerGradoSeccion($id)
  {
    try {
      $pdo = Conexion::obtener();
      $dato = self::consultarGradoSeccionPorId($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $dato, 'message' => 'Grado-sección obtenida.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al obtener grado-sección.', 'error_details' => $e->getMessage()]);
    }
  }

  public function actualizarGradoSeccion($id)
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);
      if (json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());

      $data['grado'] = $this->limpiarTexto($data['grado'] ?? null);
      $data['seccion'] = $this->limpiarTexto($data['seccion'] ?? null);
      $v = $this->crearValidadorGradoSeccion($data);
      if (!$v->validate()) {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'errors' => $v->errors()]);
        return;
      }

      $pdo = Conexion::obtener();
      $ok = self::actualizarGradoSeccionBD($pdo, $id, $data);
      $actualizado = self::consultarGradoSeccionPorId($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $actualizado, 'message' => 'Grado-sección actualizada.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al actualizar grado-sección.', 'error_details' => $e->getMessage()]);
    }
  }

  public function eliminarGradoSeccion($id)
  {
    try {
      $pdo = Conexion::obtener();
      $ok = self::eliminarGradoSeccionBD($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => (bool)$ok, 'message' => 'Grado-sección eliminada.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al eliminar grado-sección.', 'error_details' => $e->getMessage()]);
    }
  }
}
