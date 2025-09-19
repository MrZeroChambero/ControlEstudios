<?php

namespace Micodigo\AsignacionGradoSeccion;

use PDO;
use Exception;
use Valitron\Validator;

class AsignacionGradoSeccion
{
  public $id_asignacion_gs;
  public $id_anio_escolar;
  public $id_grado;
  public $id_seccion;
  public $id_docente_guia;
  public $cupos_disponibles;

  public function __construct(
    $id_anio_escolar,
    $id_grado,
    $id_seccion,
    $id_docente_guia = null,
    $cupos_disponibles = null
  ) {
    $this->id_anio_escolar = $id_anio_escolar;
    $this->id_grado = $id_grado;
    $this->id_seccion = $id_seccion;
    $this->id_docente_guia = $id_docente_guia;
    $this->cupos_disponibles = $cupos_disponibles;
  }

  /**
   * Valida los datos del objeto AsignacionGradoSeccion usando Valitron.
   * @param array $data Los datos a validar.
   * @return array|bool Un array con errores o verdadero si la validación es exitosa.
   */
  private function _validarDatos(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data, [], 'es');

    $v->rules([
      'required' => [
        ['id_anio_escolar'],
        ['id_grado'],
        ['id_seccion']
      ],
      'numeric' => [
        ['id_anio_escolar'],
        ['id_grado'],
        ['id_seccion'],
        ['id_docente_guia'],
        ['cupos_disponibles']
      ]
    ]);

    if ($v->validate()) {
      return true;
    } else {
      return $v->errors();
    }
  }

  /**
   * Crea una nueva asignación de grado y sección con validación previa.
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
      $sql = "INSERT INTO asignaciones_grado_seccion (id_anio_escolar, id_grado, id_seccion, id_docente_guia, cupos_disponibles) VALUES (?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->id_anio_escolar,
        $this->id_grado,
        $this->id_seccion,
        $this->id_docente_guia,
        $this->cupos_disponibles
      ]);
      $this->id_asignacion_gs = $pdo->lastInsertId();
      return $this->id_asignacion_gs;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Actualiza los datos de una asignación con validación.
   * @param PDO $pdo Objeto de conexión.
   * @return bool|array Verdadero si la actualización fue exitosa, o un array de errores si falla.
   */
  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_asignacion_gs)) {
      return ['id_asignacion_gs' => ['El ID es requerido para la actualización.']];
    }

    $data = get_object_vars($this);
    $errores = $this->_validarDatos($data);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE asignaciones_grado_seccion SET id_anio_escolar=?, id_grado=?, id_seccion=?, id_docente_guia=?, cupos_disponibles=? WHERE id_asignacion_gs=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->id_anio_escolar,
        $this->id_grado,
        $this->id_seccion,
        $this->id_docente_guia,
        $this->cupos_disponibles,
        $this->id_asignacion_gs
      ]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Elimina un registro de asignación por ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id El ID de la asignación a eliminar.
   * @return bool Verdadero si la eliminación fue exitosa.
   */
  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $sql = "DELETE FROM asignaciones_grado_seccion WHERE id_asignacion_gs=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Consulta los datos de una asignación por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID de la asignación a consultar.
   * @return object|false Un objeto AsignacionGradoSeccion con sus datos o false si no se encuentra.
   */
  public static function consultar(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT * FROM asignaciones_grado_seccion WHERE id_asignacion_gs = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($data) {
        $asignacion = new self(
          $data['id_anio_escolar'],
          $data['id_grado'],
          $data['id_seccion'],
          $data['id_docente_guia'],
          $data['cupos_disponibles']
        );
        $asignacion->id_asignacion_gs = $data['id_asignacion_gs'];
        return $asignacion;
      }
      return false;
    } catch (Exception $e) {
      return false;
    }
  }

  /**
   * Verifica la existencia de una asignación por su ID.
   * @param PDO $pdo Objeto de conexión.
   * @param int $id ID de la asignación a verificar.
   * @return bool Verdadero si existe, falso si no.
   */
  public static function verificarID(PDO $pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) FROM asignaciones_grado_seccion WHERE id_asignacion_gs = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
      return false;
    }
  }
}
