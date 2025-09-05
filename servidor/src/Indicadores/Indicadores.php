<?php

namespace Micodigo\Indicador;

use PDO;
use Exception;
use Valitron\Validator;

class Indicador
{
  public $id_indicador;
  public $id_planificacion;
  public $nombre_indicador;
  public $descripcion_indicador;
  public $peso_indicador;

  public function __construct(
    $id_planificacion,
    $nombre_indicador,
    $peso_indicador,
    $descripcion_indicador = null
  ) {
    $this->id_planificacion = $id_planificacion;
    $this->nombre_indicador = $nombre_indicador;
    $this->descripcion_indicador = $descripcion_indicador;
    $this->peso_indicador = $peso_indicador;
  }

  /**
   * Valida los datos del objeto Indicador usando Valitron.
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
        ['nombre_indicador'],
        ['peso_indicador']
      ],
      'numeric' => [
        ['id_planificacion'],
        ['peso_indicador']
      ],
      'lengthMax' => [
        ['nombre_indicador', 255],
        ['descripcion_indicador', 255]
      ],
      'min' => [
        ['peso_indicador', 0]
      ],
      'max' => [
        ['peso_indicador', 100]
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea un nuevo indicador con validación previa.
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
      $sql = "INSERT INTO indicadores (id_planificacion, nombre_indicador, descripcion_indicador, peso_indicador) VALUES (?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->id_planificacion,
        $this->nombre_indicador,
        $this->descripcion_indicador,
        $this->peso_indicador
      ]);
      $this->id_indicador = $pdo->lastInsertId();
      return $this->id_indicador;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de un indicador con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_indicador)) {
      return ['id_indicador' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE indicadores SET id_planificacion=?, nombre_indicador=?, descripcion_indicador=?, peso_indicador=? WHERE id_indicador=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->id_planificacion,
        $this->nombre_indicador,
        $this->descripcion_indicador,
        $this->peso_indicador,
        $this->id_indicador
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de indicador por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID del indicador a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM indicadores WHERE id_indicador=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta los datos de un indicador por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del indicador a consultar.
   * @return object|false Un objeto Indicador con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM indicadores WHERE id_indicador = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $indicador = new self(
          $data['id_planificacion'],
          $data['nombre_indicador'],
          $data['peso_indicador'],
          $data['descripcion_indicador']
        );
        $indicador->id_indicador = $data['id_indicador'];
        return $indicador;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de un indicador por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del indicador a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM indicadores WHERE id_indicador = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
