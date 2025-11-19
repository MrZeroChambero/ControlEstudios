<?php

namespace Micodigo\DocumentosAcademicos;

trait DocumentosAcademicosUtilidadesTrait
{
  public function estaEntregado(): bool
  {
    return $this->entregado === 'si';
  }
}
