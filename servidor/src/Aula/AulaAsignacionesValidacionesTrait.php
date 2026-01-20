<?php

namespace Micodigo\Aula;

use RuntimeException;

trait AulaAsignacionesValidacionesTrait
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

  protected function validarAsignacionDocente(array $datos): array
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

  protected function validarAsignacionEspecialista(array $datos): array
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

  protected function determinarTipoDocenteDesdeCargo(?string $valor): ?string
  {
    if ($valor === null) {
      return null;
    }

    $clave = strtolower(trim($valor));
    if ($clave === '') {
      return null;
    }

    if (str_contains($clave, 'administr')) {
      return 'administrativo';
    }

    if (str_contains($clave, 'obrer')) {
      return 'obrero';
    }

    if (str_contains($clave, 'cultur')) {
      return 'cultura';
    }

    if (str_contains($clave, 'especial')) {
      return 'especialista';
    }

    if (str_contains($clave, 'aula')) {
      return 'aula';
    }

    if ($clave === 'docente') {
      return 'aula';
    }

    return null;
  }

  protected function determinarTipoComponenteDesdeEspecialista(?string $valor): ?string
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

    return 'aula';
  }

  protected function validarCompatibilidadDocenteComponente(string $tipoDocente, string $tipoComponente): bool
  {
    // Matriz de compatibilidad simplificada
    $matrizCompatibilidad = [
      'aula' => ['aula', 'especialista'], // Docente de aula puede todo
      'especialista' => ['especialista', 'aula'], // Especialista puede especialista y aula
    ];

    return in_array($tipoComponente, $matrizCompatibilidad[$tipoDocente] ?? [], true);
  }
}
