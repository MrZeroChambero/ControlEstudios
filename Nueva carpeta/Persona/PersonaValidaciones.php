<?php

namespace Micodigo\Persona;

use Valitron\Validator;
use PDO;
use DateTime;

trait PersonaValidaciones
{
    protected function _validarDatos(PDO $pdo)
    {
        Validator::lang('es');
        $v = new Validator((array) $this);

        // Regla personalizada para verificar si la cédula ya existe
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

    protected function limpiarTexto($texto)
    {
        if ($texto === null) return null;
        $texto = trim($texto);
        $texto = preg_replace('/\s+/', ' ', $texto);
        return $texto === '' ? null : $texto;
    }

    protected function validarTextoEspanol($campo, $valor, $obligatorio = false)
    {
        if ($valor === null || $valor === '') {
            if ($obligatorio) {
                return "El campo {$campo} es requerido";
            }
            return null;
        }

        if (!preg_match('/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/', $valor)) {
            return "El campo {$campo} solo puede contener letras y espacios";
        }

        if (strlen(trim($valor)) === 0) {
            return "El campo {$campo} no puede contener solo espacios";
        }

        if ($obligatorio && strlen(trim($valor)) < 2) {
            return "El campo {$campo} debe tener al menos 2 caracteres";
        }

        return null;
    }

    protected function validarEdad($fechaNacimiento)
    {
        $hoy = new DateTime();
        $nacimiento = DateTime::createFromFormat('Y-m-d', $fechaNacimiento);
        $edad = $hoy->diff($nacimiento)->y;

        if ($edad < 18) {
            return "La persona debe ser mayor de 18 años";
        }

        return null;
    }

    public function validarDatosPersona($data)
    {
        $errores = [];

        // Limpiar textos
        $data['primer_nombre'] = $this->limpiarTexto($data['primer_nombre'] ?? '');
        $data['segundo_nombre'] = $this->limpiarTexto($data['segundo_nombre'] ?? '');
        $data['primer_apellido'] = $this->limpiarTexto($data['primer_apellido'] ?? '');
        $data['segundo_apellido'] = $this->limpiarTexto($data['segundo_apellido'] ?? '');
        $data['cedula'] = $this->limpiarTexto($data['cedula'] ?? '');
        $data['nacionalidad'] = $this->limpiarTexto($data['nacionalidad'] ?? '');
        $data['direccion'] = $this->limpiarTexto($data['direccion'] ?? '');
        $data['telefono_principal'] = $this->limpiarTexto($data['telefono_principal'] ?? '');
        $data['telefono_secundario'] = $this->limpiarTexto($data['telefono_secundario'] ?? '');
        $data['email'] = $this->limpiarTexto($data['email'] ?? '');

        // Validar campos requeridos
        $camposRequeridos = [
            'primer_nombre' => 'Primer nombre',
            'primer_apellido' => 'Primer apellido',
            'fecha_nacimiento' => 'Fecha de nacimiento',
            'genero' => 'Género',
            'cedula' => 'Cédula',
            'nacionalidad' => 'Nacionalidad',
            'direccion' => 'Dirección',
            'telefono_principal' => 'Teléfono principal',
            'tipo_sangre' => 'Tipo de sangre'
        ];

        foreach ($camposRequeridos as $campo => $nombre) {
            if (empty($data[$campo])) {
                $errores[$campo] = "El campo {$nombre} es requerido";
            }
        }

        // Validar formatos
        $errorPrimerNombre = $this->validarTextoEspanol('primer_nombre', $data['primer_nombre'], true);
        if ($errorPrimerNombre) $errores['primer_nombre'] = $errorPrimerNombre;

        $errorPrimerApellido = $this->validarTextoEspanol('primer_apellido', $data['primer_apellido'], true);
        if ($errorPrimerApellido) $errores['primer_apellido'] = $errorPrimerApellido;

        // Validar email si se proporciona
        if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errores['email'] = 'El formato del email no es válido';
        }

        // Validar fecha de nacimiento
        if (!empty($data['fecha_nacimiento'])) {
            $fechaNacimiento = DateTime::createFromFormat('Y-m-d', $data['fecha_nacimiento']);
            if (!$fechaNacimiento || $fechaNacimiento->format('Y-m-d') !== $data['fecha_nacimiento']) {
                $errores['fecha_nacimiento'] = 'La fecha de nacimiento no es válida';
            } else {
                $errorEdad = $this->validarEdad($data['fecha_nacimiento']);
                if ($errorEdad) $errores['fecha_nacimiento'] = $errorEdad;
            }
        }

        return $errores;
    }

    public function validarDatosPersonal($data)
    {
        $errores = [];

        if (empty($data['fk_cargo'])) {
            $errores['fk_cargo'] = 'El cargo es requerido';
        }

        if (empty($data['fk_funcion'])) {
            $errores['fk_funcion'] = 'La función es requerida';
        }

        if (empty($data['fecha_contratacion'])) {
            $errores['fecha_contratacion'] = 'La fecha de contratación es requerida';
        }

        return $errores;
    }
}
