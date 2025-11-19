<?php

namespace Micodigo\Persona;

use PDO;
use Valitron\Validator;
use Exception;

trait PersonaValidationTrait
{
  private function _validarDatos(PDO $pdo)
  {
    Validator::lang('es');
    $v = new Validator((array) $this);

    Validator::addRule('uniqueCedula', function ($field, $value, array $params, array $fields) use ($pdo) {
      if (empty($value)) return true;
      $sql = "SELECT id_persona FROM personas WHERE cedula = ?";
      $params_sql = [$value];
      if (!empty($this->id_persona)) {
        $sql .= " AND id_persona != ?";
        $params_sql[] = $this->id_persona;
      }
      $stmt = $pdo->prepare($sql);
      $stmt->execute($params_sql);
      return $stmt->fetch() === false;
    }, 'ya está en uso.');

    $v->rules([
      'required' => [
        ['primer_nombre'],
        ['primer_apellido'],
        ['fecha_nacimiento'],
        ['genero'],
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

    if ($v->validate()) {
      return true;
    }
    return $v->errors();
  }
}
