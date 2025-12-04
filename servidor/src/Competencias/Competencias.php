<?php

namespace Micodigo\Competencias;

use Valitron\Validator;

require_once __DIR__ . '/CompetenciasRespuestaTrait.php';
require_once __DIR__ . '/CompetenciasHelpersTrait.php';
require_once __DIR__ . '/CompetenciasConsultasTrait.php';
require_once __DIR__ . '/CompetenciasValidacionesTrait.php';
require_once __DIR__ . '/CompetenciasGestionTrait.php';
require_once __DIR__ . '/OperacionesControladorCompetenciasTrait.php';

class Competencias
{
  use CompetenciasRespuestaTrait,
    CompetenciasHelpersTrait,
    CompetenciasConsultasTrait,
    CompetenciasValidacionesTrait,
    CompetenciasGestionTrait,
    OperacionesControladorCompetenciasTrait;

  public function __construct()
  {
    Validator::lang('es');
  }
}
