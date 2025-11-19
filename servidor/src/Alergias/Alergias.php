<?php

namespace Micodigo\Alergias;

use Valitron\Validator;

require_once __DIR__ . '/AlergiasAtributosTrait.php';
require_once __DIR__ . '/AlergiasValidacionesTrait.php';
require_once __DIR__ . '/AlergiasGestionTrait.php';
require_once __DIR__ . '/AlergiasConsultasTrait.php';
require_once __DIR__ . '/AlergiasOperacionesControladorTrait.php';
require_once __DIR__ . '/AlergiasUtilidadesTrait.php';

class Alergias
{
  use AlergiasAtributosTrait,
    AlergiasValidacionesTrait,
    AlergiasGestionTrait,
    AlergiasConsultasTrait,
    AlergiasOperacionesControladorTrait,
    AlergiasUtilidadesTrait;

  public function __construct(array $data = [])
  {
    $this->nombre = $data['nombre'] ?? null;
    Validator::lang('es');
  }
}
