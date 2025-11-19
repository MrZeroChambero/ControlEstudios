<?php

namespace Micodigo\Alergias;

trait AlergiasUtilidadesTrait
{
  public function normalizarNombre(string $nombre): string
  {
    return trim(preg_replace('/\s+/', ' ', mb_strtolower($nombre)));
  }
}
