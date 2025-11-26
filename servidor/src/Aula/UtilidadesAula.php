<?php

namespace Micodigo\Aula;

trait UtilidadesAula
{
  private function nombreEstadoAula(string $estado = null): ?string
  {
    $map = [
      'activo' => 'Aula Activa',
      'inactivo' => 'Aula Inactiva'
    ];
    return $estado !== null && isset($map[$estado]) ? $map[$estado] : null;
  }
}
