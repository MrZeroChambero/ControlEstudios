<?php

namespace Micodigo\Aula;

trait AulaAperturaHelpersTrait
{
  protected function normalizarClaveGrado(string $grado): string
  {
    return (string) (int) $grado;
  }

  protected function obtenerOrdenDesdeSeccion(string $seccion): int
  {
    $mapa = [
      'A' => 1,
      'B' => 2,
      'C' => 3,
    ];

    $clave = strtoupper(trim($seccion));
    return $mapa[$clave] ?? 0;
  }

  protected function obtenerSeccionDesdeOrden(int $orden): ?string
  {
    $mapa = [
      1 => 'A',
      2 => 'B',
      3 => 'C',
    ];

    return $mapa[$orden] ?? null;
  }

  protected function ordenarPorGradoYSeccion(array &$registro): void
  {
    usort($registro, function (array $a, array $b): int {
      $gradoA = (int) ($a['grado'] ?? 0);
      $gradoB = (int) ($b['grado'] ?? 0);

      if ($gradoA === $gradoB) {
        return $this->obtenerOrdenDesdeSeccion($a['seccion'] ?? '') <=>
          $this->obtenerOrdenDesdeSeccion($b['seccion'] ?? '');
      }

      return $gradoA <=> $gradoB;
    });
  }
}
