<?php

namespace Micodigo\Seccion;

use PDO;
use Exception;
use Valitron\Validator;

class Seccion
{
  public $id_seccion;
  public $nombre_seccion;
  public $grado_seccion;

  public function __construct(
    $nombre_seccion,
    $grado_seccion
  ) {
    $this->nombre_seccion = $nombre_seccion;
    $this->grado_seccion = $grado_seccion;
  }

  /**
   * Valida los datos del objeto Seccion usando Valitron.
   * @param array $data Los datos a validar.
   * @return array|bool Un array con errores o verdadero si la validación es exitosa.
   */
  private function _validarDatos(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data, [], 'es');

    $v->rules([
      'required' => [
        ['nombre_seccion'],
        ['grado_seccion']
      ],
      'lengthMax' => [
        ['nombre_seccion', 10],
        ['grado_seccion', 50]
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea una nueva sección con validación previa.
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
      $sql = "INSERT INTO secciones (nombre_seccion, grado_seccion) VALUES (?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->nombre_seccion,
        $this->grado_seccion
      ]);
      $this->id_seccion = $pdo->lastInsertId();
      return $this->id_seccion;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de una sección con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_seccion)) {
      return ['id_seccion' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE secciones SET nombre_seccion=?, grado_seccion=? WHERE id_seccion=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->nombre_seccion,
        $this->grado_seccion,
        $this->id_seccion
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de sección por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID de la sección a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM secciones WHERE id_seccion=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta los datos de una sección por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID de la sección a consultar.
   * @return object|false Un objeto Seccion con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM secciones WHERE id_seccion = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $seccion = new self(
          $data['nombre_seccion'],
          $data['grado_seccion']
        );
        $seccion->id_seccion = $data['id_seccion'];
        return $seccion;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de una sección por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID de la sección a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM secciones WHERE id_seccion = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}