<?php

namespace Micodigo\Personal;

use PDO;
use Exception;
use Valitron\Validator;

class PersonalPlantelExterno
{
  public $id_personal_plantel_externo;
  public $id_personal;
  public $id_plantel;
  public $turno_atiende_plantel;

  public function __construct(
    $id_personal,
    $id_plantel,
    $turno_atiende_plantel = null
  ) {
    $this->id_personal = $id_personal;
    $this->id_plantel = $id_plantel;
    $this->turno_atiende_plantel = $turno_atiende_plantel;
  }

  /**
   * Valida los datos del objeto PersonalPlantelExterno usando Valitron.
   * @param array $data Los datos a validar.
   * @return array|bool Un array con errores o verdadero si la validación es exitosa.
   */
  private function _validarDatos(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data, [], 'es');

    $v->rules([
      'required' => [
        ['id_personal'],
        ['id_plantel']
      ],
      'numeric' => [
        ['id_personal'],
        ['id_plantel']
      ],
      'lengthMax' => [
        ['turno_atiende_plantel', 50]
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea un nuevo registro de personal de plantel externo con validación previa.
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
      $sql = "INSERT INTO personal_plantel_externo (id_personal, id_plantel, turno_atiende_plantel) VALUES (?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->id_personal,
        $this->id_plantel,
        $this->turno_atiende_plantel
      ]);
      $this->id_personal_plantel_externo = $pdo->lastInsertId();
      return $this->id_personal_plantel_externo;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de un registro de personal de plantel externo con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_personal_plantel_externo)) {
      return ['id_personal_plantel_externo' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE personal_plantel_externo SET id_personal=?, id_plantel=?, turno_atiende_plantel=? WHERE id_personal_plantel_externo=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->id_personal,
        $this->id_plantel,
        $this->turno_atiende_plantel,
        $this->id_personal_plantel_externo
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de personal de plantel externo por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID del registro a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM personal_plantel_externo WHERE id_personal_plantel_externo=?";
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
   * @return object|false Un objeto PersonalPlantelExterno con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM personal_plantel_externo WHERE id_personal_plantel_externo = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $personal = new self(
          $data['id_personal'],
          $data['id_plantel'],
          $data['turno_atiende_plantel']
        );
        $personal->id_personal_plantel_externo = $data['id_personal_plantel_externo'];
        return $personal;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de un registro de personal de plantel externo por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del registro a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM personal_plantel_externo WHERE id_personal_plantel_externo = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
