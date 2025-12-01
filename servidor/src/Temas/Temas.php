<?php

namespace Micodigo\Temas;

use Valitron\Validator;

require_once __DIR__ . '/TemasAtributosTrait.php';
require_once __DIR__ . '/OperacionesBDTrait.php';
require_once __DIR__ . '/TemasValidacionesTrait.php';
require_once __DIR__ . '/TemasConsultasTrait.php';
require_once __DIR__ . '/TemasGestionTrait.php';

class Temas
{
  use TemasAtributosTrait,
    OperacionesBDTrait,
    TemasValidacionesTrait,
    TemasConsultasTrait,
    TemasGestionTrait;

  public function __construct(array $datos = [])
  {
    Validator::lang('es');
    $this->asignarDatos($datos);

    if ($this->estado !== 'activo' && $this->estado !== 'inactivo') {
      $this->estado = 'activo';
    }
  }
}
