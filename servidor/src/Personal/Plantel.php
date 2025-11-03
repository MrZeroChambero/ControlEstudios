<?php

namespace Micodigo\Personal;

use PDO;
use Exception;
use Valitron\Validator;

class Plantel
{
  public $id_plantel;
  public $codigo_dependencia;
  public $cod_estado;
  public $estado;
  public $municipio;
  public $parroquia;
  public $codigo_estadistico;
  public $nombre;
  public $nivel;
  public $modalidad;
  public $ubicacion_geografica;
  public $coordenadas;

  public function __construct(array $data = [])
  {
    $this->codigo_dependencia = $data['codigo_dependencia'] ?? null;
    $this->cod_estado = $data['cod_estado'] ?? null;
    $this->estado = $data['estado'] ?? null;
    $this->municipio = $data['municipio'] ?? null;
    $this->parroquia = $data['parroquia'] ?? null;
    $this->codigo_estadistico = $data['codigo_estadistico'] ?? null;
    $this->nombre = $data['nombre'] ?? null;
    $this->nivel = $data['nivel'] ?? null;
    $this->modalidad = $data['modalidad'] ?? null;
    $this->ubicacion_geografica = $data['ubicacion_geografica'] ?? null;
    $this->coordenadas = $data['coordenadas'] ?? null;
  }

  private function _validarDatos(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data, [], 'es');

    $v->rules([
      'required' => [
        ['codigo_dependencia'],
        ['cod_estado'],
        ['estado'],
        ['municipio'],
        ['parroquia'],
        ['nombre']
      ],
      'lengthMax' => [
        ['cod_estado', 10],
        ['estado', 50],
        ['municipio', 50],
        ['parroquia', 50],
        ['codigo_estadistico', 20],
        ['nombre', 255],
        ['nivel', 50],
        ['modalidad', 50],
        ['ubicacion_geografica', 255],
        ['coordenadas', 255]
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  public function crear(PDO $pdo)
  {
    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "INSERT INTO planteles (codigo_dependencia, cod_estado, estado, municipio, parroquia, codigo_estadistico, nombre, nivel, modalidad, ubicacion_geografica, coordenadas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->codigo_dependencia,
        $this->cod_estado,
        $this->estado,
        $this->municipio,
        $this->parroquia,
        $this->codigo_estadistico,
        $this->nombre,
        $this->nivel,
        $this->modalidad,
        $this->ubicacion_geografica,
        $this->coordenadas
      ]);
      $this->id_plantel = $pdo->lastInsertId();
      return $this->id_plantel;
    } catch (Exception $e) {
      return false;
    }
  }

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
      $sql = "UPDATE planteles SET codigo_dependencia=?, cod_estado=?, estado=?, municipio=?, parroquia=?, codigo_estadistico=?, nombre=?, nivel=?, modalidad=?, ubicacion_geografica=?, coordenadas=? WHERE id_plantel=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->codigo_dependencia,
        $this->cod_estado,
        $this->estado,
        $this->municipio,
        $this->parroquia,
        $this->codigo_estadistico,
        $this->nombre,
        $this->nivel,
        $this->modalidad,
        $this->ubicacion_geografica,
        $this->coordenadas,
        $this->id_plantel
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

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

  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM planteles WHERE id_plantel = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      return false;
    }
  }

  public static function consultarTodos(PDO $pdo)
  {
    try {
      $sql = "SELECT * FROM planteles";
      $stmt = $pdo->query($sql);
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      return [];
    }
  }

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
