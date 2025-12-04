<?php

namespace Micodigo\Impartir;

use RuntimeException;

trait ImpartirValidacionesTrait
{
  protected function normalizarEntero(mixed $valor): ?int
  {
    if ($valor === null) {
      return null;
    }

    if (is_string($valor)) {
      $valor = trim($valor);
      if ($valor === '') {
        return null;
      }
    }

    if (!is_numeric($valor)) {
      return null;
    }

    return (int) $valor;
  }

  public function validarAsignacionDocente(array $datos): array
  {
    $errores = [];
    $idPersonal = $this->normalizarEntero($datos['id_personal'] ?? null);

    if ($idPersonal === null || $idPersonal <= 0) {
      $errores['id_personal'][] = 'Debe seleccionar un docente titular valido.';
    }

    $componentesEntrada = $datos['componentes'] ?? [];
    if (!is_array($componentesEntrada)) {
      $componentesEntrada = [];
      $errores['componentes'][] = 'El listado de componentes es invalido.';
    }

    $componentes = [];
    foreach ($componentesEntrada as $componenteId) {
      $valor = $this->normalizarEntero($componenteId);
      if ($valor !== null && $valor > 0) {
        $componentes[$valor] = $valor;
      }
    }

    if (empty($componentes)) {
      $errores['componentes'][] = 'Debe seleccionar al menos un componente que impartira el docente titular.';
    }

    $clasesTotales = $this->normalizarEntero($datos['clases_totales'] ?? null);
    if ($clasesTotales !== null && $clasesTotales < 0) {
      $errores['clases_totales'][] = 'El numero de clases debe ser un valor positivo.';
    }

    return [
      'valido' => empty($errores),
      'errores' => $errores,
      'datos' => [
        'id_personal' => $idPersonal,
        'componentes' => array_values($componentes),
        'clases_totales' => $clasesTotales,
      ],
    ];
  }

  public function validarAsignacionEspecialista(array $datos): array
  {
    $errores = [];
    $idPersonal = $this->normalizarEntero($datos['id_personal'] ?? null);

    if ($idPersonal === null || $idPersonal <= 0) {
      $errores['id_personal'][] = 'Debe seleccionar un especialista valido.';
    }

    $componentesEntrada = $datos['componentes'] ?? ($datos['id_componente'] ?? null);
    if ($componentesEntrada === null) {
      $componentesEntrada = [];
    }

    if (!is_array($componentesEntrada)) {
      $componentesEntrada = [$componentesEntrada];
    }

    $componentes = [];
    foreach ($componentesEntrada as $componenteId) {
      $valor = $this->normalizarEntero($componenteId);
      if ($valor !== null && $valor > 0) {
        $componentes[$valor] = $valor;
      }
    }

    if (empty($componentes)) {
      $errores['componentes'][] = 'Debe seleccionar al menos un componente para el especialista.';
    }

    $clasesTotales = $this->normalizarEntero($datos['clases_totales'] ?? null);
    if ($clasesTotales !== null && $clasesTotales < 0) {
      $errores['clases_totales'][] = 'El numero de clases debe ser un valor positivo.';
    }

    return [
      'valido' => empty($errores),
      'errores' => $errores,
      'datos' => [
        'id_personal' => $idPersonal,
        'componentes' => array_values($componentes),
        'clases_totales' => $clasesTotales,
      ],
    ];
  }

  protected function asegurarComponentesDisponibles(array $componentes): void
  {
    if (empty($componentes)) {
      throw new RuntimeException('Debe seleccionar al menos un componente valido.');
    }
  }
}
