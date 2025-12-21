<?php

namespace Micodigo\Horarios;

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
    if ($inicio === null || $fin === null) {
      return false;
    }

    if ($fin <= $inicio) {
      return false;
    }

    $duracionMinutos = round(($fin - $inicio) * 60);
    return $duracionMinutos >= 40 && $duracionMinutos <= 80;
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
}
