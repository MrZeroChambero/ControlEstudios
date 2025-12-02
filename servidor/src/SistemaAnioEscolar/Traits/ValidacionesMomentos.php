<?php

namespace Micodigo\SistemaAnioEscolar\Traits;

use DateInterval;
use DateTime;
use Exception;

trait ValidacionesMomentos
{
  protected function calcularSemanaSanta(int $anio): DateTime
  {
    $timestamp = easter_date($anio);
    $fecha = new DateTime('@' . $timestamp);
    $fecha->setTimezone(new \DateTimeZone(date_default_timezone_get() ?: 'UTC'));
    return $fecha;
  }

  protected function obtenerMomentosPredeterminados(int $anioBase): array
  {
    $anioSiguiente = $anioBase + 1;
    $semanaSanta = $this->calcularSemanaSanta($anioSiguiente);
    $antesSemanaSanta = (clone $semanaSanta)->sub(new DateInterval('P7D'));
    $despuesSemanaSanta = (clone $semanaSanta)->add(new DateInterval('P7D'));

    return [
      1 => [
        'inicio' => new DateTime(sprintf('%04d-09-01', $anioBase)),
        'fin' => new DateTime(sprintf('%04d-12-20', $anioBase)),
      ],
      2 => [
        'inicio' => new DateTime(sprintf('%04d-01-10', $anioSiguiente)),
        'fin' => $antesSemanaSanta,
      ],
      3 => [
        'inicio' => $despuesSemanaSanta,
        'fin' => new DateTime(sprintf('%04d-07-20', $anioSiguiente)),
      ],
    ];
  }

  protected function generarMomentosAutomaticos(array $anioDatos): array
  {
    $predeterminados = $this->obtenerMomentosPredeterminados($anioDatos['anio_base']);
    $inicioAnio = new DateTime($anioDatos['fecha_inicio']);
    $finAnio = new DateTime($anioDatos['fecha_final']);

    $momentos = [];

    foreach ([1, 2, 3] as $orden) {
      $inicio = clone $predeterminados[$orden]['inicio'];
      $fin = clone $predeterminados[$orden]['fin'];

      if ($inicio < $inicioAnio) {
        $inicio = clone $inicioAnio;
      }

      if ($fin > $finAnio) {
        $fin = clone $finAnio;
      }

      if ($fin < $inicio) {
        $fin = clone $inicio;
      }

      $momentos[] = [
        'orden' => $orden,
        'nombre' => 'Momento ' . $orden,
        'fecha_inicio' => $inicio->format('Y-m-d'),
        'fecha_final' => $fin->format('Y-m-d'),
        'estado' => 'activo',
      ];
    }

    return $momentos;
  }

  protected function validarMomentos(array $momentos, array $anioDatos): array
  {
    $errores = [];
    $resultados = [];
    $maxDesviacion = 7;
    $anioInicio = new DateTime($anioDatos['fecha_inicio']);
    $anioFin = new DateTime($anioDatos['fecha_final']);
    $predeterminados = $this->obtenerMomentosPredeterminados($anioDatos['anio_base']);

    if (count($momentos) !== 3) {
      $errores['momentos'][] = 'Se requieren exactamente 3 momentos académicos.';
      return ['valido' => false, 'errores' => $errores, 'momentos' => []];
    }

    foreach ($momentos as $momento) {
      $orden = (int) ($momento['orden'] ?? 0);
      if ($orden < 1 || $orden > 3) {
        $errores['orden'][] = 'Los momentos deben tener orden 1, 2 y 3.';
        continue;
      }

      $inicioNormalizado = $this->normalizarFecha($momento['fecha_inicio'] ?? null);
      $finNormalizado = $this->normalizarFecha($momento['fecha_final'] ?? null);

      if ($inicioNormalizado === null || $finNormalizado === null) {
        $errores['momento_' . $orden][] = 'Las fechas del momento ' . $orden . ' son obligatorias.';
        continue;
      }

      $inicio = new DateTime($inicioNormalizado);
      $fin = new DateTime($finNormalizado);

      if ($inicio > $fin) {
        $errores['momento_' . $orden][] = 'La fecha de inicio debe ser anterior a la fecha final.';
      }

      if ($inicio < $anioInicio || $fin > $anioFin) {
        $errores['momento_' . $orden][] = 'Las fechas de cada momento deben estar dentro del rango del año escolar.';
      }

      $predeterminado = $predeterminados[$orden];
      if ($this->diferenciaDias($inicio, $predeterminado['inicio']) > $maxDesviacion) {
        $errores['momento_' . $orden][] = 'El inicio del momento ' . $orden . ' debe mantenerse dentro de ±7 días del valor sugerido.';
      }

      if ($this->diferenciaDias($fin, $predeterminado['fin']) > $maxDesviacion) {
        $errores['momento_' . $orden][] = 'El final del momento ' . $orden . ' debe mantenerse dentro de ±7 días del valor sugerido.';
      }

      $resultados[$orden] = [
        'id' => $momento['id'] ?? null,
        'orden' => $orden,
        'nombre' => $momento['nombre'] ?? ('Momento ' . $orden),
        'fecha_inicio' => $inicio->format('Y-m-d'),
        'fecha_final' => $fin->format('Y-m-d'),
        'estado' => $momento['estado'] ?? 'activo',
      ];
    }

    if (!empty($errores)) {
      return ['valido' => false, 'errores' => $errores, 'momentos' => []];
    }

    ksort($resultados);
    $momentosOrdenados = array_values($resultados);

    for ($i = 1; $i < count($momentosOrdenados); $i++) {
      $prevFin = new DateTime($momentosOrdenados[$i - 1]['fecha_final']);
      $actualInicio = new DateTime($momentosOrdenados[$i]['fecha_inicio']);
      if ($prevFin >= $actualInicio) {
        $errores['momentos'][] = 'Los momentos no deben superponerse.';
        break;
      }
    }

    return [
      'valido' => empty($errores),
      'errores' => $errores,
      'momentos' => $momentosOrdenados,
    ];
  }
}
