<?php

namespace Micodigo\GradosSecciones;

trait UtilidadesGradosSecciones
{
  private function nombreEstadoGradoSeccion(string $estado = null): ?string
  {
    $map = [
      'activo' => 'Grado/Sección Activo',
      'inactivo' => 'Grado/Sección Inactivo'
    ];
    return $estado !== null && isset($map[$estado]) ? $map[$estado] : null;
  }
}
