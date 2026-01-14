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
    return in_array($this->normalizarTipoComponente($valor), ['especialista', 'cultura'], true);
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

  protected function esEspecialidadDocenteAula(?string $valor): bool
  {
    return $this->normalizarTipoComponente($valor) === 'aula';
  }

  protected function normalizarTipoDocente(?string $valor): ?string
  {
    if ($valor === null) {
      return null;
    }

    $clave = strtolower(trim($valor));
    if ($clave === '') {
      return null;
    }

    if (str_contains($clave, 'cultur')) {
      return 'cultura';
    }

    if (str_contains($clave, 'especial')) {
      return 'especialista';
    }

    if (str_contains($clave, 'aula') || str_contains($clave, 'integral') || str_contains($clave, 'guia')) {
      return 'aula';
    }

    if (str_contains($clave, 'docente')) {
      return 'aula';
    }

    if (str_contains($clave, 'admin')) {
      return 'administrativo';
    }

    if (str_contains($clave, 'obrer')) {
      return 'obrero';
    }

    return null;
  }

  protected function normalizarTipoComponente(?string $valor): string
  {
    if ($valor === null) {
      return 'aula';
    }

    $clave = strtolower(trim($valor));
    if ($clave === '' || $clave === 'no') {
      return 'aula';
    }

    if ($clave === 'si') {
      return 'especialista';
    }

    if (str_contains($clave, 'cultur')) {
      return 'cultura';
    }

    if (str_contains($clave, 'especial')) {
      return 'especialista';
    }

    if (str_contains($clave, 'docente') && str_contains($clave, 'aula')) {
      return 'aula';
    }

    return 'aula';
  }
}
