<?php

namespace Micodigo\ConsultasMedicas;

trait ConsultasMedicasUtilidadesTrait
{
  public function tieneInforme(): bool
  {
    return $this->tiene_informe_medico === 'si';
  }
}
