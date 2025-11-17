<?php

namespace Micodigo\Evaluaciones;

use Micodigo\Config\Conexion;
use Valitron\Validator;
use Exception;

class ControladoraEvaluaciones
{
  public function __construct()
  {
    Validator::lang('es');
  }

  private function limpiarTexto($texto)
  {
    $texto = trim($texto);
    $texto = preg_replace('/\s+/', ' ', $texto);
    return $texto;
  }

  private function addUniqueRule(Validator $v, string $field, string $table, string $column, ?int $ignoreId = null)
  {
    $v->addRule('unique', function ($field, $value, array $params) use ($table, $column, $ignoreId) {
      $pdo = Conexion::obtener();
      $sql = "SELECT COUNT(*) FROM {$table} WHERE {$column} = ?";
      $bindings = [$value];

      if ($ignoreId !== null) {
        $sql .= " AND id_evaluacion != ?";
        $bindings[] = $ignoreId;
      }

      $stmt = $pdo->prepare($sql);
      $stmt->execute($bindings);
      return $stmt->fetchColumn() == 0;
    }, 'ya está en uso.');
  }

  private function validarTextoEspanol($campo, $valor, $obligatorio = false)
  {
    if ($valor === null || $valor === '') {
      if ($obligatorio) {
        return "El campo {$campo} es requerido";
      }
      return null;
    }

    // Solo letras (incluyendo acentos y ñ), números y espacios
    if (!preg_match('/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]+$/', $valor)) {
      return "El campo {$campo} solo puede contener letras, números y espacios";
    }

    if (strlen(trim($valor)) === 0) {
      return "El campo {$campo} no puede contener solo espacios";
    }

    // Validar longitud mínima (al menos 2 caracteres para campos obligatorios)
    if ($obligatorio && strlen(trim($valor)) < 2) {
      return "El campo {$campo} debe tener al menos 2 caracteres";
    }

    return null;
  }

  private function enviarRespuesta($success, $message, $data = null, $statusCode = 200)
  {
    http_response_code($statusCode);
    header('Content-Type: application/json');

    $respuesta = [
      'back' => $success,
      'message' => $message
    ];

    if ($data !== null) {
      $respuesta['data'] = $data;
    }

    echo json_encode($respuesta);
    exit;
  }

  public function listar()
  {
    try {
      $pdo = Conexion::obtener();
      $evaluaciones = Evaluaciones::consultarTodos($pdo);
      $this->enviarRespuesta(true, 'Evaluaciones obtenidas exitosamente', $evaluaciones);
    } catch (Exception $e) {
      $this->enviarRespuesta(false, 'Error al obtener las evaluaciones: ' . $e->getMessage(), null, 500);
    }
  }

