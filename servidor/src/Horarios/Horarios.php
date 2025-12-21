<?php

namespace Micodigo\Horarios;

use Valitron\Validator;

require_once __DIR__ . '/HorariosAtributosTrait.php';
require_once __DIR__ . '/HorariosHelpersTrait.php';
require_once __DIR__ . '/HorariosValidacionesTrait.php';
require_once __DIR__ . '/HorariosConsultasTrait.php';
require_once __DIR__ . '/HorariosGestionTrait.php';
require_once __DIR__ . '/OperacionesBDTrait.php';

class Horarios
{
  use HorariosAtributosTrait,
    HorariosHelpersTrait,
    HorariosValidacionesTrait,
    HorariosConsultasTrait,
    HorariosGestionTrait,
    OperacionesBDTrait;

  public function __construct(array $datos = [])
  {
    Validator::lang('es');
    $this->asignarDatos($datos);
  }
}
