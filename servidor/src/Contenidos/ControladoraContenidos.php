<?php

namespace Micodigo\Contenidos;

use Micodigo\Config\Conexion;
use Valitron\Validator;
use Exception;

class ControladoraContenidos
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
        $sql .= " AND id_contenido != ?";
        $bindings[] = $ignoreId;
      }

      $stmt = $pdo->prepare($sql);
      $stmt->execute($bindings);
      return $stmt->fetchColumn() == 0;
    }, 'ya está en uso.');
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

  public function listar()
  {
    try {
      $pdo = Conexion::obtener();
      $contenidos = Contenidos::consultarTodos($pdo);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => true,
        'data' => $contenidos,
        'message' => 'Contenidos obtenidos exitosamente.'
      ]);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error al obtener los contenidos.',
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
      if (isset($data['nombre'])) {
        $data['nombre'] = $this->limpiarTexto($data['nombre']);
      }
      if (isset($data['descripcion'])) {
        $data['descripcion'] = $this->limpiarTexto($data['descripcion']);
      }

      $v = new Validator($data);

      // Validaciones básicas
      $v->rule('required', ['nombre', 'fk_area_aprendizaje', 'nivel'])
        ->message('{field} es requerido');

      $v->rule('lengthMax', 'nombre', 255)
        ->message('El nombre no debe exceder los 255 caracteres');

      $v->rule('lengthMax', 'descripcion', 255)
        ->message('La descripción no debe exceder los 255 caracteres');

      $v->rule('integer', 'fk_area_aprendizaje')
        ->message('El área de aprendizaje debe ser un número entero');

      $v->rule('min', 'fk_area_aprendizaje', 1)
        ->message('El área de aprendizaje debe ser válida');

      $v->rule('in', 'nivel', ['primero', 'segundo', 'tercero', 'cuarto', 'quinto', 'sexto'])
        ->message('El nivel debe ser uno de: primero, segundo, tercero, cuarto, quinto, sexto');

      $v->rule('integer', 'orden_contenido')
        ->message('El orden debe ser un número entero');

      $v->rule('min', 'orden_contenido', 1)
        ->message('El orden debe ser al menos 1');

      // Validación personalizada para texto en español
      $v->addRule('textoEspanol', function ($field, $value) {
        return preg_match('/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.\,\;\:\!\?\(\)\-]+$/', $value) && trim($value) !== '';
      }, 'debe contener solo letras en español, espacios y signos de puntuación');

      $v->rule('textoEspanol', 'nombre');
      if (!empty($data['descripcion'])) {
        $v->rule('textoEspanol', 'descripcion');
      }

      // Validar existencia de área de aprendizaje
      $nombreArea = $this->validarExistenciaForanea('areas_aprendizaje', 'id_area_aprendizaje', $data['fk_area_aprendizaje'], 'nombre_area');

      if (!$nombreArea) {
        $v->error('fk_area_aprendizaje', 'El área de aprendizaje seleccionada no existe');
      }

      // Validar unicidad
      $this->addUniqueRule($v, 'nombre', 'contenidos', 'nombre');

      if ($v->validate()) {
        $pdo = Conexion::obtener();
        $contenido = new Contenidos(
          $data['nombre'],
          $data['fk_area_aprendizaje'],
          $data['nivel'],
          $data['descripcion'] ?? null,
          $data['orden_contenido'] ?? 1
        );

        $id = $contenido->crear($pdo);

        if ($id) {
          http_response_code(201);
          $contenido->id_contenido = $id;
          // Agregar nombre del área para la respuesta
          $contenido->nombre_area = $nombreArea;

          header('Content-Type: application/json');
          echo json_encode([
            'back' => true,
            'data' => $contenido,
            'message' => 'Contenido creado exitosamente.'
          ]);
        } else {
          throw new Exception('No se pudo crear el contenido en la base de datos');
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
        'message' => 'Error en el servidor al crear el contenido.',
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
      if (isset($data['nombre'])) {
        $data['nombre'] = $this->limpiarTexto($data['nombre']);
      }
      if (isset($data['descripcion'])) {
        $data['descripcion'] = $this->limpiarTexto($data['descripcion']);
      }

      $v = new Validator($data);

      // Validaciones básicas
      $v->rule('required', ['nombre', 'fk_area_aprendizaje', 'nivel'])
        ->message('{field} es requerido');

      $v->rule('lengthMax', 'nombre', 255)
        ->message('El nombre no debe exceder los 255 caracteres');

      $v->rule('lengthMax', 'descripcion', 255)
        ->message('La descripción no debe exceder los 255 caracteres');

      $v->rule('integer', 'fk_area_aprendizaje')
        ->message('El área de aprendizaje debe ser un número entero');

      $v->rule('min', 'fk_area_aprendizaje', 1)
        ->message('El área de aprendizaje debe ser válida');

      $v->rule('in', 'nivel', ['primero', 'segundo', 'tercero', 'cuarto', 'quinto', 'sexto'])
        ->message('El nivel debe ser uno de: primero, segundo, tercero, cuarto, quinto, sexto');

      $v->rule('integer', 'orden_contenido')
        ->message('El orden debe ser un número entero');

      $v->rule('min', 'orden_contenido', 1)
        ->message('El orden debe ser al menos 1');

      // Validación personalizada para texto en español
      $v->addRule('textoEspanol', function ($field, $value) {
        return preg_match('/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.\,\;\:\!\?\(\)\-]+$/', $value) && trim($value) !== '';
      }, 'debe contener solo letras en español, espacios y signos de puntuación');

      $v->rule('textoEspanol', 'nombre');
      if (!empty($data['descripcion'])) {
        $v->rule('textoEspanol', 'descripcion');
      }

      // Validar existencia de área de aprendizaje
      $nombreArea = $this->validarExistenciaForanea('areas_aprendizaje', 'id_area_aprendizaje', $data['fk_area_aprendizaje'], 'nombre_area');

      if (!$nombreArea) {
        $v->error('fk_area_aprendizaje', 'El área de aprendizaje seleccionada no existe');
      }

      // Validar unicidad ignorando el registro actual
      $this->addUniqueRule($v, 'nombre', 'contenidos', 'nombre', $id);

      if ($v->validate()) {
        $pdo = Conexion::obtener();
        $contenido = Contenidos::consultarActualizar($pdo, $id);

        if ($contenido) {
          $contenido->nombre = $data['nombre'];
          $contenido->fk_area_aprendizaje = $data['fk_area_aprendizaje'];
          $contenido->nivel = $data['nivel'];
          $contenido->descripcion = $data['descripcion'] ?? null;
          $contenido->orden_contenido = $data['orden_contenido'] ?? 1;

          if ($contenido->actualizar($pdo)) {
            // Agregar nombre del área para la respuesta
            $contenido->nombre_area = $nombreArea;

            header('Content-Type: application/json');
            echo json_encode([
              'back' => true,
              'data' => $contenido,
              'message' => 'Contenido actualizado exitosamente.'
            ]);
          } else {
            throw new Exception('No se pudo actualizar el contenido en la base de datos');
          }
        } else {
          http_response_code(404);
          header('Content-Type: application/json');
          echo json_encode([
            'back' => false,
            'message' => 'Contenido no encontrado.'
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
        'message' => 'Error en el servidor al actualizar el contenido.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  public function eliminar($id)
  {
    try {
      $pdo = Conexion::obtener();
      if (Contenidos::eliminar($pdo, $id)) {
        header('Content-Type: application/json');
        echo json_encode([
          'back' => true,
          'message' => 'Contenido eliminado exitosamente.'
        ]);
      } else {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Error al eliminar el contenido.'
        ]);
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error en el servidor al eliminar el contenido.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  public function cambiarEstado($id)
  {
    try {
      $pdo = Conexion::obtener();
      if (Contenidos::cambiarEstado($pdo, $id)) {
        header('Content-Type: application/json');
        echo json_encode([
          'back' => true,
          'message' => 'Estado del contenido cambiado exitosamente.'
        ]);
      } else {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Error al cambiar el estado del contenido.'
        ]);
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error en el servidor al cambiar el estado del contenido.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  public function listarSelect()
  {
    try {
      $pdo = Conexion::obtener();
      $contenidos = Contenidos::consultarParaSelect($pdo);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => true,
        'data' => $contenidos,
        'message' => 'Contenidos para select obtenidos exitosamente.'
      ]);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error al obtener los contenidos para select.',
        'error_details' => $e->getMessage()
      ]);
    }
  }
}
