<?php

namespace Micodigo\Inscripcion;

use PDO;
use Exception;
use Valitron\Validator;

class Inscripcion
{
  public $id_inscripcion;
  public $id_estudiante;
  public $id_anio_escolar;
  public $id_seccion;
  public $fecha_inscripcion;
  public $estado_inscripcion;
  public $motivo_retiro;
  public $fecha_retiro;
  public $id_representante_legal;
  public $id_representante_socioeconomico;

  public function __construct(
    $id_estudiante,
    $id_anio_escolar,
    $id_seccion,
    $fecha_inscripcion,
    $estado_inscripcion,
    $motivo_retiro = null,
    $fecha_retiro = null,
    $id_representante_legal = null,
    $id_representante_socioeconomico = null
  ) {
    $this->id_estudiante = $id_estudiante;
    $this->id_anio_escolar = $id_anio_escolar;
    $this->id_seccion = $id_seccion;
    $this->fecha_inscripcion = $fecha_inscripcion;
    $this->estado_inscripcion = $estado_inscripcion;
    $this->motivo_retiro = $motivo_retiro;
    $this->fecha_retiro = $fecha_retiro;
    $this->id_representante_legal = $id_representante_legal;
    $this->id_representante_socioeconomico = $id_representante_socioeconomico;
  }

  /**
   * Valida los datos del objeto Inscripcion usando Valitron.
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
        ['id_anio_escolar'],
        ['id_seccion'],
        ['fecha_inscripcion'],
        ['estado_inscripcion']
      ],
      'numeric' => [
        ['id_estudiante'],
        ['id_anio_escolar'],
        ['id_seccion'],
        ['id_representante_legal'],
        ['id_representante_socioeconomico']
      ],
      'date' => [
        ['fecha_inscripcion'],
        ['fecha_retiro']
      ],
      'lengthMax' => [
        ['estado_inscripcion', 20],
        ['motivo_retiro', 255]
      ]
    ]);

    $v->rule(function ($field, $value, $params, $fields) {
      $validStates = ['Activo', 'Retirado', 'En_Proceso'];
      return in_array($value, $validStates);
    }, 'estado_inscripcion')->message('El estado de la inscripción no es válido.');

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea una nueva inscripción con validación previa.
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
      $sql = "INSERT INTO inscripciones (id_estudiante, id_anio_escolar, id_seccion, fecha_inscripcion, estado_inscripcion, motivo_retiro, fecha_retiro, id_representante_legal, id_representante_socioeconomico) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->id_estudiante,
        $this->id_anio_escolar,
        $this->id_seccion,
        $this->fecha_inscripcion,
        $this->estado_inscripcion,
        $this->motivo_retiro,
        $this->fecha_retiro,
        $this->id_representante_legal,
        $this->id_representante_socioeconomico
      ]);
      $this->id_inscripcion = $pdo->lastInsertId();
      return $this->id_inscripcion;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de una inscripción con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_inscripcion)) {
      return ['id_inscripcion' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE inscripciones SET id_estudiante=?, id_anio_escolar=?, id_seccion=?, fecha_inscripcion=?, estado_inscripcion=?, motivo_retiro=?, fecha_retiro=?, id_representante_legal=?, id_representante_socioeconomico=? WHERE id_inscripcion=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->id_estudiante,
        $this->id_anio_escolar,
        $this->id_seccion,
        $this->fecha_inscripcion,
        $this->estado_inscripcion,
        $this->motivo_retiro,
        $this->fecha_retiro,
        $this->id_representante_legal,
        $this->id_representante_socioeconomico,
        $this->id_inscripcion
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de inscripción por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID de la inscripción a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM inscripciones WHERE id_inscripcion=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta los datos de una inscripción por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID de la inscripción a consultar.
   * @return object|false Un objeto Inscripcion con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM inscripciones WHERE id_inscripcion = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $inscripcion = new self(
          $data['id_estudiante'],
          $data['id_anio_escolar'],
          $data['id_seccion'],
          $data['fecha_inscripcion'],
          $data['estado_inscripcion'],
          $data['motivo_retiro'],
          $data['fecha_retiro'],
          $data['id_representante_legal'],
          $data['id_representante_socioeconomico']
        );
        $inscripcion->id_inscripcion = $data['id_inscripcion'];
        return $inscripcion;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de una inscripción por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID de la inscripción a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM inscripciones WHERE id_inscripcion = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
