<?php

namespace Micodigo\Representante;

use PDO;
use Exception;
use Valitron\Validator;
use Micodigo\Persona\Persona;

class Representante
{
  public $id_representante;
  public $id_persona;
  public $vive_con_estudiante;
  public $parentesco;
  public $nivel_educativo;
  public $lugar_trabajo;
  public $vive_en_la_misma_casa;

  public function __construct(
    $id_persona,
    $parentesco,
    $vive_con_estudiante = null,
    $nivel_educativo = null,
    $lugar_trabajo = null,
    $vive_en_la_misma_casa = null
  ) {
    $this->id_persona = $id_persona;
    $this->vive_con_estudiante = $vive_con_estudiante;
    $this->parentesco = $parentesco;
    $this->nivel_educativo = $nivel_educativo;
    $this->lugar_trabajo = $lugar_trabajo;
    $this->vive_en_la_misma_casa = $vive_en_la_misma_casa;
  }

  /**
   * Valida los datos del objeto Representante usando Valitron.
   * @param array $data Los datos a validar.
   * @return array|bool Un array con errores o verdadero si la validación es exitosa.
   */
  private function _validarDatos(array $data)
  {
    // Carga los mensajes de validación personalizados
    Validator::lang('es');

    // Instancia el validador
    $v = new Validator($data, [], 'es');

    // Define las reglas de validación
    $v->rules([
      'required' => [
        ['id_persona'],
        ['parentesco']
      ],
      'numeric' => [
        ['id_persona']
      ],
      'lengthMax' => [
        ['parentesco', 50],
        ['nivel_educativo', 100],
        ['lugar_trabajo', 255]
      ],
      'boolean' => [
        ['vive_con_estudiante'],
        ['vive_en_la_misma_casa']
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea un nuevo representante con validación previa.
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
      $sql = "INSERT INTO representantes (id_persona, vive_con_estudiante, parentesco, nivel_educativo, lugar_trabajo, vive_en_la_misma_casa) VALUES (?, ?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->id_persona,
        $this->vive_con_estudiante,
        $this->parentesco,
        $this->nivel_educativo,
        $this->lugar_trabajo,
        $this->vive_en_la_misma_casa
      ]);
      $this->id_representante = $pdo->lastInsertId();
      return $this->id_representante;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de un representante con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_representante)) {
      return ['id_representante' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE representantes SET id_persona=?, vive_con_estudiante=?, parentesco=?, nivel_educativo=?, lugar_trabajo=?, vive_en_la_misma_casa=? WHERE id_representante=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->id_persona,
        $this->vive_con_estudiante,
        $this->parentesco,
        $this->nivel_educativo,
        $this->lugar_trabajo,
        $this->vive_en_la_misma_casa,
        $this->id_representante
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de representante por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID del representante a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM representantes WHERE id_representante=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta los datos de un representante por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del representante a consultar.
   * @return object|false Un objeto Representante con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM representantes WHERE id_representante = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $representante = new self(
          $data['id_persona'],
          $data['parentesco'],
          $data['vive_con_estudiante'],
          $data['nivel_educativo'],
          $data['lugar_trabajo'],
          $data['vive_en_la_misma_casa']
        );
        $representante->id_representante = $data['id_representante'];
        return $representante;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de un representante por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del representante a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM representantes WHERE id_representante = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
