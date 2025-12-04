<?php

namespace Micodigo\Competencias;

trait CompetenciasHelpersTrait
{
  protected function normalizarTexto(?string $valor, int $maxLength = null): ?string
  {
    if ($valor === null) {
      return null;
    }

    $limpio = preg_replace('/\s+/', ' ', trim($valor));
    if ($limpio === '') {
      return null;
    }

    if ($maxLength !== null && $maxLength > 0) {
      $limpio = mb_substr($limpio, 0, $maxLength);
    }

    return $limpio;
  }

  protected function normalizarEntero(mixed $valor): ?int
  {
    if ($valor === null || $valor === '') {
      return null;
    }

    if (is_numeric($valor)) {
      return (int) $valor;
    }

    return null;
  }
}
