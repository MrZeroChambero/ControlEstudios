<?php

namespace Micodigo\ConsultasMedicas;

use Valitron\Validator;

require_once __DIR__ . '/ConsultasMedicasAtributosTrait.php';
require_once __DIR__ . '/ConsultasMedicasValidacionesTrait.php';
require_once __DIR__ . '/ConsultasMedicasGestionTrait.php';
require_once __DIR__ . '/ConsultasMedicasConsultasTrait.php';
require_once __DIR__ . '/ConsultasMedicasOperacionesControladorTrait.php';
require_once __DIR__ . '/ConsultasMedicasUtilidadesTrait.php';

class ConsultasMedicas
{
  use ConsultasMedicasAtributosTrait,
    ConsultasMedicasValidacionesTrait,
    ConsultasMedicasGestionTrait,
    ConsultasMedicasConsultasTrait,
    ConsultasMedicasOperacionesControladorTrait,
    ConsultasMedicasUtilidadesTrait;

  public function __construct(array $data = [])
  {
    $this->fk_estudiante = $data['fk_estudiante'] ?? null;
    $this->tipo_consulta = $data['tipo_consulta'] ?? null;
    $this->motivo = $data['motivo'] ?? null;
    $this->tiene_informe_medico = $data['tiene_informe_medico'] ?? null;
    $this->fecha_consulta = $data['fecha_consulta'] ?? null;
    $this->observaciones = $data['observaciones'] ?? null;
    Validator::lang('es');
  }
}
