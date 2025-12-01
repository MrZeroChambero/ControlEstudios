<?php

namespace Micodigo\AreasAprendizaje;

use Valitron\Validator;

require_once __DIR__ . '/OperacionesBDTrait.php';
require_once __DIR__ . '/AreasAprendizajeAtributosTrait.php';
require_once __DIR__ . '/AreasAprendizajeValidacionesTrait.php';
require_once __DIR__ . '/AreasAprendizajeConsultasTrait.php';
require_once __DIR__ . '/AreasAprendizajeGestionTrait.php';

class AreasAprendizaje
{
  use AreasAprendizajeAtributosTrait,
    OperacionesBDTrait,
    AreasAprendizajeValidacionesTrait,
    AreasAprendizajeConsultasTrait,
    AreasAprendizajeGestionTrait;

  public function __construct(array $datos = [])
  {
    Validator::lang('es');
    $this->asignarDatos($datos);
    if ($this->estado_area === null || $this->estado_area === '') {
      $this->estado_area = 'activo';
    }
  }
}
