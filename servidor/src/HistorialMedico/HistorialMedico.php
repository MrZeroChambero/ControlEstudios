<?php

namespace Micodigo\HistorialMedico;

use PDO;
use Exception;
use Valitron\Validator;

class HistorialMedico
{
  public $id_historial_medico;
  public $id_estudiante;
  public $grupo_sanguineo;
  public $tipo_rh;
  public $alergias;
  public $condicion_medica;
  public $peso;
  public $estatura;
  public $vacunas_completas;
  public $fecha_vacunacion;
  public $tratamiento_medico;
  public $seguro_medico;

  public function __construct(
    $id_estudiante,
    $grupo_sanguineo,
    $tipo_rh,
    $alergias,
    $vacunas_completas,
    $condicion_medica = null,
    $peso = null,
    $estatura = null,
    $fecha_vacunacion = null,
    $tratamiento_medico = null,
    $seguro_medico = null
  ) {
    $this->id_estudiante = $id_estudiante;
    $this->grupo_sanguineo = $grupo_sanguineo;
    $this->tipo_rh = $tipo_rh;
    $this->alergias = $alergias;
    $this->condicion_medica = $condicion_medica;
    $this->peso = $peso;
    $this->estatura = $estatura;
    $this->vacunas_completas = $vacunas_completas;
    $this->fecha_vacunacion = $fecha_vacunacion;
    $this->tratamiento_medico = $tratamiento_medico;
    $this->seguro_medico = $seguro_medico;
  }

  /**
   * Valida los datos del objeto HistorialMedico usando Valitron.
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
        ['grupo_sanguineo'],
        ['tipo_rh'],
        ['alergias'],
        ['vacunas_completas']
      ],
      'numeric' => [
        ['id_estudiante'],
        ['peso'],
        ['estatura']
      ],
      'lengthMax' => [
        ['grupo_sanguineo', 5],
        ['tipo_rh', 5],
        ['seguro_medico', 255]
      ],
      'date' => [
        ['fecha_vacunacion']
      ],
      'min' => [
        ['peso', 0],
        ['estatura', 0]
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea un nuevo registro de historial médico con validación previa.
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
      $sql = "INSERT INTO historial_medico (id_estudiante, grupo_sanguineo, tipo_rh, alergias, condicion_medica, peso, estatura, vacunas_completas, fecha_vacunacion, tratamiento_medico, seguro_medico) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->id_estudiante,
        $this->grupo_sanguineo,
        $this->tipo_rh,
        $this->alergias,
        $this->condicion_medica,
        $this->peso,
        $this->estatura,
        $this->vacunas_completas,
        $this->fecha_vacunacion,
        $this->tratamiento_medico,
        $this->seguro_medico
      ]);
      $this->id_historial_medico = $pdo->lastInsertId();
      return $this->id_historial_medico;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de un historial médico con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_historial_medico)) {
      return ['id_historial_medico' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE historial_medico SET id_estudiante=?, grupo_sanguineo=?, tipo_rh=?, alergias=?, condicion_medica=?, peso=?, estatura=?, vacunas_completas=?, fecha_vacunacion=?, tratamiento_medico=?, seguro_medico=? WHERE id_historial_medico=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->id_estudiante,
        $this->grupo_sanguineo,
        $this->tipo_rh,
        $this->alergias,
        $this->condicion_medica,
        $this->peso,
        $this->estatura,
        $this->vacunas_completas,
        $this->fecha_vacunacion,
        $this->tratamiento_medico,
        $this->seguro_medico,
        $this->id_historial_medico
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de historial médico por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID del registro a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM historial_medico WHERE id_historial_medico=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta los datos de un historial médico por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del registro a consultar.
   * @return object|false Un objeto HistorialMedico con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM historial_medico WHERE id_historial_medico = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $historialMedico = new self(
          $data['id_estudiante'],
          $data['grupo_sanguineo'],
          $data['tipo_rh'],
          $data['alergias'],
          $data['vacunas_completas'],
          $data['condicion_medica'],
          $data['peso'],
          $data['estatura'],
          $data['fecha_vacunacion'],
          $data['tratamiento_medico'],
          $data['seguro_medico']
        );
        $historialMedico->id_historial_medico = $data['id_historial_medico'];
        return $historialMedico;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de un registro de historial médico por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del registro a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM historial_medico WHERE id_historial_medico = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
