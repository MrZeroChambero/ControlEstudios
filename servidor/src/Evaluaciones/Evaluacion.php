<?php

namespace Micodigo\Evaluacion;

use PDO;
use Exception;
use Valitron\Validator;

class Evaluacion
{
  public $id_evaluacion;
  public $id_estudiante;
  public $id_asignatura;
  public $id_trimestre;
  public $id_seccion;
  public $fecha_evaluacion;
  public $tipo_evaluacion;
  public $descripcion;
  public $nota;
  public $observacion;

  public function __construct(
    $id_estudiante,
    $id_asignatura,
    $id_trimestre,
    $id_seccion,
    $fecha_evaluacion,
    $tipo_evaluacion,
    $nota,
    $descripcion = null,
    $observacion = null
  ) {
    $this->id_estudiante = $id_estudiante;
    $this->id_asignatura = $id_asignatura;
    $this->id_trimestre = $id_trimestre;
    $this->id_seccion = $id_seccion;
    $this->fecha_evaluacion = $fecha_evaluacion;
    $this->tipo_evaluacion = $tipo_evaluacion;
    $this->nota = $nota;
    $this->descripcion = $descripcion;
    $this->observacion = $observacion;
  }

  /**
   * Valida los datos del objeto Evaluacion usando Valitron.
   * @param array $data Los datos a validar.
   * @return array|bool Un array con errores o verdadero si la validación es exitosa.
   */
  private function _validarDatos(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data, [], 'es');

    $v->rules([
      'required' => [
        ['id_estudiante'],
        ['id_asignatura'],
        ['id_trimestre'],
        ['id_seccion'],
        ['fecha_evaluacion'],
        ['tipo_evaluacion'],
        ['nota']
      ],
      'numeric' => [
        ['id_estudiante'],
        ['id_asignatura'],
        ['id_trimestre'],
        ['id_seccion'],
        ['nota']
      ],
      'date' => [
        ['fecha_evaluacion']
      ],
      'lengthMax' => [
        ['tipo_evaluacion', 50]
      ],
      'min' => [
        ['nota', 0]
      ],
      'max' => [
        ['nota', 20] // Suponiendo una escala de 0 a 20
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea una nueva evaluación con validación previa.
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
      $sql = "INSERT INTO evaluaciones (id_estudiante, id_asignatura, id_trimestre, id_seccion, fecha_evaluacion, tipo_evaluacion, descripcion, nota, observacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->id_estudiante,
        $this->id_asignatura,
        $this->id_trimestre,
        $this->id_seccion,
        $this->fecha_evaluacion,
        $this->tipo_evaluacion,
        $this->descripcion,
        $this->nota,
        $this->observacion
      ]);
      $this->id_evaluacion = $pdo->lastInsertId();
      return $this->id_evaluacion;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de una evaluación con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_evaluacion)) {
      return ['id_evaluacion' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE evaluaciones SET id_estudiante=?, id_asignatura=?, id_trimestre=?, id_seccion=?, fecha_evaluacion=?, tipo_evaluacion=?, descripcion=?, nota=?, observacion=? WHERE id_evaluacion=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->id_estudiante,
        $this->id_asignatura,
        $this->id_trimestre,
        $this->id_seccion,
        $this->fecha_evaluacion,
        $this->tipo_evaluacion,
        $this->descripcion,
        $this->nota,
        $this->observacion,
        $this->id_evaluacion
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de evaluación por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID de la evaluación a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM evaluaciones WHERE id_evaluacion=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta los datos de una evaluación por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID de la evaluación a consultar.
   * @return object|false Un objeto Evaluacion con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM evaluaciones WHERE id_evaluacion = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $evaluacion = new self(
          $data['id_estudiante'],
          $data['id_asignatura'],
          $data['id_trimestre'],
          $data['id_seccion'],
          $data['fecha_evaluacion'],
          $data['tipo_evaluacion'],
          $data['nota'],
          $data['descripcion'],
          $data['observacion']
        );
        $evaluacion->id_evaluacion = $data['id_evaluacion'];
        return $evaluacion;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de una evaluación por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID de la evaluación a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM evaluaciones WHERE id_evaluacion = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
