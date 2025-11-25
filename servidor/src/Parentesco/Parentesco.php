<?php

namespace Micodigo\Parentesco;

use Valitron\Validator;

require_once __DIR__ . '/ConsultasParentesco.php';
require_once __DIR__ . '/GestionParentesco.php';
require_once __DIR__ . '/ValidacionesParentesco.php';
require_once __DIR__ . '/OperacionesControladorParentesco.php';
require_once __DIR__ . '/UtilidadesParentesco.php';

class Parentesco
{
  use ConsultasParentesco,
    GestionParentesco,
    ValidacionesParentesco,
    OperacionesControladorParentesco,
    UtilidadesParentesco;

  public function __construct()
  {
    Validator::lang('es');
  }
}
