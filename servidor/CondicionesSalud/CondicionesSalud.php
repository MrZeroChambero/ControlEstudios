<?php

namespace Micodigo\CondicionesSalud;

use Valitron\Validator;

require_once __DIR__ . '/CondicionesSaludAtributosTrait.php';
require_once __DIR__ . '/CondicionesSaludValidacionesTrait.php';
require_once __DIR__ . '/CondicionesSaludGestionTrait.php';
require_once __DIR__ . '/CondicionesSaludConsultasTrait.php';
require_once __DIR__ . '/CondicionesSaludOperacionesControladorTrait.php';
require_once __DIR__ . '/CondicionesSaludUtilidadesTrait.php';

class CondicionesSalud
{
  use CondicionesSaludAtributosTrait,
    CondicionesSaludValidacionesTrait,
    CondicionesSaludGestionTrait,
    CondicionesSaludConsultasTrait,
    CondicionesSaludOperacionesControladorTrait,
    CondicionesSaludUtilidadesTrait;

  public function __construct(array $data = [])
  {
    $this->fk_estudiante = $data['fk_estudiante'] ?? null;
    $this->fk_patologia = $data['fk_patologia'] ?? null;
    $this->afectado = $data['afectado'] ?? 'estudiante';
    $this->presente_en = $data['presente_en'] ?? 'estudiante';
    $this->tipo_familiar = $data['tipo_familiar'] ?? null;
    $this->fecha_deteccion = $data['fecha_deteccion'] ?? null;
    $this->cronica = $data['cronica'] ?? null;
    $this->impedimento_fisico = $data['impedimento_fisico'] ?? null;
    $this->observaciones = $data['observaciones'] ?? null;
    Validator::lang('es');
  }
}
