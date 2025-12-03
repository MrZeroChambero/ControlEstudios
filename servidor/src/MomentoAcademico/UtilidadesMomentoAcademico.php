<?php

namespace Micodigo\MomentoAcademico;

trait UtilidadesMomentoAcademico
{
  private function nombreEstadoMomento(string $estado = null): ?string
  {
    $map = [
      'activo' => 'Momento Activo',
      'inactivo' => 'Momento Inactivo',
      'finalizado' => 'Momento Finalizado'
    ];
    return $estado !== null && isset($map[$estado]) ? $map[$estado] : null;
  }
}
