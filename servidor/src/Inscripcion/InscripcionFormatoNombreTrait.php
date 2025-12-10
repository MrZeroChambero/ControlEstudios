<?php

namespace Micodigo\Inscripcion;

trait InscripcionFormatoNombreTrait
{
  private function construirNombreCompleto(array $datos): string
  {
    $partes = [
      $datos['primer_nombre'] ?? '',
      $datos['segundo_nombre'] ?? '',
      $datos['primer_apellido'] ?? '',
      $datos['segundo_apellido'] ?? '',
    ];

    return trim(preg_replace('/\s+/', ' ', implode(' ', array_filter($partes))));
  }
}
