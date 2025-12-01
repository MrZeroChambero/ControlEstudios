<?php

namespace Micodigo\ComponentesAprendizaje;

use Valitron\Validator;

require_once __DIR__ . '/ComponentesAprendizajeAtributosTrait.php';
require_once __DIR__ . '/OperacionesBDTrait.php';
require_once __DIR__ . '/ComponentesAprendizajeValidacionesTrait.php';
require_once __DIR__ . '/ComponentesAprendizajeConsultasTrait.php';
require_once __DIR__ . '/ComponentesAprendizajeGestionTrait.php';

class ComponentesAprendizaje
{
    use ComponentesAprendizajeAtributosTrait,
        OperacionesBDTrait,
        ComponentesAprendizajeValidacionesTrait,
        ComponentesAprendizajeConsultasTrait,
        ComponentesAprendizajeGestionTrait;

    public function __construct(array $datos = [])
    {
        Validator::lang('es');
        $this->asignarDatos($datos);

        if ($this->evalua === null || $this->evalua === '') {
            $this->evalua = 'no';
        }

        if ($this->estado_componente === null || $this->estado_componente === '') {
            $this->estado_componente = 'activo';
        }
    }
}
