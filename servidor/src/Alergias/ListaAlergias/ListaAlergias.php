<?php

namespace Micodigo\Alergias\ListaAlergias;

use Valitron\Validator;

require_once __DIR__ . '/ListaAlergiasAtributosTrait.php';
require_once __DIR__ . '/ListaAlergiasValidacionesTrait.php';
require_once __DIR__ . '/ListaAlergiasGestionTrait.php';
require_once __DIR__ . '/ListaAlergiasConsultasTrait.php';
require_once __DIR__ . '/ListaAlergiasOperacionesControladorTrait.php';
require_once __DIR__ . '/ListaAlergiasUtilidadesTrait.php';

class ListaAlergias
{
  use ListaAlergiasAtributosTrait,
    ListaAlergiasValidacionesTrait,
    ListaAlergiasGestionTrait,
    ListaAlergiasConsultasTrait,
    ListaAlergiasOperacionesControladorTrait,
    ListaAlergiasUtilidadesTrait;

  public function __construct(array $data = [])
  {
    $this->fk_alergia = $data['fk_alergia'] ?? null;
    $this->fk_estudiante = $data['fk_estudiante'] ?? null;
    Validator::lang('es');
  }
}
