<?php

namespace Micodigo\Patologia;

trait PatologiaUtilidadesTrait
{
  public function normalizarNombrePatologia(string $n): string
  {
    return trim(preg_replace('/\s+/', ' ', mb_strtolower($n)));
  }
}
