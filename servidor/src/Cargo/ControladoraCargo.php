<?php

namespace Micodigo\Cargo;

use Micodigo\Config\Conexion;
use Valitron\Validator;
use Exception;

class ControladoraCargo
{
  public function __construct()
  {
    Validator::lang('es');
  }

  private function limpiarTexto($texto)
  {
    if ($texto === null) return null;
    $texto = trim($texto);
    $texto = preg_replace('/\s+/', ' ', $texto);
    return $texto === '' ? null : $texto;
  }

  // Listar todos los cargos
  public function listarCargos()
  {
    try {
      $pdo = Conexion::obtener();
      $cargos = Cargo::consultarTodos($pdo);

      header('Content-Type: application/json');
      echo json_encode([
        'back' => true,
        'data' => $cargos,
        'message' => 'Cargos obtenidos exitosamente.'
      ]);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error al obtener los cargos.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  // Obtener cargo por ID
  public function obtenerCargo($id_cargo)
  {
    try {
      $pdo = Conexion::obtener();
      $cargo = Cargo::obtenerPorId($pdo, $id_cargo);

      if ($cargo) {
        header('Content-Type: application/json');
        echo json_encode([
          'back' => true,
          'data' => $cargo,
          'message' => 'Cargo obtenido exitosamente.'
        ]);
      } else {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Cargo no encontrado.'
        ]);
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error al obtener el cargo.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  // Crear nuevo cargo
  public function crearCargo()
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);

      if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error en el formato JSON: ' . json_last_error_msg());
      }

      // Limpiar textos
      $data['nombre_cargo'] = $this->limpiarTexto($data['nombre_cargo'] ?? '');
      $data['codigo'] = $this->limpiarTexto($data['codigo'] ?? '');

      $errores = [];

      // Validar campos requeridos
      if (empty($data['nombre_cargo'])) {
        $errores['nombre_cargo'] = 'El nombre del cargo es requerido';
      }

      if (empty($data['tipo'])) {
        $errores['tipo'] = 'El tipo de cargo es requerido';
      }

      // Validar tipo de cargo
      if (!empty($data['tipo']) && !in_array($data['tipo'], ['Docente', 'Administrativo', 'Obrero'])) {
        $errores['tipo'] = 'El tipo de cargo debe ser Docente, Administrativo u Obrero';
      }

      // Validar longitud de campos
      if (!empty($data['nombre_cargo']) && strlen($data['nombre_cargo']) > 100) {
        $errores['nombre_cargo'] = 'El nombre del cargo no puede exceder 100 caracteres';
      }

      if (!empty($data['codigo']) && strlen($data['codigo']) > 15) {
        $errores['codigo'] = 'El código no puede exceder 15 caracteres';
      }

      if (!empty($errores)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'errors' => $errores,
          'message' => 'Datos inválidos en la solicitud.'
        ]);
        return;
      }

      $pdo = Conexion::obtener();

      // Verificar si el nombre del cargo ya existe
      if (Cargo::verificarNombreExistente($pdo, $data['nombre_cargo'])) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'errors' => ['nombre_cargo' => 'El nombre del cargo ya existe'],
          'message' => 'El nombre del cargo ya está registrado.'
        ]);
        return;
      }

      // Verificar si el código ya existe (si se proporciona)
      if (!empty($data['codigo']) && Cargo::verificarCodigoExistente($pdo, $data['codigo'])) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'errors' => ['codigo' => 'El código ya existe'],
          'message' => 'El código ya está registrado.'
        ]);
        return;
      }

      // Crear cargo
      $cargoData = [
        'nombre_cargo' => $data['nombre_cargo'],
        'tipo' => $data['tipo'],
        'codigo' => $data['codigo'] ?? null
      ];

      $id_cargo = Cargo::crear($pdo, $cargoData);

      if ($id_cargo) {
        // Obtener datos del cargo creado
        $cargoCreado = Cargo::obtenerPorId($pdo, $id_cargo);

        header('Content-Type: application/json');
        echo json_encode([
          'back' => true,
          'data' => $cargoCreado,
          'message' => 'Cargo creado exitosamente.'
        ]);
      } else {
        throw new Exception('No se pudo crear el cargo en la base de datos');
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error en el servidor al crear el cargo.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  // Actualizar cargo
  public function actualizarCargo($id_cargo)
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);

      if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error en el formato JSON: ' . json_last_error_msg());
      }

      // Limpiar textos
      $data['nombre_cargo'] = $this->limpiarTexto($data['nombre_cargo'] ?? '');
      $data['codigo'] = $this->limpiarTexto($data['codigo'] ?? '');

      $errores = [];

      // Validar campos requeridos
      if (empty($data['nombre_cargo'])) {
        $errores['nombre_cargo'] = 'El nombre del cargo es requerido';
      }

      if (empty($data['tipo'])) {
        $errores['tipo'] = 'El tipo de cargo es requerido';
      }

      // Validar tipo de cargo
      if (!empty($data['tipo']) && !in_array($data['tipo'], ['Docente', 'Administrativo', 'Obrero'])) {
        $errores['tipo'] = 'El tipo de cargo debe ser Docente, Administrativo u Obrero';
      }

      // Validar longitud de campos
      if (!empty($data['nombre_cargo']) && strlen($data['nombre_cargo']) > 100) {
        $errores['nombre_cargo'] = 'El nombre del cargo no puede exceder 100 caracteres';
      }

      if (!empty($data['codigo']) && strlen($data['codigo']) > 15) {
        $errores['codigo'] = 'El código no puede exceder 15 caracteres';
      }

      if (!empty($errores)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'errors' => $errores,
          'message' => 'Datos inválidos en la solicitud.'
        ]);
        return;
      }

      $pdo = Conexion::obtener();

      // Verificar que el cargo existe
      $cargoExistente = Cargo::obtenerPorId($pdo, $id_cargo);
      if (!$cargoExistente) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Cargo no encontrado.'
        ]);
        return;
      }

      // Verificar si el nombre del cargo ya existe (excluyendo el actual)
      if (Cargo::verificarNombreExistente($pdo, $data['nombre_cargo'], $id_cargo)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'errors' => ['nombre_cargo' => 'El nombre del cargo ya existe'],
          'message' => 'El nombre del cargo ya está registrado.'
        ]);
        return;
      }

      // Verificar si el código ya existe (si se proporciona, excluyendo el actual)
      if (!empty($data['codigo']) && Cargo::verificarCodigoExistente($pdo, $data['codigo'], $id_cargo)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'errors' => ['codigo' => 'El código ya existe'],
          'message' => 'El código ya está registrado.'
        ]);
        return;
      }

      // Actualizar cargo
      $cargoData = [
        'nombre_cargo' => $data['nombre_cargo'],
        'tipo' => $data['tipo'],
        'codigo' => $data['codigo'] ?? null
      ];

      $actualizado = Cargo::actualizar($pdo, $id_cargo, $cargoData);

      if ($actualizado) {
        // Obtener datos actualizados
        $cargoActualizado = Cargo::obtenerPorId($pdo, $id_cargo);

        header('Content-Type: application/json');
        echo json_encode([
          'back' => true,
          'data' => $cargoActualizado,
          'message' => 'Cargo actualizado exitosamente.'
        ]);
      } else {
        throw new Exception('No se pudo actualizar el cargo en la base de datos');
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error en el servidor al actualizar el cargo.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  // Eliminar cargo
  public function eliminarCargo($id_cargo)
  {
    try {
      $pdo = Conexion::obtener();

      // Verificar que el cargo existe
      $cargoExistente = Cargo::obtenerPorId($pdo, $id_cargo);
      if (!$cargoExistente) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Cargo no encontrado.'
        ]);
        return;
      }

      // Verificar si el cargo está siendo usado por algún personal
      if (Cargo::verificarUsoEnPersonal($pdo, $id_cargo)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'No se puede eliminar el cargo porque está asignado a personal activo.'
        ]);
        return;
      }

      $eliminado = Cargo::eliminar($pdo, $id_cargo);

      if ($eliminado) {
        header('Content-Type: application/json');
        echo json_encode([
          'back' => true,
          'message' => 'Cargo eliminado exitosamente.'
        ]);
      } else {
        throw new Exception('No se pudo eliminar el cargo de la base de datos');
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error en el servidor al eliminar el cargo.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  // Listar cargos para select (solo campos básicos)
  public function listarCargosSelect()
  {
    try {
      $pdo = Conexion::obtener();
      $cargos = Cargo::consultarParaSelect($pdo);

      header('Content-Type: application/json');
      echo json_encode([
        'back' => true,
        'data' => $cargos,
        'message' => 'Cargos obtenidos exitosamente para select.'
      ]);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error al obtener los cargos para select.',
        'error_details' => $e->getMessage()
      ]);
    }
  }
}
