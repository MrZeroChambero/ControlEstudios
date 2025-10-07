<?php

namespace Micodigo\Personal;

use PDO;
use Exception;
use Valitron\Validator;

class Personal
{
  public $id_personal;
  public $id_persona;
  public $codigo_rac;
  public $cargo;
  public $funcion;
  public $fecha_contratacion;
  public $nivel_academico;
  public $anios_servicio;
  public $horas_trabajo;
  public $situacion_trabajador;
  public $observacion;
  public $rif;
  public $estado_civil;
  public $etnia_religion;
  public $cantidad_hijas;
  public $cantidad_hijos_varones;

  public function __construct(array $data = [])
  {
    $this->id_personal = $data['id_personal'] ?? null;
    $this->id_persona = $data['id_persona'] ?? null;
    $this->codigo_rac = $data['codigo_rac'] ?? null;
    $this->cargo = $data['cargo'] ?? null;
    $this->funcion = $data['funcion'] ?? null;
    $this->fecha_contratacion = $data['fecha_contratacion'] ?? null;
    $this->nivel_academico = $data['nivel_academico'] ?? null;
    $this->anios_servicio = $data['anios_servicio'] ?? null;
    $this->horas_trabajo = $data['horas_trabajo'] ?? null;
    $this->situacion_trabajador = $data['situacion_trabajador'] ?? null;
    $this->observacion = $data['observacion'] ?? null;
    $this->rif = $data['rif'] ?? null;
    $this->estado_civil = $data['estado_civil'] ?? null;
    $this->etnia_religion = $data['etnia_religion'] ?? null;
    $this->cantidad_hijas = $data['cantidad_hijas'] ?? null;
    $this->cantidad_hijos_varones = $data['cantidad_hijos_varones'] ?? null;
  }

  private function _saneado(array $data): array
  {
    $map = $data;
    $ints = ['id_persona', 'anios_servicio', 'cantidad_hijas', 'cantidad_hijos_varones', 'id_personal'];
    foreach ($map as $k => $v) {
      if (is_string($v)) {
        $v = trim($v);
        if ($v === '') {
          $map[$k] = null;
          continue;
        }
      }
      if (in_array($k, $ints, true) && $map[$k] !== null) {
        if (is_numeric($map[$k])) {
          $map[$k] = (int)$map[$k];
        }
      }
      // normalizar hora (acepta HH:MM o HH:MM:SS)
      if ($k === 'horas_trabajo' && $map[$k] !== null) {
        $map[$k] = preg_match('/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/', $map[$k]) ? $map[$k] : null;
      }
    }
    return $map;
  }

  private function _validarDatos(array $data)
  {
    Validator::lang('es');
    $data = $this->_saneado($data);
    $v = new Validator($data, [], 'es');

    // campos requeridos según la tabla
    $v->rule('required', ['id_persona', 'cargo', 'funcion', 'fecha_contratacion']);

    // enteros condicionales
    $intFields = ['id_persona', 'anios_servicio', 'cantidad_hijas', 'cantidad_hijos_varones'];
    foreach ($intFields as $f) {
      if (isset($data[$f]) && $data[$f] !== null && $data[$f] !== '') {
        $v->rule('integer', $f);
        $v->rule('min', $f, 0);
      }
    }

    // fecha
    $v->rule('date', 'fecha_contratacion');

    // hora (regex)
    if (isset($data['horas_trabajo']) && $data['horas_trabajo'] !== null) {
      $v->rule('regex', 'horas_trabajo', '/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/');
    }

    // longitudes máximas
    $v->rule('lengthMax', 'codigo_rac', 50);
    $v->rule('lengthMax', 'nivel_academico', 100);
    $v->rule('lengthMax', 'situacion_trabajador', 100);
    $v->rule('lengthMax', 'rif', 20);
    $v->rule('lengthMax', 'estado_civil', 50);
    $v->rule('lengthMax', 'etnia_religion', 100);

    if ($v->validate()) {
      return true;
    }
    return $v->errors();
  }

  public function crear(PDO $pdo)
  {
    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) return $errores;

    try {
      $sql = "INSERT INTO personal (id_persona, codigo_rac, cargo, funcion, fecha_contratacion, nivel_academico, anios_servicio, horas_trabajo, situacion_trabajador, observacion, rif, estado_civil, etnia_religion, cantidad_hijas, cantidad_hijos_varones)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->id_persona,
        $this->codigo_rac,
        $this->cargo,
        $this->funcion,
        $this->fecha_contratacion,
        $this->nivel_academico,
        $this->anios_servicio,
        $this->horas_trabajo,
        $this->situacion_trabajador,
        $this->observacion,
        $this->rif,
        $this->estado_civil,
        $this->etnia_religion,
        $this->cantidad_hijas,
        $this->cantidad_hijos_varones
      ]);
      $this->id_personal = (int)$pdo->lastInsertId();
      return $this->id_personal;
    } catch (Exception $e) {
      return false;
    }
  }

  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_personal)) {
      return ['id_personal' => ['El ID es requerido para la actualización.']];
    }
    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) return $errores;

    try {
      $sql = "UPDATE personal SET id_persona=?, codigo_rac=?, cargo=?, funcion=?, fecha_contratacion=?, nivel_academico=?, anios_servicio=?, horas_trabajo=?, situacion_trabajador=?, observacion=?, rif=?, estado_civil=?, etnia_religion=?, cantidad_hijas=?, cantidad_hijos_varones=? WHERE id_personal=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->id_persona,
        $this->codigo_rac,
        $this->cargo,
        $this->funcion,
        $this->fecha_contratacion,
        $this->nivel_academico,
        $this->anios_servicio,
        $this->horas_trabajo,
        $this->situacion_trabajador,
        $this->observacion,
        $this->rif,
        $this->estado_civil,
        $this->etnia_religion,
        $this->cantidad_hijas,
        $this->cantidad_hijos_varones,
        $this->id_personal
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM personal WHERE id_personal=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM personal WHERE id_personal = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      return $data ?: false;
    } catch (Exception $e) {
      return false;
    }
  }

  public static function consultarTodos(PDO $pdo)
  {
    try {
      $sql = "SELECT * FROM personal ORDER BY id_personal ASC";
      $stmt = $pdo->query($sql);
      return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    } catch (Exception $e) {
      return [];
    }
  }

  public static function consultarTodosConPersona(PDO $pdo)
  {
    try {
      $sql = "SELECT p.*, per.primer_nombre, per.segundo_nombre, per.primer_apellido, per.segundo_apellido, per.cedula
              FROM personal p
              LEFT JOIN personas per ON p.id_persona = per.id_persona
              ORDER BY p.id_personal ASC";
      $stmt = $pdo->query($sql);
      return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    } catch (Exception $e) {
      return [];
    }
  }

  public static function consultarConPersona(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT p.*, per.primer_nombre, per.segundo_nombre, per.primer_apellido, per.segundo_apellido, per.cedula
              FROM personal p
              LEFT JOIN personas per ON p.id_persona = per.id_persona
              WHERE p.id_personal = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
    } catch (Exception $e) {
      return false;
    }
  }

  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(1) FROM personal WHERE id_personal = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return (int)$stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
