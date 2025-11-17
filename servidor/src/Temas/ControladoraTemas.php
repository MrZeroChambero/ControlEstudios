<?php

namespace Micodigo\Temas;

use Micodigo\Config\Conexion;
use Valitron\Validator;
use Exception;

class ControladoraTemas
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

  private function validarCodigo($campo, $valor)
  {
    if ($valor === null || $valor === '') {
      return null; // Código es opcional
    }

    // Solo letras, números, guiones y guiones bajos
    if (!preg_match('/^[a-zA-Z0-9_-]+$/', $valor)) {
      return "El campo {$campo} solo puede contener letras, números, guiones y guiones bajos";
    }

    if (strlen(trim($valor)) < 2) {
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

  public function listarPorContenido($id_contenido)
  {
    try {
      if (!is_numeric($id_contenido) || $id_contenido <= 0) {
        $this->enviarRespuesta(false, 'ID de contenido inválido', null, 400);
      }

      $pdo = Conexion::obtener();
      $temas = Temas::consultarPorContenido($pdo, $id_contenido);

      $this->enviarRespuesta(true, 'Temas del contenido obtenidos exitosamente', $temas);
    } catch (Exception $e) {
      $this->enviarRespuesta(false, 'Error al obtener los temas del contenido: ' . $e->getMessage(), null, 500);
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

      // Limpiar y validar datos
      $errores = [];

      // Validar campos requeridos
      if (empty($data['nombre_tema'])) {
        $errores['nombre_tema'] = 'El nombre del tema es requerido';
      }

      if (empty($data['fk_contenido'])) {
        $errores['fk_contenido'] = 'El contenido es requerido';
      }

      // Limpiar campos
      $data['nombre_tema'] = $this->limpiarTexto($data['nombre_tema'] ?? '');
      $data['descripcion'] = $this->limpiarTexto($data['descripcion'] ?? '');
      $data['codigo'] = $this->limpiarTexto($data['codigo'] ?? '');

      // Validar formato de campos de texto
      $errorNombre = $this->validarTextoEspanol('nombre_tema', $data['nombre_tema'], true);
      if ($errorNombre) $errores['nombre_tema'] = $errorNombre;

      // Validar código solo si se proporciona
      if (!empty($data['codigo'])) {
        $errorCodigo = $this->validarCodigo('codigo', $data['codigo']);
        if ($errorCodigo) $errores['codigo'] = $errorCodigo;
      }

      // Validar descripción solo si se proporciona
      if (!empty($data['descripcion'])) {
        $errorDescripcion = $this->validarTextoEspanol('descripcion', $data['descripcion'], false);
        if ($errorDescripcion) $errores['descripcion'] = $errorDescripcion;
      }

      // Validar contenido
      if (!is_numeric($data['fk_contenido']) || $data['fk_contenido'] <= 0) {
        $errores['fk_contenido'] = 'El contenido debe ser un número válido';
      }

      if (!empty($errores)) {
        $this->enviarRespuesta(false, 'Datos inválidos en la solicitud', ['errors' => $errores], 400);
      }

      $pdo = Conexion::obtener();
      $tema = new Temas(
        $data['fk_contenido'],
        $data['codigo'],
        $data['nombre_tema'],
        $data['descripcion']
      );

      $id = $tema->crear($pdo);

      if ($id) {
        // Obtener el tema creado para la respuesta
        $temaCreado = Temas::consultarActualizar($pdo, $id);
        $this->enviarRespuesta(true, 'Tema creado exitosamente', $temaCreado, 201);
      } else {
        $this->enviarRespuesta(false, 'No se pudo crear el tema en la base de datos', null, 500);
      }
    } catch (Exception $e) {
      $this->enviarRespuesta(false, 'Error en el servidor al crear el tema: ' . $e->getMessage(), null, 500);
    }
  }

  public function actualizar($id)
  {
    try {
      if (!is_numeric($id) || $id <= 0) {
        $this->enviarRespuesta(false, 'ID de tema inválido', null, 400);
      }

      $input = file_get_contents('php://input');
      $data = json_decode($input, true);

      if (json_last_error() !== JSON_ERROR_NONE) {
        $this->enviarRespuesta(false, 'Error en el formato JSON: ' . json_last_error_msg(), null, 400);
      }

      $pdo = Conexion::obtener();

      // Verificar que el tema existe
      $temaExistente = Temas::consultarActualizar($pdo, $id);
      if (!$temaExistente) {
        $this->enviarRespuesta(false, 'El tema que intenta actualizar no existe', null, 404);
      }

      // Limpiar y validar datos
      $errores = [];

      // Validar campos requeridos
      if (empty($data['nombre_tema'])) {
        $errores['nombre_tema'] = 'El nombre del tema es requerido';
      }

      if (empty($data['fk_contenido'])) {
        $errores['fk_contenido'] = 'El contenido es requerido';
      }

      // Limpiar campos
      $data['nombre_tema'] = $this->limpiarTexto($data['nombre_tema'] ?? '');
      $data['descripcion'] = $this->limpiarTexto($data['descripcion'] ?? '');
      $data['codigo'] = $this->limpiarTexto($data['codigo'] ?? '');

      // Validar formato de campos de texto
      $errorNombre = $this->validarTextoEspanol('nombre_tema', $data['nombre_tema'], true);
      if ($errorNombre) $errores['nombre_tema'] = $errorNombre;

      // Validar código solo si se proporciona
      if (!empty($data['codigo'])) {
        $errorCodigo = $this->validarCodigo('codigo', $data['codigo']);
        if ($errorCodigo) $errores['codigo'] = $errorCodigo;
      }

      // Validar descripción solo si se proporciona
      if (!empty($data['descripcion'])) {
        $errorDescripcion = $this->validarTextoEspanol('descripcion', $data['descripcion'], false);
        if ($errorDescripcion) $errores['descripcion'] = $errorDescripcion;
      }

      // Validar contenido
      if (!is_numeric($data['fk_contenido']) || $data['fk_contenido'] <= 0) {
        $errores['fk_contenido'] = 'El contenido debe ser un número válido';
      }

      if (!empty($errores)) {
        $this->enviarRespuesta(false, 'Datos inválidos en la solicitud', ['errors' => $errores], 400);
      }

      $temaExistente->codigo = $data['codigo'];
      $temaExistente->nombre_tema = $data['nombre_tema'];
      $temaExistente->descripcion = $data['descripcion'];
      $temaExistente->fk_contenido = $data['fk_contenido'];

      if ($temaExistente->actualizar($pdo)) {
        $temaActualizado = Temas::consultarActualizar($pdo, $id);
        $this->enviarRespuesta(true, 'Tema actualizado exitosamente', $temaActualizado);
      } else {
        $this->enviarRespuesta(false, 'No se pudo actualizar el tema en la base de datos', null, 500);
      }
    } catch (Exception $e) {
      $this->enviarRespuesta(false, 'Error en el servidor al actualizar el tema: ' . $e->getMessage(), null, 500);
    }
  }

  public function eliminar($id)
  {
    try {
      if (!is_numeric($id) || $id <= 0) {
        $this->enviarRespuesta(false, 'ID de tema inválido', null, 400);
      }

      $pdo = Conexion::obtener();

      if (Temas::eliminar($pdo, $id)) {
        $this->enviarRespuesta(true, 'Tema eliminado exitosamente');
      } else {
        $this->enviarRespuesta(false, 'No se pudo eliminar el tema', null, 500);
      }
    } catch (Exception $e) {
      $this->enviarRespuesta(false, 'Error al eliminar el tema: ' . $e->getMessage(), null, 500);
    }
  }

  public function cambiarEstado($id)
  {
    try {
      if (!is_numeric($id) || $id <= 0) {
        $this->enviarRespuesta(false, 'ID de tema inválido', null, 400);
      }

      $pdo = Conexion::obtener();

      if (Temas::cambiarEstado($pdo, $id)) {
        $temaActualizado = Temas::consultarActualizar($pdo, $id);
        $this->enviarRespuesta(true, 'Estado del tema cambiado exitosamente', $temaActualizado);
      } else {
        $this->enviarRespuesta(false, 'No se pudo cambiar el estado del tema', null, 500);
      }
    } catch (Exception $e) {
      $this->enviarRespuesta(false, 'Error al cambiar el estado del tema: ' . $e->getMessage(), null, 500);
    }
  }

  public function listarSelect($id_contenido = null)
  {
    try {
      $pdo = Conexion::obtener();
      $temas = Temas::consultarParaSelect($pdo, $id_contenido);
      $this->enviarRespuesta(true, 'Temas para select obtenidos exitosamente', $temas);
    } catch (Exception $e) {
      $this->enviarRespuesta(false, 'Error al obtener los temas para select: ' . $e->getMessage(), null, 500);
    }
  }
}
