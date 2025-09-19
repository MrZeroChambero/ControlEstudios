<?php

namespace Micodigo\Grado;

use PDO;
use Exception;
use Valitron\Validator;

class Grado
{
  public $id_grado;
  public $nombre_grado;
  public $activo;

  public function __construct(
    $nombre_grado,
    $activo = 1
  ) {
    $this->nombre_grado = $nombre_grado;
    $this->activo = $activo;
  }

  /**
   * Valida los datos del objeto Grado usando Valitron.
   * @param array $data Los datos a validar.
   * @return array|bool Un array con errores o verdadero si la validación es exitosa.
   */
  private function _validarDatos(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data, [], 'es');

    $v->rules([
      'required' => [
        ['nombre_grado'],
        ['activo']
      ],
      'lengthMax' => [
        ['nombre_grado', 50]
      ],
      'integer' => [
        ['activo']
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea un nuevo grado con validación previa.
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
      $sql = "INSERT INTO grados (nombre_grado, activo) VALUES (?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->nombre_grado,
        $this->activo
      ]);
      $this->id_grado = $pdo->lastInsertId();
      return $this->id_grado;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de un grado con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_grado)) {
      return ['id_grado' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE grados SET nombre_grado=?, activo=? WHERE id_grado=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->nombre_grado,
        $this->activo,
        $this->id_grado
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de grado por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID del grado a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM grados WHERE id_grado=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta los datos de un grado por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del grado a consultar.
   * @return object|false Un objeto Grado con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM grados WHERE id_grado = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $grado = new self(
          $data['nombre_grado'],
          $data['activo']
        );
        $grado->id_grado = $data['id_grado'];
        return $grado;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de un grado por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del grado a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM grados WHERE id_grado = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
