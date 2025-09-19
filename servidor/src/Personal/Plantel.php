<?php

namespace Micodigo\Personal;

use PDO;
use Exception;
use Valitron\Validator;

class Plantel
{
  public $id_plantel;
  public $cod_estado;
  public $estado;
  public $municipio;
  public $parroquia;
  public $codigo_dependencia;
  public $codigo_estadistico;
  public $codigo_plantel;
  public $nombre_plantel_nomina;
  public $nivel;
  public $modalidad;
  public $ubicacion_geografica;

  public function __construct(
    $cod_estado,
    $estado,
    $municipio,
    $parroquia,
    $codigo_plantel,
    $nombre_plantel_nomina,
    $codigo_dependencia = null,
    $codigo_estadistico = null,
    $nivel = null,
    $modalidad = null,
    $ubicacion_geografica = null
  ) {
    $this->cod_estado = $cod_estado;
    $this->estado = $estado;
    $this->municipio = $municipio;
    $this->parroquia = $parroquia;
    $this->codigo_dependencia = $codigo_dependencia;
    $this->codigo_estadistico = $codigo_estadistico;
    $this->codigo_plantel = $codigo_plantel;
    $this->nombre_plantel_nomina = $nombre_plantel_nomina;
    $this->nivel = $nivel;
    $this->modalidad = $modalidad;
    $this->ubicacion_geografica = $ubicacion_geografica;
  }

  /**
   * Valida los datos del objeto Plantel usando Valitron.
   * @param array $data Los datos a validar.
   * @return array|bool Un array con errores o verdadero si la validación es exitosa.
   */
  private function _validarDatos(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data, [], 'es');

    $v->rules([
      'required' => [
        ['cod_estado'],
        ['estado'],
        ['municipio'],
        ['parroquia'],
        ['codigo_plantel'],
        ['nombre_plantel_nomina']
      ],
      'lengthMax' => [
        ['cod_estado', 10],
        ['estado', 50],
        ['municipio', 50],
        ['parroquia', 50],
        ['codigo_dependencia', 20],
        ['codigo_estadistico', 20],
        ['codigo_plantel', 20],
        ['nombre_plantel_nomina', 255],
        ['nivel', 50],
        ['modalidad', 50],
        ['ubicacion_geografica', 255]
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea un nuevo registro de plantel con validación previa.
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
      $sql = "INSERT INTO planteles (cod_estado, estado, municipio, parroquia, codigo_dependencia, codigo_estadistico, codigo_plantel, nombre_plantel_nomina, nivel, modalidad, ubicacion_geografica) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->cod_estado,
        $this->estado,
        $this->municipio,
        $this->parroquia,
        $this->codigo_dependencia,
        $this->codigo_estadistico,
        $this->codigo_plantel,
        $this->nombre_plantel_nomina,
        $this->nivel,
        $this->modalidad,
        $this->ubicacion_geografica
      ]);
      $this->id_plantel = $pdo->lastInsertId();
      return $this->id_plantel;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de un registro de plantel con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_plantel)) {
      return ['id_plantel' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE planteles SET cod_estado=?, estado=?, municipio=?, parroquia=?, codigo_dependencia=?, codigo_estadistico=?, codigo_plantel=?, nombre_plantel_nomina=?, nivel=?, modalidad=?, ubicacion_geografica=? WHERE id_plantel=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->cod_estado,
        $this->estado,
        $this->municipio,
        $this->parroquia,
        $this->codigo_dependencia,
        $this->codigo_estadistico,
        $this->codigo_plantel,
        $this->nombre_plantel_nomina,
        $this->nivel,
        $this->modalidad,
        $this->ubicacion_geografica,
        $this->id_plantel
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de plantel por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID del registro a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM planteles WHERE id_plantel=?";
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
   * @return object|false Un objeto Plantel con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM planteles WHERE id_plantel = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $plantel = new self(
          $data['cod_estado'],
          $data['estado'],
          $data['municipio'],
          $data['parroquia'],
          $data['codigo_plantel'],
          $data['nombre_plantel_nomina'],
          $data['codigo_dependencia'],
          $data['codigo_estadistico'],
          $data['nivel'],
          $data['modalidad'],
          $data['ubicacion_geografica']
        );
        $plantel->id_plantel = $data['id_plantel'];
        return $plantel;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de un registro de plantel por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del registro a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM planteles WHERE id_plantel = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
