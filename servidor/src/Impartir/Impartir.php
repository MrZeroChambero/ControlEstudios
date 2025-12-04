<?php

namespace Micodigo\Impartir;

use Valitron\Validator;

require_once __DIR__ . '/ImpartirRespuestaTrait.php';
require_once __DIR__ . '/ImpartirHelpersTrait.php';
require_once __DIR__ . '/ImpartirConsultasTrait.php';
require_once __DIR__ . '/ImpartirValidacionesTrait.php';
require_once __DIR__ . '/ImpartirGestionTrait.php';
require_once __DIR__ . '/OperacionesControladorImpartirTrait.php';

class Impartir
{
  use ImpartirRespuestaTrait,
    ImpartirHelpersTrait,
    ImpartirConsultasTrait,
    ImpartirValidacionesTrait,
    ImpartirGestionTrait,
    OperacionesControladorImpartirTrait;

  public function __construct()
  {
    Validator::lang('es');
  }
}
