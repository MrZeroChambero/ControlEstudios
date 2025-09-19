<?php

namespace Micodigo\MetodoEvaluacion;

use PDO;
use Exception;
use Valitron\Validator;

class MetodoEvaluacion
{
  public $id_metodo_evaluacion;
  public $nombre_metodo;

  public function __construct(
    $nombre_metodo
  ) {
    $this->nombre_metodo = $nombre_metodo;
  }

  /**
   * Valida los datos del objeto MetodoEvaluacion usando Valitron.
   * @param array $data Los datos a validar.
   * @return array|bool Un array con errores o verdadero si la validación es exitosa.
   */
  private function _validarDatos(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data, [], 'es');

    $v->rules([
      'required' => [
        ['nombre_metodo']
      ],
      'lengthMax' => [
        ['nombre_metodo', 100]
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea un nuevo método de evaluación con validación previa.
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
      $sql = "INSERT INTO metodos_evaluacion (nombre_metodo) VALUES (?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->nombre_metodo
      ]);
      $this->id_metodo_evaluacion = $pdo->lastInsertId();
      return $this->id_metodo_evaluacion;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de un método de evaluación con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_metodo_evaluacion)) {
      return ['id_metodo_evaluacion' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE metodos_evaluacion SET nombre_metodo=? WHERE id_metodo_evaluacion=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->nombre_metodo,
        $this->id_metodo_evaluacion
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de método de evaluación por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID del método de evaluación a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM metodos_evaluacion WHERE id_metodo_evaluacion=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta los datos de un método de evaluación por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del método de evaluación a consultar.
   * @return object|false Un objeto MetodoEvaluacion con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM metodos_evaluacion WHERE id_metodo_evaluacion = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $metodo = new self(
          $data['nombre_metodo']
        );
        $metodo->id_metodo_evaluacion = $data['id_metodo_evaluacion'];
        return $metodo;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de un método de evaluación por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del método de evaluación a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM metodos_evaluacion WHERE id_metodo_evaluacion = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
