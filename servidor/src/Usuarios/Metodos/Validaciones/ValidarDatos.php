<?php

declare(strict_types=1);

namespace Usuario\Validaciones;

use Valitron\Validator;

trait ValidarDatos
{
    // Si usas otros traits para reglas/mensajes, mantenlos aquí
    // use ReglasValidacion, MensajesValidacion;

    /**
     * Ejecuta la validación de datos y retorna true o array de errores.
     */
    private function _validarDatos(array $data, bool $isUpdate = false)
    {
        Validator::lang('es');
        $v = new Validator($data);

        // Agregar reglas personalizadas
        $this->_agregarReglasPersonalizadas($v);

        // Definir reglas básicas y defensivas
        $this->_definirReglas($v, $isUpdate);

        // Asignar mensajes y etiquetas
        $this->_asignarMensajes($v);

        if ($v->validate()) {
            return true;
        }
        return $v->errors();
    }

    /**
     * Agrega reglas personalizadas seguras.
     */
    protected function _agregarReglasPersonalizadas(Validator $v)
    {
        // regla para evitar solo espacios
        Validator::addRule('notOnlySpaces', function ($field, $value, array $params, array $fields) {
            if (!is_string($value)) {
                return false;
            }
            return trim($value) !== '';
        }, 'No puede contener solo espacios en blanco.');
    }

    // Método para definir todas las reglas requeridas
    protected function _definirReglas($v, $isUpdate = false)
    {
        // Reglas generales
        $v->rule('notOnlySpaces', 'nombre_usuario');
        $v->rule('numeric', 'id_persona');

        // Lista defensiva de roles (puedes reemplazar por dinámica si tienes)
        $allowedRoles = ['Administrador', 'Docente', 'Secretaria', 'Representante'];
        if (is_array($allowedRoles) && !empty($allowedRoles)) {
            $v->rule('in', 'rol', $allowedRoles);
        }

        $v->rule('in', 'estado', ['activo', 'inactivo', 'incompleto']);
        $v->rule('lengthMin', 'nombre_usuario', 3);
        $v->rule('lengthMax', 'nombre_usuario', 50);
        $v->rule('lengthMax', 'clave', 255);
        $v->rule('regex', 'nombre_usuario', '/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/u');

        // Además, acepta el campo 'contrasena' si tu formulario lo usa
        $v->rule('lengthMin', 'contrasena', 8);

        // Reglas condicionales (solo en caso de creación)
        if (!$isUpdate) {
            $v->rule('required', ['id_persona', 'nombre_usuario', 'clave', 'estado', 'rol']);
            // Si usas 'contrasena' en lugar de 'clave' en el input:
            $v->rule('required', 'contrasena');
        }
    }

    protected function _asignarMensajes($v)
    {
        // Etiquetas legibles por campo
        $v->labels([
            'id_persona'     => 'ID de persona',
            'nombre_usuario' => 'Nombre de usuario',
            'clave'          => 'Contraseña',
            'contrasena'     => 'Contraseña',
            'estado'         => 'Estado',
            'rol'            => 'Rol',
        ]);

        // Mensajes genéricos por regla (evita llamar a $v->rule aquí)
        $v->message('required', 'El campo {field} es obligatorio.');
        $v->message('numeric', 'El campo {field} debe ser numérico.');
        $v->message('lengthMin', 'El campo {field} debe tener al menos {param} caracteres.');
        $v->message('lengthMax', 'El campo {field} no puede exceder los {param} caracteres.');
        $v->message('in', 'El valor de {field} no es válido.');
        $v->message('regex', 'El campo {field} contiene caracteres no permitidos.');
        $v->message('notOnlySpaces', 'El campo {field} no puede contener solo espacios.');
    }
}
