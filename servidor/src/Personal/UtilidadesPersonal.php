<?php

namespace Micodigo\Personal;

trait UtilidadesPersonal
{
  private function nombreEstadoPersona(string $estado = null): ?string
  {
    $map = [
      'activo' => 'Persona Activa',
      'inactivo' => 'Persona Inactiva',
      'incompleto' => 'Registro Incompleto'
    ];
    return $estado !== null && isset($map[$estado]) ? $map[$estado] : null;
  }

  private function nombreEstadoPersonal(string $estado = null): ?string
  {
    $map = [
      'activo' => 'Personal Activo',
      'inactivo' => 'Personal Inactivo',
      'incompleto' => 'Personal Incompleto'
    ];
    return $estado !== null && isset($map[$estado]) ? $map[$estado] : null;
  }
}
