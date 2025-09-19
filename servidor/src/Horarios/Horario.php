<?php

namespace Micodigo\Horario;

use PDO;
use Exception;
use Valitron\Validator;

class Horario
{
  public $id_horario;
  public $id_asignacion_gs;
  public $id_anio_escolar;
  public $dia_semana;
  public $hora_inicio;
  public $hora_fin;

  public function __construct(
    $id_asignacion_gs,
    $id_anio_escolar,
    $dia_semana,
    $hora_inicio,
    $hora_fin
  ) {
    $this->id_asignacion_gs = $id_asignacion_gs;
    $this->id_anio_escolar = $id_anio_escolar;
    $this->dia_semana = $dia_semana;
    $this->hora_inicio = $hora_inicio;
    $this->hora_fin = $hora_fin;
  }

  /**
   * Valida los datos del objeto Horario usando Valitron.
   * @param array $data Los datos a validar.
   * @return array|bool Un array con errores o verdadero si la validación es exitosa.
   */
  private function _validarDatos(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data, [], 'es');

    $v->rules([
      'required' => [
        ['id_asignacion_gs'],
        ['id_anio_escolar'],
        ['dia_semana'],
        ['hora_inicio'],
        ['hora_fin']
      ],
      'numeric' => [
        ['id_asignacion_gs'],
        ['id_anio_escolar']
      ],
      'lengthMax' => [
        ['dia_semana', 20]
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea un nuevo horario con validación previa.
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
      $sql = "INSERT INTO horarios (id_asignacion_gs, id_anio_escolar, dia_semana, hora_inicio, hora_fin) VALUES (?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->id_asignacion_gs,
        $this->id_anio_escolar,
        $this->dia_semana,
        $this->hora_inicio,
        $this->hora_fin
      ]);
      $this->id_horario = $pdo->lastInsertId();
      return $this->id_horario;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de un horario con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_horario)) {
      return ['id_horario' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE horarios SET id_asignacion_gs=?, id_anio_escolar=?, dia_semana=?, hora_inicio=?, hora_fin=? WHERE id_horario=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->id_asignacion_gs,
        $this->id_anio_escolar,
        $this->dia_semana,
        $this->hora_inicio,
        $this->hora_fin,
        $this->id_horario
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de horario por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID del horario a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM horarios WHERE id_horario=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta los datos de un horario por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del horario a consultar.
   * @return object|false Un objeto Horario con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM horarios WHERE id_horario = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $horario = new self(
          $data['id_asignacion_gs'],
          $data['id_anio_escolar'],
          $data['dia_semana'],
          $data['hora_inicio'],
          $data['hora_fin']
        );
        $horario->id_horario = $data['id_horario'];
        return $horario;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de un horario por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del horario a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM horarios WHERE id_horario = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
