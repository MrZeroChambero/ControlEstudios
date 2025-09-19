<?php

namespace Micodigo\Competencia;

use PDO;
use Exception;
use Valitron\Validator;

class Competencia
{
  public $id_competencia;
  public $id_planificacion;
  public $nombre_competencia;

  public function __construct(
    $id_planificacion,
    $nombre_competencia
  ) {
    $this->id_planificacion = $id_planificacion;
    $this->nombre_competencia = $nombre_competencia;
  }

  /**
   * Valida los datos del objeto Competencia usando Valitron.
   * @param array $data Los datos a validar.
   * @return array|bool Un array con errores o verdadero si la validación es exitosa.
   */
  private function _validarDatos(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data, [], 'es');

    $v->rules([
      'required' => [
        ['id_planificacion'],
        ['nombre_competencia']
      ],
      'numeric' => [
        ['id_planificacion']
      ],
      'lengthMax' => [
        ['nombre_competencia', 255]
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea una nueva competencia con validación previa.
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
      $sql = "INSERT INTO competencias (id_planificacion, nombre_competencia) VALUES (?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->id_planificacion,
        $this->nombre_competencia
      ]);
      $this->id_competencia = $pdo->lastInsertId();
      return $this->id_competencia;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de una competencia con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_competencia)) {
      return ['id_competencia' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE competencias SET id_planificacion=?, nombre_competencia=? WHERE id_competencia=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->id_planificacion,
        $this->nombre_competencia,
        $this->id_competencia
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de competencia por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID de la competencia a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM competencias WHERE id_competencia=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta los datos de una competencia por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID de la competencia a consultar.
   * @return object|false Un objeto Competencia con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM competencias WHERE id_competencia = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $competencia = new self(
          $data['id_planificacion'],
          $data['nombre_competencia']
        );
        $competencia->id_competencia = $data['id_competencia'];
        return $competencia;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de una competencia por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID de la competencia a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM competencias WHERE id_competencia = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}