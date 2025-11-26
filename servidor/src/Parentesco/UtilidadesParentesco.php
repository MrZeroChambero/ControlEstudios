<?php

namespace Micodigo\Parentesco;

trait UtilidadesParentesco
{
  private function nombreTipo(string $tipo): string
  {
    $map = [
      'padre' => 'Padre',
      'madre' => 'Madre',
      'abuelo' => 'Abuelo',
      'abuela' => 'Abuela',
      'hermano' => 'Hermano',
      'hermana' => 'Hermana',
      'tio' => 'Tío',
      'tia' => 'Tía',
      'otro' => 'Otro',
      'representante' => 'Representante',
      'tutor' => 'Tutor',
      'encargado' => 'Encargado'
    ];
    return $map[$tipo] ?? $tipo;
  }
}
