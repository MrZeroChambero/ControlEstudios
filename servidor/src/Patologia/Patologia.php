<?php

namespace Micodigo\Patologia;

use Valitron\Validator;

require_once __DIR__ . '/PatologiaAtributosTrait.php';
require_once __DIR__ . '/PatologiaValidacionesTrait.php';
require_once __DIR__ . '/PatologiaGestionTrait.php';
require_once __DIR__ . '/PatologiaConsultasTrait.php';
require_once __DIR__ . '/PatologiaOperacionesControladorTrait.php';
require_once __DIR__ . '/PatologiaUtilidadesTrait.php';

class Patologia
{
  use PatologiaAtributosTrait,
    PatologiaValidacionesTrait,
    PatologiaGestionTrait,
    PatologiaConsultasTrait,
    PatologiaOperacionesControladorTrait,
    PatologiaUtilidadesTrait;

  public function __construct(array $data = [])
  {
    $this->nombre_patologia = $data['nombre_patologia'] ?? null;
    $this->descripcion = $data['descripcion'] ?? null;
    Validator::lang('es');
  }
}
