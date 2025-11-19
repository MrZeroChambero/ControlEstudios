<?php

namespace Micodigo\CondicionesSalud;

trait CondicionesSaludUtilidadesTrait
{
  public function esCronica(): bool
  {
    return $this->cronica === 'si';
  }
}
