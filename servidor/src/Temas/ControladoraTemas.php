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
    $texto = trim($texto);
    $texto = preg_replace('/\s+/', ' ', $texto);
    return $texto;
  }

  private function validarExistenciaForanea($tabla, $campoId, $valor, $campoNombre)
  {
    try {
      $pdo = Conexion::obtener();
      $sql = "SELECT {$campoNombre} FROM {$tabla} WHERE {$campoId} = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$valor]);
      $resultado = $stmt->fetch(\PDO::FETCH_ASSOC);
      return $resultado ? $resultado[$campoNombre] : false;
    } catch (Exception $e) {
      return false;
    }
  }

  public function listarPorContenido($id_contenido)
  {
    try {
      $pdo = Conexion::obtener();
      $temas = Temas::consultarPorContenido($pdo, $id_contenido);

      header('Content-Type: application/json');
      echo json_encode([
        'back' => true,
        'data' => $temas,
        'message' => 'Temas del contenido obtenidos exitosamente.'
      ]);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error al obtener los temas del contenido.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  public function crear()
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);

      if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error en el formato JSON: ' . json_last_error_msg());
      }

      // Limpiar textos
      if (isset($data['nombre_tema'])) {
        $data['nombre_tema'] = $this->limpiarTexto($data['nombre_tema']);
      }
      if (isset($data['descripcion'])) {
        $data['descripcion'] = $this->limpiarTexto($data['descripcion']);
      }
      if (isset($data['codigo'])) {
        $data['codigo'] = $this->limpiarTexto($data['codigo']);
      }

      $v = new Validator($data);

      // Validaciones básicas
      $v->rule('required', ['nombre_tema', 'fk_contenido'])
        ->message('{field} es requerido');

      $v->rule('lengthMax', 'nombre_tema', 255)
        ->message('El nombre del tema no debe exceder los 255 caracteres');

      $v->rule('lengthMax', 'descripcion', 255)
        ->message('La descripción no debe exceder los 255 caracteres');

      $v->rule('lengthMax', 'codigo', 50)
        ->message('El código no debe exceder los 50 caracteres');

      $v->rule('integer', 'fk_contenido')
        ->message('El contenido debe ser un número entero');

      $v->rule('min', 'fk_contenido', 1)
        ->message('El contenido debe ser válido');

      $v->rule('integer', 'orden_tema')
        ->message('El orden debe ser un número entero');

      $v->rule('min', 'orden_tema', 1)
        ->message('El orden debe ser al menos 1');

      // Validación personalizada para texto en español
      $v->addRule('textoEspanol', function ($field, $value) {
        return preg_match('/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.\,\;\:\!\?\(\)\-]+$/', $value) && trim($value) !== '';
      }, 'debe contener solo letras en español, espacios y signos de puntuación');

      $v->rule('textoEspanol', 'nombre_tema');
      if (!empty($data['descripcion'])) {
        $v->rule('textoEspanol', 'descripcion');
      }
      if (!empty($data['codigo'])) {
        $v->rule('regex', 'codigo', '/^[a-zA-Z0-9\-\_\.]+$/')->message('El código solo puede contener letras, números, guiones, puntos y guiones bajos');
      }

      // Validar existencia del contenido
      $nombreContenido = $this->validarExistenciaForanea('contenidos', 'id_contenido', $data['fk_contenido'], 'nombre');

      if (!$nombreContenido) {
        $v->error('fk_contenido', 'El contenido seleccionado no existe');
      }

      if ($v->validate()) {
        $pdo = Conexion::obtener();
        $tema = new Temas(
          $data['fk_contenido'],
          $data['codigo'] ?? null,
          $data['nombre_tema'],
          $data['descripcion'] ?? null,
          $data['orden_tema'] ?? 1
        );

        $id = $tema->crear($pdo);

        if ($id) {
          http_response_code(201);
          $tema->id_tema = $id;

          header('Content-Type: application/json');
          echo json_encode([
            'back' => true,
            'data' => $tema,
            'message' => 'Tema creado exitosamente.'
          ]);
        } else {
          throw new Exception('No se pudo crear el tema en la base de datos');
        }
      } else {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'errors' => $v->errors(),
          'message' => 'Datos inválidos en la solicitud.'
        ]);
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error en el servidor al crear el tema.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  public function actualizar($id)
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);

      if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error en el formato JSON: ' . json_last_error_msg());
      }

      // Limpiar textos
      if (isset($data['nombre_tema'])) {
        $data['nombre_tema'] = $this->limpiarTexto($data['nombre_tema']);
      }
      if (isset($data['descripcion'])) {
        $data['descripcion'] = $this->limpiarTexto($data['descripcion']);
      }
      if (isset($data['codigo'])) {
        $data['codigo'] = $this->limpiarTexto($data['codigo']);
      }

      $v = new Validator($data);

      // Validaciones básicas
      $v->rule('required', ['nombre_tema', 'fk_contenido'])
        ->message('{field} es requerido');

      $v->rule('lengthMax', 'nombre_tema', 255)
        ->message('El nombre del tema no debe exceder los 255 caracteres');

      $v->rule('lengthMax', 'descripcion', 255)
        ->message('La descripción no debe exceder los 255 caracteres');

      $v->rule('lengthMax', 'codigo', 50)
        ->message('El código no debe exceder los 50 caracteres');

      $v->rule('integer', 'fk_contenido')
        ->message('El contenido debe ser un número entero');

      $v->rule('min', 'fk_contenido', 1)
        ->message('El contenido debe ser válido');

      $v->rule('integer', 'orden_tema')
        ->message('El orden debe ser un número entero');

      $v->rule('min', 'orden_tema', 1)
        ->message('El orden debe ser al menos 1');

      // Validación personalizada para texto en español
      $v->addRule('textoEspanol', function ($field, $value) {
        return preg_match('/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.\,\;\:\!\?\(\)\-]+$/', $value) && trim($value) !== '';
      }, 'debe contener solo letras en español, espacios y signos de puntuación');

      $v->rule('textoEspanol', 'nombre_tema');
      if (!empty($data['descripcion'])) {
        $v->rule('textoEspanol', 'descripcion');
      }
      if (!empty($data['codigo'])) {
        $v->rule('regex', 'codigo', '/^[a-zA-Z0-9\-\_\.]+$/')->message('El código solo puede contener letras, números, guiones, puntos y guiones bajos');
      }

      // Validar existencia del contenido
      $nombreContenido = $this->validarExistenciaForanea('contenidos', 'id_contenido', $data['fk_contenido'], 'nombre');

      if (!$nombreContenido) {
        $v->error('fk_contenido', 'El contenido seleccionado no existe');
      }

      if ($v->validate()) {
        $pdo = Conexion::obtener();
        $tema = Temas::consultarActualizar($pdo, $id);

        if ($tema) {
          $tema->codigo = $data['codigo'] ?? null;
          $tema->nombre_tema = $data['nombre_tema'];
          $tema->descripcion = $data['descripcion'] ?? null;
          $tema->orden_tema = $data['orden_tema'] ?? 1;

          if ($tema->actualizar($pdo)) {
            header('Content-Type: application/json');
            echo json_encode([
              'back' => true,
              'data' => $tema,
              'message' => 'Tema actualizado exitosamente.'
            ]);
          } else {
            throw new Exception('No se pudo actualizar el tema en la base de datos');
          }
        } else {
          http_response_code(404);
          header('Content-Type: application/json');
          echo json_encode([
            'back' => false,
            'message' => 'Tema no encontrado.'
          ]);
        }
      } else {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'errors' => $v->errors(),
          'message' => 'Datos inválidos en la solicitud.'
        ]);
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error en el servidor al actualizar el tema.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  public function eliminar($id)
  {
    try {
      $pdo = Conexion::obtener();
      if (Temas::eliminar($pdo, $id)) {
        header('Content-Type: application/json');
        echo json_encode([
          'back' => true,
          'message' => 'Tema eliminado exitosamente.'
        ]);
      } else {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Error al eliminar el tema.'
        ]);
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error en el servidor al eliminar el tema.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  public function cambiarEstado($id)
  {
    try {
      $pdo = Conexion::obtener();
      if (Temas::cambiarEstado($pdo, $id)) {
        header('Content-Type: application/json');
        echo json_encode([
          'back' => true,
          'message' => 'Estado del tema cambiado exitosamente.'
        ]);
      } else {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Error al cambiar el estado del tema.'
        ]);
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error en el servidor al cambiar el estado del tema.',
        'error_details' => $e->getMessage()
      ]);
    }
  }
}
