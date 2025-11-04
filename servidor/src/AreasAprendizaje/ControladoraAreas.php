<?php

namespace Micodigo\AreasAprendizaje;

use Micodigo\Config\Conexion;
use Valitron\Validator;
use Exception;

class ControladoraAreas
{
  public function __construct()
  {
    Validator::lang('es');
  }

  private function limpiarTexto($texto)
  {
    // Eliminar espacios al inicio y final
    $texto = trim($texto);
    // Reemplazar múltiples espacios por uno solo
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
        $sql .= " AND id_area_aprendizaje != ?";
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
      $areas = AreasAprendizaje::consultarTodos($pdo);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => true,
        'data' => $areas,
        'message' => 'Áreas de aprendizaje obtenidas exitosamente.'
      ]);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error al obtener las áreas de aprendizaje.',
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

      // Limpiar el texto del nombre del área
      if (isset($data['nombre_area'])) {
        $data['nombre_area'] = $this->limpiarTexto($data['nombre_area']);
      }

      $v = new Validator($data);

      // Validaciones básicas
      $v->rule('required', ['nombre_area', 'fk_componente', 'fk_funcion'])
        ->message('{field} es requerido');

      $v->rule('lengthMax', 'nombre_area', 100)
        ->message('El nombre del área no debe exceder los 100 caracteres');

      $v->rule('integer', ['fk_componente', 'fk_funcion'])
        ->message('{field} debe ser un número entero');

      $v->rule('min', 'fk_componente', 1)
        ->message('El componente debe ser válido');

      $v->rule('min', 'fk_funcion', 1)
        ->message('La función debe ser válida');

      // Validación personalizada para texto en español
      $v->addRule('textoEspanol', function ($field, $value) {
        return preg_match('/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.]+$/', $value) && trim($value) !== '';
      }, 'debe contener solo letras en español, espacios y puntos');

      $v->rule('textoEspanol', 'nombre_area');

      // Validar existencia de claves foráneas
      $nombreComponente = $this->validarExistenciaForanea('componentes_aprendizaje', 'id_componente', $data['fk_componente'], 'nombre_componente');
      $nombreFuncion = $this->validarExistenciaForanea('funcion_personal', 'id_funcion_personal', $data['fk_funcion'], 'nombre');

      if (!$nombreComponente) {
        $v->error('fk_componente', 'El componente seleccionado no existe');
      }

      if (!$nombreFuncion) {
        $v->error('fk_funcion', 'La función seleccionada no existe');
      }

      // Validar unicidad
      $this->addUniqueRule($v, 'nombre_area', 'areas_aprendizaje', 'nombre_area');

      if ($v->validate()) {
        $pdo = Conexion::obtener();
        $area = new AreasAprendizaje(
          $data['nombre_area'],
          $data['fk_componente'],
          $data['fk_funcion']
        );

        $id = $area->crear($pdo);

        if ($id) {
          http_response_code(201);
          $area->id_area_aprendizaje = $id;
          // Agregar nombres de las relaciones para la respuesta
          $area->nombre_componente = $nombreComponente;
          $area->nombre_funcion = $nombreFuncion;

          header('Content-Type: application/json');
          echo json_encode([
            'back' => true,
            'data' => $area,
            'message' => 'Área de aprendizaje creada exitosamente.'
          ]);
        } else {
          throw new Exception('No se pudo crear el área de aprendizaje en la base de datos');
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
        'message' => 'Error en el servidor al crear el área de aprendizaje.',
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

      // Limpiar el texto del nombre del área
      if (isset($data['nombre_area'])) {
        $data['nombre_area'] = $this->limpiarTexto($data['nombre_area']);
      }

      $v = new Validator($data);

      // Validaciones básicas
      $v->rule('required', ['nombre_area', 'fk_componente', 'fk_funcion'])
        ->message('{field} es requerido');

      $v->rule('lengthMax', 'nombre_area', 100)
        ->message('El nombre del área no debe exceder los 100 caracteres');

      $v->rule('integer', ['fk_componente', 'fk_funcion'])
        ->message('{field} debe ser un número entero');

      $v->rule('min', 'fk_componente', 1)
        ->message('El componente debe ser válido');

      $v->rule('min', 'fk_funcion', 1)
        ->message('La función debe ser válida');

      // Validación personalizada para texto en español
      $v->addRule('textoEspanol', function ($field, $value) {
        return preg_match('/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.]+$/', $value) && trim($value) !== '';
      }, 'debe contener solo letras en español, espacios y puntos');

      $v->rule('textoEspanol', 'nombre_area');

      // Validar existencia de claves foráneas
      $nombreComponente = $this->validarExistenciaForanea('componentes_aprendizaje', 'id_componente', $data['fk_componente'], 'nombre_componente');
      $nombreFuncion = $this->validarExistenciaForanea('funcion_personal', 'id_funcion_personal', $data['fk_funcion'], 'nombre');

      if (!$nombreComponente) {
        $v->error('fk_componente', 'El componente seleccionado no existe');
      }

      if (!$nombreFuncion) {
        $v->error('fk_funcion', 'La función seleccionada no existe');
      }

      // Validar unicidad ignorando el registro actual
      $this->addUniqueRule($v, 'nombre_area', 'areas_aprendizaje', 'nombre_area', $id);

      if ($v->validate()) {
        $pdo = Conexion::obtener();
        $area = AreasAprendizaje::consultarActualizar($pdo, $id);

        if ($area) {
          $area->nombre_area = $data['nombre_area'];
          $area->fk_componente = $data['fk_componente'];
          $area->fk_funcion = $data['fk_funcion'];

          if ($area->actualizar($pdo)) {
            // Agregar nombres de las relaciones para la respuesta
            $area->nombre_componente = $nombreComponente;
            $area->nombre_funcion = $nombreFuncion;

            header('Content-Type: application/json');
            echo json_encode([
              'back' => true,
              'data' => $area,
              'message' => 'Área de aprendizaje actualizada exitosamente.'
            ]);
          } else {
            throw new Exception('No se pudo actualizar el área de aprendizaje en la base de datos');
          }
        } else {
          http_response_code(404);
          header('Content-Type: application/json');
          echo json_encode([
            'back' => false,
            'message' => 'Área de aprendizaje no encontrada.'
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
        'message' => 'Error en el servidor al actualizar el área de aprendizaje.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  public function eliminar($id)
  {
    try {
      $pdo = Conexion::obtener();
      if (AreasAprendizaje::eliminar($pdo, $id)) {
        header('Content-Type: application/json');
        echo json_encode([
          'back' => true,
          'message' => 'Área de aprendizaje eliminada exitosamente.'
        ]);
      } else {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Error al eliminar el área de aprendizaje.'
        ]);
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error en el servidor al eliminar el área de aprendizaje.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  public function cambiarEstado($id)
  {
    try {
      $pdo = Conexion::obtener();
      if (AreasAprendizaje::cambiarEstado($pdo, $id)) {
        header('Content-Type: application/json');
        echo json_encode([
          'back' => true,
          'message' => 'Estado del área de aprendizaje cambiado exitosamente.'
        ]);
      } else {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Error al cambiar el estado del área de aprendizaje.'
        ]);
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error en el servidor al cambiar el estado del área de aprendizaje.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  public function listarSelect()
  {
    try {
      $pdo = Conexion::obtener();
      $areas = AreasAprendizaje::consultarParaSelect($pdo);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => true,
        'data' => $areas,
        'message' => 'Áreas de aprendizaje para select obtenidas exitosamente.'
      ]);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error al obtener las áreas de aprendizaje para select.',
        'error_details' => $e->getMessage()
      ]);
    }
  }
}
