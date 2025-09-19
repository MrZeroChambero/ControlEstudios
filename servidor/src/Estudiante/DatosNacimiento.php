<?php

namespace Micodigo\Estudiante;

use PDO;
use Exception;
use Valitron\Validator;

class DatosNacimientoEstudiante
{
  public $id_datos_nacimiento_estudiante;
  public $id_estudiante;
  public $lugar_nacimiento;
  public $nombre_municipio_nacimiento;
  public $nombre_estado_nacimiento;
  public $nombre_parroquia_nacimiento;
  public $numero_partida_nacimiento;

  public function __construct(
    $id_estudiante,
    $lugar_nacimiento,
    $nombre_municipio_nacimiento,
    $nombre_estado_nacimiento,
    $nombre_parroquia_nacimiento,
    $numero_partida_nacimiento
  ) {
    $this->id_estudiante = $id_estudiante;
    $this->lugar_nacimiento = $lugar_nacimiento;
    $this->nombre_municipio_nacimiento = $nombre_municipio_nacimiento;
    $this->nombre_estado_nacimiento = $nombre_estado_nacimiento;
    $this->nombre_parroquia_nacimiento = $nombre_parroquia_nacimiento;
    $this->numero_partida_nacimiento = $numero_partida_nacimiento;
  }

  /**
   * Valida los datos del objeto DatosNacimientoEstudiante usando Valitron.
   * @param array $data Los datos a validar.
   * @return array|bool Un array con errores o verdadero si la validación es exitosa.
   */
  private function _validarDatos(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data, [], 'es');

    $v->rules([
      'required' => [
        ['id_estudiante'],
        ['lugar_nacimiento'],
        ['nombre_municipio_nacimiento'],
        ['nombre_estado_nacimiento'],
        ['nombre_parroquia_nacimiento'],
        ['numero_partida_nacimiento']
      ],
      'numeric' => [
        ['id_estudiante']
      ],
      'lengthMax' => [
        ['lugar_nacimiento', 100],
        ['nombre_municipio_nacimiento', 100],
        ['nombre_estado_nacimiento', 100],
        ['nombre_parroquia_nacimiento', 100],
        ['numero_partida_nacimiento', 50]
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea un nuevo registro de datos de nacimiento de estudiante con validación previa.
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
      $sql = "INSERT INTO datos_nacimiento_estudiante (id_estudiante, lugar_nacimiento, nombre_municipio_nacimiento, nombre_estado_nacimiento, nombre_parroquia_nacimiento, numero_partida_nacimiento) VALUES (?, ?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->id_estudiante,
        $this->lugar_nacimiento,
        $this->nombre_municipio_nacimiento,
        $this->nombre_estado_nacimiento,
        $this->nombre_parroquia_nacimiento,
        $this->numero_partida_nacimiento
      ]);
      $this->id_datos_nacimiento_estudiante = $pdo->lastInsertId();
      return $this->id_datos_nacimiento_estudiante;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de nacimiento de un estudiante con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_datos_nacimiento_estudiante)) {
      return ['id_datos_nacimiento_estudiante' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE datos_nacimiento_estudiante SET id_estudiante=?, lugar_nacimiento=?, nombre_municipio_nacimiento=?, nombre_estado_nacimiento=?, nombre_parroquia_nacimiento=?, numero_partida_nacimiento=? WHERE id_datos_nacimiento_estudiante=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->id_estudiante,
        $this->lugar_nacimiento,
        $this->nombre_municipio_nacimiento,
        $this->nombre_estado_nacimiento,
        $this->nombre_parroquia_nacimiento,
        $this->numero_partida_nacimiento,
        $this->id_datos_nacimiento_estudiante
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de datos de nacimiento por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID del registro a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM datos_nacimiento_estudiante WHERE id_datos_nacimiento_estudiante=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta los datos de nacimiento de un estudiante por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del registro a consultar.
   * @return object|false Un objeto DatosNacimientoEstudiante con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM datos_nacimiento_estudiante WHERE id_datos_nacimiento_estudiante = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $datosNacimiento = new self(
          $data['id_estudiante'],
          $data['lugar_nacimiento'],
          $data['nombre_municipio_nacimiento'],
          $data['nombre_estado_nacimiento'],
          $data['nombre_parroquia_nacimiento'],
          $data['numero_partida_nacimiento']
        );
        $datosNacimiento->id_datos_nacimiento_estudiante = $data['id_datos_nacimiento_estudiante'];
        return $datosNacimiento;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de un registro de datos de nacimiento por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del registro a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM datos_nacimiento_estudiante WHERE id_datos_nacimiento_estudiante = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
