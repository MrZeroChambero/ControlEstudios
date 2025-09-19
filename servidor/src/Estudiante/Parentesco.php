<?php

namespace Micodigo\Parentesco;

use PDO;
use Exception;
use Valitron\Validator;

class Parentesco
{
  public $id_parentesco;
  public $id_representante;
  public $id_estudiante;
  public $tipo_parentesco;
  public $es_representante_principal;

  public function __construct(
    $id_representante,
    $id_estudiante,
    $tipo_parentesco,
    $es_representante_principal
  ) {
    $this->id_representante = $id_representante;
    $this->id_estudiante = $id_estudiante;
    $this->tipo_parentesco = $tipo_parentesco;
    $this->es_representante_principal = $es_representante_principal;
  }

  /**
   * Valida los datos del objeto Parentesco usando Valitron.
   * @param array $data Los datos a validar.
   * @return array|bool Un array con errores o verdadero si la validación es exitosa.
   */
  private function _validarDatos(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data, [], 'es');

    $v->rules([
      'required' => [
        ['id_representante'],
        ['id_estudiante'],
        ['tipo_parentesco'],
        ['es_representante_principal']
      ],
      'numeric' => [
        ['id_representante'],
        ['id_estudiante'],
        ['es_representante_principal']
      ],
      'lengthMax' => [
        ['tipo_parentesco', 50]
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea un nuevo registro de parentesco con validación previa.
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
      $sql = "INSERT INTO parentesco (id_representante, id_estudiante, tipo_parentesco, es_representante_principal) VALUES (?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->id_representante,
        $this->id_estudiante,
        $this->tipo_parentesco,
        $this->es_representante_principal
      ]);
      $this->id_parentesco = $pdo->lastInsertId();
      return $this->id_parentesco;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de un parentesco con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_parentesco)) {
      return ['id_parentesco' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE parentesco SET id_representante=?, id_estudiante=?, tipo_parentesco=?, es_representante_principal=? WHERE id_parentesco=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->id_representante,
        $this->id_estudiante,
        $this->tipo_parentesco,
        $this->es_representante_principal,
        $this->id_parentesco
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de parentesco por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID del parentesco a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM parentesco WHERE id_parentesco=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta los datos de un parentesco por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del parentesco a consultar.
   * @return object|false Un objeto Parentesco con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM parentesco WHERE id_parentesco = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $parentesco = new self(
          $data['id_representante'],
          $data['id_estudiante'],
          $data['tipo_parentesco'],
          $data['es_representante_principal']
        );
        $parentesco->id_parentesco = $data['id_parentesco'];
        return $parentesco;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de un registro de parentesco por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del parentesco a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM parentesco WHERE id_parentesco = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
