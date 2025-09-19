<?php

namespace Micodigo\MedicionFisica;

use PDO;
use Exception;
use Valitron\Validator;

class MedicionFisica
{
  public $id_medicion_fisica;
  public $id_persona;
  public $fecha_medicion;
  public $id_anio_escolar;
  public $momento_medicion;
  public $peso;
  public $estatura;
  public $talla_zapatos;
  public $talla_pantalon;
  public $talla_camisa;
  public $observaciones_medicion;

  public function __construct(
    $id_persona,
    $fecha_medicion,
    $id_anio_escolar,
    $momento_medicion,
    $peso,
    $estatura,
    $talla_zapatos = null,
    $talla_pantalon = null,
    $talla_camisa = null,
    $observaciones_medicion = null
  ) {
    $this->id_persona = $id_persona;
    $this->fecha_medicion = $fecha_medicion;
    $this->id_anio_escolar = $id_anio_escolar;
    $this->momento_medicion = $momento_medicion;
    $this->peso = $peso;
    $this->estatura = $estatura;
    $this->talla_zapatos = $talla_zapatos;
    $this->talla_pantalon = $talla_pantalon;
    $this->talla_camisa = $talla_camisa;
    $this->observaciones_medicion = $observaciones_medicion;
  }

  /**
   * Valida los datos del objeto MedicionFisica usando Valitron.
   * @param array $data Los datos a validar.
   * @return array|bool Un array con errores o verdadero si la validación es exitosa.
   */
  private function _validarDatos(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data, [], 'es');

    $v->rules([
      'required' => [
        ['id_persona'],
        ['fecha_medicion'],
        ['id_anio_escolar'],
        ['momento_medicion'],
        ['peso'],
        ['estatura']
      ],
      'numeric' => [
        ['id_persona'],
        ['id_anio_escolar'],
        ['peso'],
        ['estatura']
      ],
      'date' => [
        ['fecha_medicion']
      ],
      'lengthMax' => [
        ['momento_medicion', 50],
        ['talla_zapatos', 10],
        ['talla_pantalon', 10],
        ['talla_camisa', 10]
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea un nuevo registro de medición física con validación previa.
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
      $sql = "INSERT INTO mediciones_fisicas (id_persona, fecha_medicion, id_anio_escolar, momento_medicion, peso, estatura, talla_zapatos, talla_pantalon, talla_camisa, observaciones_medicion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->id_persona,
        $this->fecha_medicion,
        $this->id_anio_escolar,
        $this->momento_medicion,
        $this->peso,
        $this->estatura,
        $this->talla_zapatos,
        $this->talla_pantalon,
        $this->talla_camisa,
        $this->observaciones_medicion
      ]);
      $this->id_medicion_fisica = $pdo->lastInsertId();
      return $this->id_medicion_fisica;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de una medición física con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_medicion_fisica)) {
      return ['id_medicion_fisica' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE mediciones_fisicas SET id_persona=?, fecha_medicion=?, id_anio_escolar=?, momento_medicion=?, peso=?, estatura=?, talla_zapatos=?, talla_pantalon=?, talla_camisa=?, observaciones_medicion=? WHERE id_medicion_fisica=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->id_persona,
        $this->fecha_medicion,
        $this->id_anio_escolar,
        $this->momento_medicion,
        $this->peso,
        $this->estatura,
        $this->talla_zapatos,
        $this->talla_pantalon,
        $this->talla_camisa,
        $this->observaciones_medicion,
        $this->id_medicion_fisica
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de medición física por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID de la medición a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM mediciones_fisicas WHERE id_medicion_fisica=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta los datos de una medición física por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID de la medición a consultar.
   * @return object|false Un objeto MedicionFisica con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM mediciones_fisicas WHERE id_medicion_fisica = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $medicion = new self(
          $data['id_persona'],
          $data['fecha_medicion'],
          $data['id_anio_escolar'],
          $data['momento_medicion'],
          $data['peso'],
          $data['estatura'],
          $data['talla_zapatos'],
          $data['talla_pantalon'],
          $data['talla_camisa'],
          $data['observaciones_medicion']
        );
        $medicion->id_medicion_fisica = $data['id_medicion_fisica'];
        return $medicion;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de un registro de medición física por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del registro a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM mediciones_fisicas WHERE id_medicion_fisica = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
