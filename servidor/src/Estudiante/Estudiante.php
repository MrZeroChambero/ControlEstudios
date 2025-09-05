<?php

namespace Micodigo\Estudiante;

use PDO;
use Exception;
use Valitron\Validator;
use Micodigo\Persona\Persona;

class Estudiante
{
  public $id_estudiante;
  public $id_persona;
  public $codigo_estudiantil;
  public $grado_actual;
  public $seccion_actual;
  public $fecha_ingreso_escuela;
  public $vive_con_padres;

  public function __construct(
    $id_persona,
    $codigo_estudiantil,
    $grado_actual,
    $fecha_ingreso_escuela,
    $seccion_actual = null,
    $vive_con_padres = null
  ) {
    $this->id_persona = $id_persona;
    $this->codigo_estudiantil = $codigo_estudiantil;
    $this->grado_actual = $grado_actual;
    $this->seccion_actual = $seccion_actual;
    $this->fecha_ingreso_escuela = $fecha_ingreso_escuela;
    $this->vive_con_padres = $vive_con_padres;
  }

  /**
   * Valida los datos del objeto Estudiante usando Valitron.
   * @param array $data Los datos a validar.
   * @return array|bool Un array con errores o verdadero si la validación es exitosa.
   */
  private function _validarDatos(array $data)
  {
    // Carga los mensajes de validación personalizados
    Validator::lang('es');

    // Instancia el validador pasando los datos y el idioma 'es'
    $v = new Validator($data, [], 'es');

    // Define las reglas de validación
    $v->rules([
      'required' => [
        ['id_persona'],
        ['codigo_estudiantil'],
        ['grado_actual'],
        ['fecha_ingreso_escuela']
      ],
      'numeric' => [
        ['id_persona']
      ],
      'lengthMax' => [
        ['codigo_estudiantil', 20],
        ['grado_actual', 20],
        ['seccion_actual', 10]
      ],
      'date' => [
        ['fecha_ingreso_escuela']
      ],
      'boolean' => [
        ['vive_con_padres']
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea un nuevo estudiante con validación previa.
   * @param PDO $pdo Objeto de conexión a la base de datos.
   * @return int|array|false El ID insertado, un array de errores, o falso si falla.
   */
  public function crear(PDO $pdo)
  {
    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "INSERT INTO estudiantes (id_persona, codigo_estudiantil, grado_actual, seccion_actual, fecha_ingreso_escuela, vive_con_padres) VALUES (?, ?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->id_persona,
        $this->codigo_estudiantil,
        $this->grado_actual,
        $this->seccion_actual,
        $this->fecha_ingreso_escuela,
        $this->vive_con_padres
      ]);
      $this->id_estudiante = $pdo->lastInsertId();
      return $this->id_estudiante;
    } catch (Exception $e) {
      // Manejar error de duplicidad de código estudiantil
      if ($e->getCode() == 23000) {
        return ['codigo_estudiantil' => ['El código estudiantil ya se encuentra registrado.']];
      }
      return false;
    }
  }

  /**
   * Actualiza los datos de un estudiante con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_estudiante)) {
      return ['id_estudiante' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE estudiantes SET codigo_estudiantil=?, grado_actual=?, seccion_actual=?, fecha_ingreso_escuela=?, vive_con_padres=? WHERE id_estudiante=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->codigo_estudiantil,
        $this->grado_actual,
        $this->seccion_actual,
        $this->fecha_ingreso_escuela,
        $this->vive_con_padres,
        $this->id_estudiante
      ]);
    } catch (Exception $e) {
      // Manejar error de duplicidad de código estudiantil
      if ($e->getCode() == 23000) {
        return ['codigo_estudiantil' => ['El código estudiantil ya se encuentra registrado.']];
      }
      return false;
    }
  }

  /**
   * Elimina un registro de estudiante por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID del estudiante a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM estudiantes WHERE id_estudiante=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Cambia el estado de una inscripción de estudiante.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id_inscripcion ID de la inscripción a modificar.
   * @param string $nuevo_estado El nuevo estado ('Activo', 'Retirado', 'En_Proceso').
   * @param string $motivo_retiro Motivo si el estado es 'Retirado'.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores.
   */
  public static function cambiarEstadoInscripcion(PDO $pdo, $id_inscripcion, $nuevo_estado, $motivo_retiro = null)
  {
    if (!in_array($nuevo_estado, ['Activo', 'Retirado', 'En_Proceso'])) {
      return ['estado' => ['El estado de inscripción no es válido.']];
    }
    try {
      $sql = "UPDATE inscripciones SET estado_inscripcion=?, motivo_retiro=?, fecha_retiro=? WHERE id_inscripcion=?";
      $stmt = $pdo->prepare($sql);
      $fecha_retiro = ($nuevo_estado === 'Retirado') ? date('Y-m-d') : null;
      return $stmt->execute([$nuevo_estado, $motivo_retiro, $fecha_retiro, $id_inscripcion]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta los datos de un estudiante por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del estudiante a consultar.
   * @return object|false Un objeto Estudiante con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM estudiantes WHERE id_estudiante = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $estudiante = new self(
          $data['id_persona'],
          $data['codigo_estudiantil'],
          $data['grado_actual'],
          $data['fecha_ingreso_escuela'],
          $data['seccion_actual'],
          $data['vive_con_padres']
        );
        $estudiante->id_estudiante = $data['id_estudiante'];
        return $estudiante;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de un estudiante por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del estudiante a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM estudiantes WHERE id_estudiante = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
