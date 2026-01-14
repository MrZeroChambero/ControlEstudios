<?php

namespace Micodigo\Personal;

use DateTime;
use Exception;
use Valitron\Validator;

trait ValidacionesPersonal
{
  private function limpiarTexto($texto)
  {
    if ($texto === null) return null;
    $texto = trim($texto);
    $texto = preg_replace('/\s+/', ' ', $texto);
    return $texto === '' ? null : $texto;
  }

  private function crearValidadorPersona(array $data, $id_persona = null)
  {
    $normalizados = $data;
    if (array_key_exists('email', $normalizados)) {
      $correo = trim((string) $normalizados['email']);
      if ($correo === '') {
        unset($normalizados['email']);
      } else {
        $normalizados['email'] = $correo;
      }
    }

    Validator::lang('es');
    $v = new Validator($normalizados);
    Validator::addRule('uniqueCedula', function ($field, $value, array $params, array $fields) use ($id_persona) {
      if (empty($value)) return true;
      $pdo = \Micodigo\Config\Conexion::obtener();
      $sql = "SELECT id_persona FROM personas WHERE cedula = ?";
      $p = [$value];
      if ($id_persona) {
        $sql .= " AND id_persona != ?";
        $p[] = $id_persona;
      }
      $stmt = $pdo->prepare($sql);
      $stmt->execute($p);
      return $stmt->fetch() === false;
    }, 'ya está registrada.');

    $v->rules([
      'required' => [
        ['primer_nombre'],
        ['primer_apellido'],
        ['fecha_nacimiento'],
        ['genero'],
        ['cedula'],
        ['nacionalidad'],
        ['direccion'],
        ['telefono_principal'],
        ['tipo_sangre']
      ],
      'lengthMax' => [
        ['primer_nombre', 50],
        ['segundo_nombre', 50],
        ['primer_apellido', 50],
        ['segundo_apellido', 50],
        ['cedula', 20],
        ['nacionalidad', 50],
        ['direccion', 255],
        ['telefono_principal', 20],
        ['telefono_secundario', 20],
        ['email', 100]
      ],
      'date' => [['fecha_nacimiento', 'Y-m-d']],
      'in' => [
        ['genero', ['M', 'F']],
        ['tipo_sangre', ['No sabe', 'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']]
      ],
      'email' => [['email']],
      'uniqueCedula' => [['cedula']]
    ]);
    return $v;
  }

  private function crearValidadorPersonal(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data);
    $v->rules([
      'required' => [
        ['fk_cargo'],
        ['fecha_contratacion']
      ],
      'date' => [['fecha_contratacion', 'Y-m-d']],
      'integer' => [
        ['fk_cargo'],
      ],
      'lengthMax' => [
        ['nivel_academico', 100],
        ['rif', 15],
        ['etnia_religion', 100],
        ['cod_dependencia', 50]
      ],
      // Estado ya no requerido en creación (siempre 'activo'), pero validamos si viene
      'in' => [
        ['estado', ['activo', 'inactivo', 'incompleto']]
      ]
    ]);
    return $v;
  }

  private function validarEdadMayor(array &$errores, $fecha_nacimiento)
  {
    if (!$fecha_nacimiento) return;
    $n = DateTime::createFromFormat('Y-m-d', $fecha_nacimiento);
    if (!$n) {
      $errores['fecha_nacimiento'][] = 'Fecha de nacimiento inválida';
      return;
    }
    $edad = (int) (new DateTime())->diff($n)->y;
    if ($edad < 18) $errores['fecha_nacimiento'][] = 'Debe ser mayor de 18 años';
  }

  public static function verificarCedulaExistente($pdo, $cedula, $id_persona = null)
  {
    try {
      $sql = "SELECT COUNT(*) as count FROM personas WHERE cedula = ?";
      $params = [$cedula];
      if ($id_persona !== null) {
        $sql .= " AND id_persona != ?";
        $params[] = $id_persona;
      }
      $stmt = $pdo->prepare($sql);
      $stmt->execute($params);
      $r = $stmt->fetch(\PDO::FETCH_ASSOC);
      return $r['count'] > 0;
    } catch (Exception $e) {
      throw new Exception("Error al verificar cédula existente: " . $e->getMessage());
    }
  }
}
