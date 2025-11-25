<?php

namespace Micodigo\Representate;

trait UtilidadesRepresentante
{
  private function nombreCompletoPersona(array $p): string
  {
    return $p['primer_nombre'] . ' ' . ($p['segundo_nombre'] ? $p['segundo_nombre'] . ' ' : '') . $p['primer_apellido'] . ' ' . ($p['segundo_apellido'] ?? '');
  }
}
