<?php

namespace Micodigo\PlanificacionAcademica;

use Exception;
use PDO;

trait PlanificacionAcademicaUtilidadesTrait
{
  protected function limpiarString(?string $valor): ?string
  {
    if ($valor === null) {
      return null;
    }
    $limpio = trim($valor);
    return $limpio === '' ? null : strtolower($limpio);
  }

  protected function valorEntero(mixed $valor): ?int
  {
    if ($valor === null || $valor === '') {
      return null;
    }
    $numero = filter_var($valor, FILTER_VALIDATE_INT);
    return $numero === false ? null : $numero;
  }

  protected function depurarColeccionEnteros(mixed $valores): array
  {
    if (!is_array($valores)) {
      return [];
    }
    $depurados = [];
    foreach ($valores as $valor) {
      $entero = $this->valorEntero($valor);
      if ($entero !== null) {
        $depurados[$entero] = $entero;
      }
    }
    return array_values($depurados);
  }

  protected function sincronizarColeccionesDesdeEntrada(array $entrada): void
  {
    if (array_key_exists('competencias', $entrada)) {
      $this->competencias = $this->depurarColeccionEnteros($entrada['competencias']);
    }
    if (array_key_exists('estudiantes', $entrada)) {
      $this->estudiantes = $this->depurarColeccionEnteros($entrada['estudiantes']);
    }
  }

  protected function ejecutarEnTransaccion(PDO $pdo, callable $callback)
  {
    $interna = $pdo->inTransaction();
    if (!$interna) {
      $pdo->beginTransaction();
    }

    try {
      $resultado = $callback();
      if (!$interna) {
        $pdo->commit();
      }
      return $resultado;
    } catch (Exception $e) {
      if (!$interna && $pdo->inTransaction()) {
        $pdo->rollBack();
      }
      throw $e;
    }
  }

  protected function tieneRegistrosHijos(PDO $pdo, int $id): bool
  {
    $tablas = [
      ['tabla' => PlanificacionAcademica::TABLA_COMPETENCIAS, 'campo' => 'fk_planificacion'],
      ['tabla' => PlanificacionAcademica::TABLA_INDIVIDUALES, 'campo' => 'fk_planificacion'],
    ];

    foreach ($tablas as $config) {
      $stmt = $pdo->prepare("SELECT 1 FROM {$config['tabla']} WHERE {$config['campo']} = :id LIMIT 1");
      $stmt->execute([':id' => $id]);
      if ($stmt->fetchColumn()) {
        return true;
      }
    }

    return false;
  }

  protected function filtrosDesdeRequest(): array
  {
    $permitidos = ['fk_personal', 'fk_aula', 'fk_componente', 'fk_momento'];
    $filtros = [];
    foreach ($permitidos as $campo) {
      if (isset($_GET[$campo])) {
        $filtros[$campo] = $this->valorEntero($_GET[$campo]);
      }
    }
    foreach (['tipo', 'estado', 'reutilizable'] as $campo) {
      if (isset($_GET[$campo])) {
        $filtros[$campo] = $this->limpiarString($_GET[$campo]);
      }
    }
    return array_filter($filtros, static fn($valor) => $valor !== null);
  }
}
