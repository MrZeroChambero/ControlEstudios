<?php

namespace Micodigo\Inscripcion;

trait InscripcionDebugTrait
{
  private function agregarSqlDebug(?array &$debug, string $clave, string $sql, array $parametros = []): void
  {
    if ($debug === null) {
      return;
    }

    $debug[$clave] = [
      'sql' => $sql,
      'parametros' => $parametros,
    ];
  }

  private function agregarMensajeDebug(?array &$mensajes, string $mensaje): void
  {
    if ($mensajes === null) {
      return;
    }

    $mensajes[] = $mensaje;
  }
}
