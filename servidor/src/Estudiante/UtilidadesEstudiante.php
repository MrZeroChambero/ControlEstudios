<?php

namespace Micodigo\Estudiante;

trait UtilidadesEstudiante
{
  private function nombreEstadoEstudiante(?string $estado): ?string
  {
    $map = ['activo' => 'Estudiante Activo', 'inactivo' => 'Estudiante Inactivo'];
    return $estado !== null && isset($map[$estado]) ? $map[$estado] : null;
  }
}
