<?php

namespace Micodigo\AnioEscolar;

use Valitron\Validator;

require_once __DIR__ . '/AnioEscolarAtributosTrait.php';
require_once __DIR__ . '/OperacionesBDTrait.php';
require_once __DIR__ . '/AnioEscolarValidacionesTrait.php';
require_once __DIR__ . '/MomentosValidacionesTrait.php';
require_once __DIR__ . '/AnioEscolarConsultasTrait.php';
require_once __DIR__ . '/AnioEscolarGestionTrait.php';

class AnioEscolar
{
  use AnioEscolarAtributosTrait,
    OperacionesBDTrait,
    AnioEscolarValidacionesTrait,
    MomentosValidacionesTrait,
    AnioEscolarConsultasTrait,
    AnioEscolarGestionTrait;

  public function __construct(array $datos = [])
  {
    Validator::lang('es');
    $this->asignarDatos($datos);
  }
}
