<?php

namespace Micodigo\AnioEscolar;

trait UtilidadesAnioEscolar
{
  private function nombreEstadoAnio(string $estado = null): ?string
  {
    $map = [
      'activo' => 'Año Escolar Activo',
      'inactivo' => 'Año Escolar Inactivo',
      'incompleto' => 'Año Escolar Incompleto'
    ];
    return $estado !== null && isset($map[$estado]) ? $map[$estado] : null;
  }
}
