<?php

namespace Micodigo\Literales;

use PDO;
use Exception;
use Valitron\Validator;

class Literales
{
  public $id_literal;
  public $id_inscripcion;
  public $id_planificacion;
  public $id_indicador;
  public $literal;
  public $fecha_evaluacion;
  public $observaciones;

  public function __construct(
    $id_inscripcion,
    $id_planificacion,
    $id_indicador,
    $literal,
    $fecha_evaluacion,
    $observaciones = null
  ) {
    $this->id_inscripcion = $id_inscripcion;
    $this->id_planificacion = $id_planificacion;
    $this->id_indicador = $id_indicador;
    $this->literal = $literal;
    $this->fecha_evaluacion = $fecha_evaluacion;
    $this->observaciones = $observaciones;
  }

  /**
   * Valida los datos del objeto Literales usando Valitron.
   * @param array $data Los datos a validar.
   * @return array|bool Un array con errores o verdadero si la validación es exitosa.
   */
  private function _validarDatos(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data, [], 'es');

    $v->rules([
      'required' => [
        ['id_inscripcion'],
        ['id_planificacion'],
        ['id_indicador'],
        ['literal'],
        ['fecha_evaluacion']
      ],
      'numeric' => [
        ['id_inscripcion'],
        ['id_planificacion'],
        ['id_indicador']
      ],
      'date' => [
        ['fecha_evaluacion']
      ],
      'lengthMax' => [
        ['literal', 10]
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea un nuevo registro de literal de calificación con validación previa.
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
      $sql = "INSERT INTO literales (id_inscripcion, id_planificacion, id_indicador, literal, fecha_evaluacion, observaciones) VALUES (?, ?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->id_inscripcion,
        $this->id_planificacion,
        $this->id_indicador,
        $this->literal,
        $this->fecha_evaluacion,
        $this->observaciones
      ]);
      $this->id_literal = $pdo->lastInsertId();
      return $this->id_literal;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de un registro de literal con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_literal)) {
      return ['id_literal' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE literales SET id_inscripcion=?, id_planificacion=?, id_indicador=?, literal=?, fecha_evaluacion=?, observaciones=? WHERE id_literal=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->id_inscripcion,
        $this->id_planificacion,
        $this->id_indicador,
        $this->literal,
        $this->fecha_evaluacion,
        $this->observaciones,
        $this->id_literal
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de literal por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID del registro a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM literales WHERE id_literal=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta los datos de un registro por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del registro a consultar.
   * @return object|false Un objeto Literales con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM literales WHERE id_literal = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $literal = new self(
          $data['id_inscripcion'],
          $data['id_planificacion'],
          $data['id_indicador'],
          $data['literal'],
          $data['fecha_evaluacion'],
          $data['observaciones']
        );
        $literal->id_literal = $data['id_literal'];
        return $literal;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de un registro de literal por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del registro a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM literales WHERE id_literal = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
