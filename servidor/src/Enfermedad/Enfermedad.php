<?php

namespace Micodigo\Enfermedad;

use PDO;
use Exception;
use Valitron\Validator;

class Enfermedad
{
  public $id_enfermedad;
  public $id_estudiante;
  public $nombre_enfermedad;

  public function __construct(
    $id_estudiante,
    $nombre_enfermedad
  ) {
    $this->id_estudiante = $id_estudiante;
    $this->nombre_enfermedad = $nombre_enfermedad;
  }

  /**
   * Valida los datos del objeto Enfermedad usando Valitron.
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
        ['nombre_enfermedad']
      ],
      'numeric' => [
        ['id_estudiante']
      ],
      'lengthMax' => [
        ['nombre_enfermedad', 255]
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea un nuevo registro de enfermedad con validación previa.
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
      $sql = "INSERT INTO enfermedades (id_estudiante, nombre_enfermedad) VALUES (?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->id_estudiante,
        $this->nombre_enfermedad
      ]);
      $this->id_enfermedad = $pdo->lastInsertId();
      return $this->id_enfermedad;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de una enfermedad con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_enfermedad)) {
      return ['id_enfermedad' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE enfermedades SET id_estudiante=?, nombre_enfermedad=? WHERE id_enfermedad=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->id_estudiante,
        $this->nombre_enfermedad,
        $this->id_enfermedad
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de enfermedad por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID de la enfermedad a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM enfermedades WHERE id_enfermedad=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta los datos de una enfermedad por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID de la enfermedad a consultar.
   * @return object|false Un objeto Enfermedad con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM enfermedades WHERE id_enfermedad = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $enfermedad = new self(
          $data['id_estudiante'],
          $data['nombre_enfermedad']
        );
        $enfermedad->id_enfermedad = $data['id_enfermedad'];
        return $enfermedad;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de un registro de enfermedad por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del registro a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM enfermedades WHERE id_enfermedad = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
