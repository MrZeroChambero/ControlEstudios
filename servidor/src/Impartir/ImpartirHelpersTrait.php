<?php

namespace Micodigo\Impartir;

trait ImpartirHelpersTrait
{
  protected function construirNombreCompleto(array $datos): string
  {
    $partes = [
      $datos['primer_nombre'] ?? '',
      $datos['segundo_nombre'] ?? '',
      $datos['primer_apellido'] ?? '',
      $datos['segundo_apellido'] ?? '',
    ];

    $partes = array_filter(array_map('trim', $partes));
    return implode(' ', $partes);
  }

  protected function determinarSiRequiereEspecialista(?string $valor): bool
  {
    if ($valor === null) {
      return false;
    }

    $normalizado = strtolower(trim($valor));
    if ($normalizado === '' || $normalizado === 'no') {
      return false;
    }

    if ($normalizado === 'si') {
      return true;
    }

    return str_contains($normalizado, 'especial');
  }

  protected function ordenarAulasPorGradoSeccion(array &$aulas): void
  {
    usort($aulas, function (array $a, array $b): int {
      $gradoA = (int) ($a['grado'] ?? 0);
      $gradoB = (int) ($b['grado'] ?? 0);

      if ($gradoA === $gradoB) {
        return strcmp((string) ($a['seccion'] ?? ''), (string) ($b['seccion'] ?? ''));
      }

      return $gradoA <=> $gradoB;
    });
  }
}
