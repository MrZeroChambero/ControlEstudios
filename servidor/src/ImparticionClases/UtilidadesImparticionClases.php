<?php

namespace Micodigo\ImparticionClases;

trait UtilidadesImparticionClases
{
  private function nombreEstadoImparticion(string $estado = null): ?string
  {
    $map = [
      'activo' => 'Impartición Activa',
      'inactivo' => 'Impartición Inactiva'
    ];
    return $estado !== null && isset($map[$estado]) ? $map[$estado] : null;
  }
}
