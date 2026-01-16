<?php

namespace Micodigo\Horarios;

use function Micodigo\Horarios\Config\obtenerBloquePorCodigo;
use const Micodigo\Horarios\Config\BLOQUES_HORARIO;

trait HorariosHelpersTrait
{
  protected function formatearHora(?float $hora): ?string
  {
    if ($hora === null) {
      return null;
    }

    $horas = (int) floor($hora);
    $minutos = (int) round(($hora - $horas) * 60);
    return sprintf('%02d:%02d', max(0, $horas), max(0, $minutos));
  }

  protected function duracionBloqueValida(?float $inicio, ?float $fin): bool
  {
    $bloque = $this->obtenerBloqueConfigDesdeHoras($inicio, $fin);
    if ($bloque === null) {
      return false;
    }

    $duracion = (int) ($bloque['duracion'] ?? 0);
    $esExtension = array_key_exists('extensionDe', $bloque);

    if ($duracion === 0) {
      return true;
    }

    if ($duracion < 40 || $duracion > 80) {
      return $esExtension;
    }

    return true;
  }

  protected function rangosSeSolapan(float $inicioA, float $finA, float $inicioB, float $finB): bool
  {
    return $inicioA < $finB && $inicioB < $finA;
  }

  protected function validarHorarioLaboral(?float $inicio, ?float $fin): bool
  {
    if ($inicio === null || $fin === null) {
      return false;
    }

    return $inicio >= 7.0 && $fin <= 12.0;
  }

  protected function obtenerCodigoBloqueDesdeHoras(?float $inicio, ?float $fin): ?string
  {
    if ($inicio === null || $fin === null) {
      return null;
    }

    $inicioTexto = $this->formatearHora($inicio);
    $finTexto = $this->formatearHora($fin);

    foreach (BLOQUES_HORARIO as $bloque) {
      if ($bloque['inicio'] === $inicioTexto && $bloque['fin'] === $finTexto) {
        return $bloque['codigo'];
      }
    }

    return null;
  }

  protected function obtenerBloqueConfigDesdeHoras(?float $inicio, ?float $fin): ?array
  {
    $codigo = $this->obtenerCodigoBloqueDesdeHoras($inicio, $fin);
    return $codigo ? obtenerBloquePorCodigo($codigo) : null;
  }

  protected function obtenerHorasDecimalDesdeCodigo(string $codigo): ?array
  {
    $bloque = obtenerBloquePorCodigo($codigo);
    if ($bloque === null) {
      return null;
    }

    return [
      'inicio' => $this->normalizarHoraDecimal($bloque['inicio']),
      'fin' => $this->normalizarHoraDecimal($bloque['fin']),
    ];
  }
}
