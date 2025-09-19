<?php

namespace Micodigo\Temas;

use PDO;
use Exception;
use Valitron\Validator;

class Temas
{
  public $id_tema;
  public $id_planificacion;
  public $nombre_tema;
  public $descripcion;

  public function __construct(
    $id_planificacion,
    $nombre_tema,
    $descripcion = null
  ) {
    $this->id_planificacion = $id_planificacion;
    $this->nombre_tema = $nombre_tema;
    $this->descripcion = $descripcion;
  }

  /**
   * Valida los datos del objeto Temas usando Valitron.
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
        ['nombre_tema']
      ],
      'numeric' => [
        ['id_planificacion']
      ],
      'lengthMax' => [
        ['nombre_tema', 255]
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea un nuevo registro de tema con validación previa.
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
      $sql = "INSERT INTO temas (id_planificacion, nombre_tema, descripcion) VALUES (?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->id_planificacion,
        $this->nombre_tema,
        $this->descripcion
      ]);
      $this->id_tema = $pdo->lastInsertId();
      return $this->id_tema;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de un registro de tema con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_tema)) {
      return ['id_tema' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE temas SET id_planificacion=?, nombre_tema=?, descripcion=? WHERE id_tema=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->id_planificacion,
        $this->nombre_tema,
        $this->descripcion,
        $this->id_tema
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de tema por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID del registro a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM temas WHERE id_tema=?";
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
   * @return object|false Un objeto Temas con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM temas WHERE id_tema = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $tema = new self(
          $data['id_planificacion'],
          $data['nombre_tema'],
          $data['descripcion']
        );
        $tema->id_tema = $data['id_tema'];
        return $tema;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de un registro de tema por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del registro a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM temas WHERE id_tema = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
