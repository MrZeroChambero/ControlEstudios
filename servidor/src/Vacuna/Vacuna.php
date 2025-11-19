<?php

namespace Micodigo\Vacuna;

use Valitron\Validator;

require_once __DIR__ . '/VacunaAtributosTrait.php';
require_once __DIR__ . '/VacunaValidacionesTrait.php';
require_once __DIR__ . '/VacunaGestionTrait.php';
require_once __DIR__ . '/VacunaConsultasTrait.php';
require_once __DIR__ . '/VacunaOperacionesControladorTrait.php';
require_once __DIR__ . '/VacunaUtilidadesTrait.php';

class Vacuna
{
  use VacunaAtributosTrait,
    VacunaValidacionesTrait,
    VacunaGestionTrait,
    VacunaConsultasTrait,
    VacunaOperacionesControladorTrait,
    VacunaUtilidadesTrait;

  public function __construct(array $data = [])
  {
    $this->nombre = $data['nombre'] ?? null;
    Validator::lang('es');
  }
}
