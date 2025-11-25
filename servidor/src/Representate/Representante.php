<?php

namespace Micodigo\Representate;

use Valitron\Validator;

require_once __DIR__ . '/ConsultasRepresentante.php';
require_once __DIR__ . '/GestionRepresentante.php';
require_once __DIR__ . '/ValidacionesRepresentante.php';
require_once __DIR__ . '/OperacionesControladorRepresentante.php';
require_once __DIR__ . '/UtilidadesRepresentante.php';

class Representante
{
  use ConsultasRepresentante,
    GestionRepresentante,
    ValidacionesRepresentante,
    OperacionesControladorRepresentante,
    UtilidadesRepresentante;

  public function __construct()
  {
    Validator::lang('es');
  }
}
