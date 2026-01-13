<?php

namespace Micodigo\AnioEscolar;

use DateInterval;
use DateTime;

trait MomentosValidacionesTrait
{
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

  protected function generarMomentosAutomaticos(array $datosAnio): array
  {
    $predeterminados = $this->obtenerMomentosPredeterminados($datosAnio['anio_base']);
    $inicioAnio = new DateTime($datosAnio['fecha_inicio']);
    $finAnio = new DateTime($datosAnio['fecha_fin']);

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
        'fecha_fin' => $fin->format('Y-m-d'),
        'fecha_final' => $fin->format('Y-m-d'),
        'estado' => $orden === 1 ? 'activo' : 'pendiente',
      ];
    }

    return $momentos;
  }

  protected function validarMomentos(array $momentos, array $datosAnio): array
  {
    $errores = [];
    $resultados = [];
    $maximoDesviacion = 7;
    $inicioAnio = new DateTime($datosAnio['fecha_inicio']);
    $finAnio = new DateTime($datosAnio['fecha_fin']);
    $predeterminados = $this->obtenerMomentosPredeterminados($datosAnio['anio_base']);

    if (count($momentos) !== 3) {
      $errores['momentos'][] = 'Se requieren exactamente tres momentos académicos.';
      return ['valido' => false, 'errores' => $errores, 'momentos' => []];
    }

    foreach ($momentos as $momento) {
      $orden = (int) ($momento['orden'] ?? 0);
      if ($orden < 1 || $orden > 3) {
        $errores['orden'][] = 'Los momentos deben tener orden 1, 2 y 3.';
        continue;
      }

      $inicioNormalizado = $this->normalizarFecha($momento['fecha_inicio'] ?? null);
      $finNormalizado = $this->normalizarFecha($momento['fecha_fin'] ?? $momento['fecha_final'] ?? null);

      if ($inicioNormalizado === null || $finNormalizado === null) {
        $errores['momento_' . $orden][] = 'Las fechas del momento ' . $orden . ' son obligatorias.';
        continue;
      }

      $inicio = new DateTime($inicioNormalizado);
      $fin = new DateTime($finNormalizado);

      $estadoEntrada = $momento['estado']
        ?? $momento['estado_momento']
        ?? $momento['momento_estado']
        ?? null;

      $estadoNormalizado = is_string($estadoEntrada)
        ? strtolower(trim($estadoEntrada))
        : null;

      if ($estadoNormalizado === null || $estadoNormalizado === '') {
        $estadoNormalizado = $orden === 1 ? 'activo' : 'pendiente';
      }

      if (in_array($estadoNormalizado, ['planificado', 'incompleto'], true)) {
        $estadoNormalizado = 'pendiente';
      }

      if (!in_array($estadoNormalizado, ['activo', 'pendiente', 'finalizado'], true)) {
        $errores['momento_' . $orden][] = 'El estado del momento ' . $orden . ' es inválido.';
        continue;
      }

      if ($inicio > $fin) {
        $errores['momento_' . $orden][] = 'La fecha de inicio debe ser anterior a la fecha final.';
      }

      if ($inicio < $inicioAnio || $fin > $finAnio) {
        $errores['momento_' . $orden][] = 'Las fechas de cada momento deben estar dentro del rango del año escolar.';
      }

      $predeterminado = $predeterminados[$orden];
      if ($this->diferenciaDias($inicio, $predeterminado['inicio']) > $maximoDesviacion) {
        $errores['momento_' . $orden][] = 'El inicio del momento ' . $orden . ' debe mantenerse dentro de ±7 días del valor sugerido.';
      }

      if ($this->diferenciaDias($fin, $predeterminado['fin']) > $maximoDesviacion) {
        $errores['momento_' . $orden][] = 'El cierre del momento ' . $orden . ' debe mantenerse dentro de ±7 días del valor sugerido.';
      }

      $resultados[$orden] = [
        'id' => isset($momento['id']) && is_numeric($momento['id']) ? (int) $momento['id'] : null,
        'orden' => $orden,
        'nombre' => $momento['nombre'] ?? ('Momento ' . $orden),
        'fecha_inicio' => $inicio->format('Y-m-d'),
        'fecha_fin' => $fin->format('Y-m-d'),
        'fecha_final' => $fin->format('Y-m-d'),
        'estado' => $estadoNormalizado,
      ];
    }

    if (!empty($errores)) {
      return ['valido' => false, 'errores' => $errores, 'momentos' => []];
    }

    ksort($resultados);
    $momentosOrdenados = array_values($resultados);

    for ($indice = 1; $indice < count($momentosOrdenados); $indice++) {
      $finAnterior = new DateTime($momentosOrdenados[$indice - 1]['fecha_fin']);
      $inicioActual = new DateTime($momentosOrdenados[$indice]['fecha_inicio']);
      if ($finAnterior >= $inicioActual) {
        $errores['momentos'][] = 'Los momentos académicos no deben solaparse.';
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
