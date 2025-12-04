<?php

namespace Micodigo\Indicadores;

use Valitron\Validator;

require_once __DIR__ . '/IndicadoresRespuestaTrait.php';
require_once __DIR__ . '/IndicadoresHelpersTrait.php';
require_once __DIR__ . '/IndicadoresConsultasTrait.php';
require_once __DIR__ . '/IndicadoresValidacionesTrait.php';
require_once __DIR__ . '/IndicadoresGestionTrait.php';
require_once __DIR__ . '/OperacionesControladorIndicadoresTrait.php';

class Indicadores
{
  use IndicadoresRespuestaTrait,
    IndicadoresHelpersTrait,
    IndicadoresConsultasTrait,
    IndicadoresValidacionesTrait,
    IndicadoresGestionTrait,
    OperacionesControladorIndicadoresTrait;

  public function __construct()
  {
    Validator::lang('es');
  }
}
