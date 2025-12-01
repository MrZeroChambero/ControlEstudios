<?php

namespace Micodigo\Contenidos;

use Valitron\Validator;

require_once __DIR__ . '/ContenidosAtributosTrait.php';
require_once __DIR__ . '/OperacionesBDTrait.php';
require_once __DIR__ . '/ContenidosValidacionesTrait.php';
require_once __DIR__ . '/ContenidosConsultasTrait.php';
require_once __DIR__ . '/ContenidosGestionTrait.php';

class Contenidos
{
  use ContenidosAtributosTrait,
    OperacionesBDTrait,
    ContenidosValidacionesTrait,
    ContenidosConsultasTrait,
    ContenidosGestionTrait;

  public function __construct(array $datos = [])
  {
    Validator::lang('es');
    $this->asignarDatos($datos);

    if ($this->grado !== null && !in_array($this->grado, self::GRADOS_VALIDOS, true)) {
      $this->grado = null;
    }

    if ($this->estado !== 'activo' && $this->estado !== 'inactivo') {
      $this->estado = 'activo';
    }
  }
}
