<?php

namespace Micodigo\AreaAprendizaje;

use PDO;
use Exception;
use Valitron\Validator;

class AreaAprendizaje
{
  public $id_area_aprendizaje;
  public $nombre_area;

  public function __construct(
    $nombre_area
  ) {
    $this->nombre_area = $nombre_area;
  }

  /**
   * Valida los datos del objeto AreaAprendizaje usando Valitron.
   * @param array $data Los datos a validar.
   * @return array|bool Un array con errores o verdadero si la validación es exitosa.
   */
  private function _validarDatos(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data, [], 'es');

    $v->rules([
      'required' => [
        ['nombre_area']
      ],
      'lengthMax' => [
        ['nombre_area', 255]
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea una nueva área de aprendizaje con validación previa.
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
      $sql = "INSERT INTO areas_aprendizaje (nombre_area) VALUES (?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->nombre_area
      ]);
      $this->id_area_aprendizaje = $pdo->lastInsertId();
      return $this->id_area_aprendizaje;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de un área de aprendizaje con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_area_aprendizaje)) {
      return ['id_area_aprendizaje' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE areas_aprendizaje SET nombre_area=? WHERE id_area_aprendizaje=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->nombre_area,
        $this->id_area_aprendizaje
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de área de aprendizaje por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID del área de aprendizaje a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM areas_aprendizaje WHERE id_area_aprendizaje=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta los datos de un área de aprendizaje por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del área de aprendizaje a consultar.
   * @return object|false Un objeto AreaAprendizaje con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM areas_aprendizaje WHERE id_area_aprendizaje = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $areaAprendizaje = new self(
          $data['nombre_area']
        );
        $areaAprendizaje->id_area_aprendizaje = $data['id_area_aprendizaje'];
        return $areaAprendizaje;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de un área de aprendizaje por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del área de aprendizaje a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM areas_aprendizaje WHERE id_area_aprendizaje = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
