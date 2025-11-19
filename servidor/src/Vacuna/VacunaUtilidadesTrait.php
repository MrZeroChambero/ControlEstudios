<?php

namespace Micodigo\Vacuna;

trait VacunaUtilidadesTrait
{
  public function normalizarNombreVacuna(string $n): string
  {
    return trim(preg_replace('/\s+/', ' ', mb_strtolower($n)));
  }
}
