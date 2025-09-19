<?php

namespace Micodigo\Personal;

use PDO;
use Exception;
use Valitron\Validator;

class Personal
{
  public $id_personal;
  public $id_persona;
  public $cargo;
  public $fecha_contratacion;
  public $codigo_rac;
  public $cargo_tipo_personal;
  public $departamento;
  public $nivel_academico;
  public $anios_servicio;
  public $horas_academicas;
  public $horas_adm;
  public $turno_atiende;
  public $grado_imparte;
  public $seccion_imparte;
  public $situacion_trabajador;
  public $observacion;
  public $rif;
  public $estado_civil;
  public $etnia_religion;
  public $numero_hijos;
  public $cantidad_hijas;
  public $cantidad_hijos_varones;

  public function __construct(
    $id_persona,
    $cargo,
    $fecha_contratacion,
    $codigo_rac = null,
    $cargo_tipo_personal = null,
    $departamento = null,
    $nivel_academico = null,
    $anios_servicio = null,
    $horas_academicas = null,
    $horas_adm = null,
    $turno_atiende = null,
    $grado_imparte = null,
    $seccion_imparte = null,
    $situacion_trabajador = null,
    $observacion = null,
    $rif = null,
    $estado_civil = null,
    $etnia_religion = null,
    $numero_hijos = null,
    $cantidad_hijas = null,
    $cantidad_hijos_varones = null
  ) {
    $this->id_persona = $id_persona;
    $this->cargo = $cargo;
    $this->fecha_contratacion = $fecha_contratacion;
    $this->codigo_rac = $codigo_rac;
    $this->cargo_tipo_personal = $cargo_tipo_personal;
    $this->departamento = $departamento;
    $this->nivel_academico = $nivel_academico;
    $this->anios_servicio = $anios_servicio;
    $this->horas_academicas = $horas_academicas;
    $this->horas_adm = $horas_adm;
    $this->turno_atiende = $turno_atiende;
    $this->grado_imparte = $grado_imparte;
    $this->seccion_imparte = $seccion_imparte;
    $this->situacion_trabajador = $situacion_trabajador;
    $this->observacion = $observacion;
    $this->rif = $rif;
    $this->estado_civil = $estado_civil;
    $this->etnia_religion = $etnia_religion;
    $this->numero_hijos = $numero_hijos;
    $this->cantidad_hijas = $cantidad_hijas;
    $this->cantidad_hijos_varones = $cantidad_hijos_varones;
  }

  /**
   * Valida los datos del objeto Personal usando Valitron.
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
        ['cargo'],
        ['fecha_contratacion']
      ],
      'numeric' => [
        ['id_persona'],
        ['anios_servicio'],
        ['horas_academicas'],
        ['horas_adm'],
        ['numero_hijos'],
        ['cantidad_hijas'],
        ['cantidad_hijos_varones']
      ],
      'date' => [
        ['fecha_contratacion']
      ],
      'lengthMax' => [
        ['codigo_rac', 50],
        ['cargo', 100],
        ['cargo_tipo_personal', 100],
        ['departamento', 100],
        ['nivel_academico', 100],
        ['turno_atiende', 50],
        ['grado_imparte', 50],
        ['seccion_imparte', 10],
        ['situacion_trabajador', 100],
        ['rif', 20],
        ['estado_civil', 50],
        ['etnia_religion', 100]
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea un nuevo registro de personal con validación previa.
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
      $sql = "INSERT INTO personal (id_persona, codigo_rac, cargo, cargo_tipo_personal, fecha_contratacion, departamento, nivel_academico, anios_servicio, horas_academicas, horas_adm, turno_atiende, grado_imparte, seccion_imparte, situacion_trabajador, observacion, rif, estado_civil, etnia_religion, numero_hijos, cantidad_hijas, cantidad_hijos_varones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->id_persona,
        $this->codigo_rac,
        $this->cargo,
        $this->cargo_tipo_personal,
        $this->fecha_contratacion,
        $this->departamento,
        $this->nivel_academico,
        $this->anios_servicio,
        $this->horas_academicas,
        $this->horas_adm,
        $this->turno_atiende,
        $this->grado_imparte,
        $this->seccion_imparte,
        $this->situacion_trabajador,
        $this->observacion,
        $this->rif,
        $this->estado_civil,
        $this->etnia_religion,
        $this->numero_hijos,
        $this->cantidad_hijas,
        $this->cantidad_hijos_varones
      ]);
      $this->id_personal = $pdo->lastInsertId();
      return $this->id_personal;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de un registro de personal con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_personal)) {
      return ['id_personal' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE personal SET id_persona=?, codigo_rac=?, cargo=?, cargo_tipo_personal=?, fecha_contratacion=?, departamento=?, nivel_academico=?, anios_servicio=?, horas_academicas=?, horas_adm=?, turno_atiende=?, grado_imparte=?, seccion_imparte=?, situacion_trabajador=?, observacion=?, rif=?, estado_civil=?, etnia_religion=?, numero_hijos=?, cantidad_hijas=?, cantidad_hijos_varones=? WHERE id_personal=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->id_persona,
        $this->codigo_rac,
        $this->cargo,
        $this->cargo_tipo_personal,
        $this->fecha_contratacion,
        $this->departamento,
        $this->nivel_academico,
        $this->anios_servicio,
        $this->horas_academicas,
        $this->horas_adm,
        $this->turno_atiende,
        $this->grado_imparte,
        $this->seccion_imparte,
        $this->situacion_trabajador,
        $this->observacion,
        $this->rif,
        $this->estado_civil,
        $this->etnia_religion,
        $this->numero_hijos,
        $this->cantidad_hijas,
        $this->cantidad_hijos_varones,
        $this->id_personal
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de personal por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID del personal a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
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

  /**
   * Consulta los datos de un registro de personal por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del personal a consultar.
   * @return object|false Un objeto Personal con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM personal WHERE id_personal = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $personal = new self(
          $data['id_persona'],
          $data['cargo'],
          $data['fecha_contratacion'],
          $data['codigo_rac'],
          $data['cargo_tipo_personal'],
          $data['departamento'],
          $data['nivel_academico'],
          $data['anios_servicio'],
          $data['horas_academicas'],
          $data['horas_adm'],
          $data['turno_atiende'],
          $data['grado_imparte'],
          $data['seccion_imparte'],
          $data['situacion_trabajador'],
          $data['observacion'],
          $data['rif'],
          $data['estado_civil'],
          $data['etnia_religion'],
          $data['numero_hijos'],
          $data['cantidad_hijas'],
          $data['cantidad_hijos_varones']
        );
        $personal->id_personal = $data['id_personal'];
        return $personal;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de un registro de personal por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID del registro a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM personal WHERE id_personal = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