  public function crear()
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);

      if (json_last_error() !== JSON_ERROR_NONE) {
        $this->enviarRespuesta(false, 'Error en el formato JSON: ' . json_last_error_msg(), null, 400);
      }

      // Limpiar textos
      if (isset($data['nombre_evaluacion'])) {
        $data['nombre_evaluacion'] = $this->limpiarTexto($data['nombre_evaluacion']);
      }
      if (isset($data['descripcion'])) {
        $data['descripcion'] = $this->limpiarTexto($data['descripcion']);
      }

      $errores = [];

      // Validar campos requeridos
      if (empty($data['nombre_evaluacion'])) {
        $errores['nombre_evaluacion'] = 'El nombre de la evaluación es requerido';
      }

      // Validar formato de campos de texto
      $errorNombre = $this->validarTextoEspanol('nombre_evaluacion', $data['nombre_evaluacion'], true);
      if ($errorNombre) $errores['nombre_evaluacion'] = $errorNombre;

      // Validar descripción solo si se proporciona
      if (!empty($data['descripcion'])) {
        $errorDescripcion = $this->validarTextoEspanol('descripcion', $data['descripcion'], false);
        if ($errorDescripcion) $errores['descripcion'] = $errorDescripcion;
      }

      // Validar longitud máxima
      if (strlen($data['nombre_evaluacion']) > 150) {
        $errores['nombre_evaluacion'] = 'El nombre de la evaluación no debe exceder los 150 caracteres';
      }

      if (isset($data['descripcion']) && strlen($data['descripcion']) > 255) {
        $errores['descripcion'] = 'La descripción no debe exceder los 255 caracteres';
      }

      if (!empty($errores)) {
        $this->enviarRespuesta(false, 'Datos inválidos en la solicitud', ['errors' => $errores], 400);
      }

      $pdo = Conexion::obtener();
      $evaluacion = new Evaluaciones(
        $data['nombre_evaluacion'],
        $data['descripcion'] ?? null
      );

      $id = $evaluacion->crear($pdo);

      if ($id) {
        $evaluacion->id_evaluacion = $id;
        $this->enviarRespuesta(true, 'Evaluación creada exitosamente', $evaluacion, 201);
      } else {
        $this->enviarRespuesta(false, 'No se pudo crear la evaluación en la base de datos', null, 500);
      }
    } catch (Exception $e) {
      $this->enviarRespuesta(false, 'Error en el servidor al crear la evaluación: ' . $e->getMessage(), null, 500);
    }
  }

  public function actualizar($id)
  {
    try {
      if (!is_numeric($id) || $id <= 0) {
        $this->enviarRespuesta(false, 'ID de evaluación inválido', null, 400);
      }

      $input = file_get_contents('php://input');
      $data = json_decode($input, true);

      if (json_last_error() !== JSON_ERROR_NONE) {
        $this->enviarRespuesta(false, 'Error en el formato JSON: ' . json_last_error_msg(), null, 400);
      }

      $pdo = Conexion::obtener();

      // Verificar que la evaluación existe
      $evaluacionExistente = Evaluaciones::consultarActualizar($pdo, $id);
      if (!$evaluacionExistente) {
        $this->enviarRespuesta(false, 'La evaluación que intenta actualizar no existe', null, 404);
      }

      // Limpiar textos
      if (isset($data['nombre_evaluacion'])) {
        $data['nombre_evaluacion'] = $this->limpiarTexto($data['nombre_evaluacion']);
      }
      if (isset($data['descripcion'])) {
        $data['descripcion'] = $this->limpiarTexto($data['descripcion']);
      }

      $errores = [];

      // Validar campos requeridos
      if (empty($data['nombre_evaluacion'])) {
        $errores['nombre_evaluacion'] = 'El nombre de la evaluación es requerido';
      }

      // Validar formato de campos de texto
      $errorNombre = $this->validarTextoEspanol('nombre_evaluacion', $data['nombre_evaluacion'], true);
      if ($errorNombre) $errores['nombre_evaluacion'] = $errorNombre;

      // Validar descripción solo si se proporciona
      if (!empty($data['descripcion'])) {
        $errorDescripcion = $this->validarTextoEspanol('descripcion', $data['descripcion'], false);
        if ($errorDescripcion) $errores['descripcion'] = $errorDescripcion;
      }

      // Validar longitud máxima
      if (strlen($data['nombre_evaluacion']) > 150) {
        $errores['nombre_evaluacion'] = 'El nombre de la evaluación no debe exceder los 150 caracteres';
      }

      if (isset($data['descripcion']) && strlen($data['descripcion']) > 255) {
        $errores['descripcion'] = 'La descripción no debe exceder los 255 caracteres';
      }

      if (!empty($errores)) {
        $this->enviarRespuesta(false, 'Datos inválidos en la solicitud', ['errors' => $errores], 400);
      }

      $evaluacionExistente->nombre_evaluacion = $data['nombre_evaluacion'];
      $evaluacionExistente->descripcion = $data['descripcion'] ?? null;

      if ($evaluacionExistente->actualizar($pdo)) {
        $evaluacionActualizada = Evaluaciones::consultarActualizar($pdo, $id);
        $this->enviarRespuesta(true, 'Evaluación actualizada exitosamente', $evaluacionActualizada);
      } else {
        $this->enviarRespuesta(false, 'No se pudo actualizar la evaluación en la base de datos', null, 500);
      }
    } catch (Exception $e) {
      $this->enviarRespuesta(false, 'Error en el servidor al actualizar la evaluación: ' . $e->getMessage(), null, 500);
    }
  }

  public function eliminar($id)
  {
    try {
      if (!is_numeric($id) || $id <= 0) {
        $this->enviarRespuesta(false, 'ID de evaluación inválido', null, 400);
      }

      $pdo = Conexion::obtener();

      if (Evaluaciones::eliminar($pdo, $id)) {
        $this->enviarRespuesta(true, 'Evaluación eliminada exitosamente');
      } else {
        $this->enviarRespuesta(false, 'No se pudo eliminar la evaluación', null, 500);
      }
    } catch (Exception $e) {
      $this->enviarRespuesta(false, 'Error al eliminar la evaluación: ' . $e->getMessage(), null, 500);
    }
  }

  public function cambiarEstado($id)
  {
    try {
      if (!is_numeric($id) || $id <= 0) {
        $this->enviarRespuesta(false, 'ID de evaluación inválido', null, 400);
      }

      $pdo = Conexion::obtener();

      if (Evaluaciones::cambiarEstado($pdo, $id)) {
        $evaluacionActualizada = Evaluaciones::consultarActualizar($pdo, $id);
        $this->enviarRespuesta(true, 'Estado de la evaluación cambiado exitosamente', $evaluacionActualizada);
      } else {
        $this->enviarRespuesta(false, 'No se pudo cambiar el estado de la evaluación', null, 500);
      }
    } catch (Exception $e) {
      $this->enviarRespuesta(false, 'Error al cambiar el estado de la evaluación: ' . $e->getMessage(), null, 500);
    }
  }

  public function listarSelect()
  {
    try {
      $pdo = Conexion::obtener();
      $evaluaciones = Evaluaciones::consultarParaSelect($pdo);
      $this->enviarRespuesta(true, 'Evaluaciones para select obtenidas exitosamente', $evaluaciones);
    } catch (Exception $e) {
      $this->enviarRespuesta(false, 'Error al obtener las evaluaciones para select: ' . $e->getMessage(), null, 500);
    }
  }
}
