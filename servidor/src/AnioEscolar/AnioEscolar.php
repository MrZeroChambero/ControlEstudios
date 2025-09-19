<?php

namespace Micodigo\AnioEscolar;

use PDO;
use Exception;
use Valitron\Validator;

class AnioEscolar
{
  public $id_anio_escolar;
  public $nombre_anio;
  public $fecha_inicio;
  public $fecha_fin;
  public $activo;

  public function __construct(
    $nombre_anio,
    $fecha_inicio,
    $fecha_fin,
    $activo = 1
  ) {
    $this->nombre_anio = $nombre_anio;
    $this->fecha_inicio = $fecha_inicio;
    $this->fecha_fin = $fecha_fin;
    $this->activo = $activo;
  }

  /**
   * Valida los datos del objeto AnioEscolar usando Valitron.
   * @param array $data Los datos a validar.
   * @return array|bool Un array con errores o verdadero si la validación es exitosa.
   */
  private function _validarDatos(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data, [], 'es');

    $v->rules([
      'required' => [
        ['nombre_anio'],
        ['fecha_inicio'],
        ['fecha_fin'],
        ['activo']
      ],
      'lengthMax' => [
        ['nombre_anio', 50]
      ],
      'date' => [
        ['fecha_inicio'],
        ['fecha_fin']
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
   * Crea un nuevo año escolar con validación previa.
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
      $sql = "INSERT INTO anios_escolares (nombre_anio, fecha_inicio, fecha_fin, activo) VALUES (?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->nombre_anio,
        $this->fecha_inicio,
        $this->fecha_fin,
        $this->activo
      ]);
      $this->id_anio_escolar = $pdo->lastInsertId();
      return $this->id_anio_escolar;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de un año escolar con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_anio_escolar)) {
      return ['id_anio_escolar' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE anios_escolares SET nombre_anio=?, fecha_inicio=?, fecha_fin=?, activo=? WHERE id_anio_escolar=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->nombre_anio,
        $this->fecha_inicio,
        $this->fecha_fin,
        $this->activo,
        $this->id_anio_escolar
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de año escolar por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID del año escolar a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM anios_escolares WHERE id_anio_escolar=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta los datos de un año escolar por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del año escolar a consultar.
   * @return object|false Un objeto AnioEscolar con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM anios_escolares WHERE id_anio_escolar = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $anioEscolar = new self(
          $data['nombre_anio'],
          $data['fecha_inicio'],
          $data['fecha_fin'],
          $data['activo']
        );
        $anioEscolar->id_anio_escolar = $data['id_anio_escolar'];
        return $anioEscolar;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de un año escolar por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del año escolar a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM anios_escolares WHERE id_anio_escolar = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}