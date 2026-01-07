<?php

namespace Micodigo\PlanificacionAcademica;

use PDO;

trait PlanificacionAcademicaConsultasTrait
{
  public static function obtenerPorId(PDO $pdo, int $id): ?array
  {
    $stmt = $pdo->prepare('SELECT * FROM ' . PlanificacionAcademica::TABLA . ' WHERE id_planificacion = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $registro = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$registro) {
      return null;
    }
    $registro['competencias'] = self::obtenerRelaciones($pdo, PlanificacionAcademica::TABLA_COMPETENCIAS, 'fk_planificacion', 'fk_competencias', [$id])[$id] ?? [];
    $registro['estudiantes'] = self::obtenerRelaciones($pdo, PlanificacionAcademica::TABLA_INDIVIDUALES, 'fk_planificacion', 'fk_estudiante', [$id])[$id] ?? [];
    return $registro;
  }

  public static function listar(PDO $pdo, array $filtros = []): array
  {
    $parametros = [];
    $where = self::construirWhere($filtros, $parametros);
    $sql = 'SELECT * FROM ' . PlanificacionAcademica::TABLA . $where . ' ORDER BY fk_momento, id_planificacion';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($parametros);
    $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$registros) {
      return [];
    }

    $ids = array_column($registros, 'id_planificacion');
    $competencias = self::obtenerRelaciones($pdo, PlanificacionAcademica::TABLA_COMPETENCIAS, 'fk_planificacion', 'fk_competencias', $ids);
    $estudiantes = self::obtenerRelaciones($pdo, PlanificacionAcademica::TABLA_INDIVIDUALES, 'fk_planificacion', 'fk_estudiante', $ids);

    foreach ($registros as &$registro) {
      $id = (int)$registro['id_planificacion'];
      $registro['competencias'] = $competencias[$id] ?? [];
      $registro['estudiantes'] = $estudiantes[$id] ?? [];
    }

    return $registros;
  }

  protected static function construirWhere(array $filtros, array &$parametros): string
  {
    if (!$filtros) {
      return '';
    }

    $clausulas = [];
    foreach ($filtros as $campo => $valor) {
      if ($valor === null) {
        continue;
      }
      $param = ':' . $campo;
      $clausulas[] = $campo . ' = ' . $param;
      $parametros[$param] = $valor;
    }

    return $clausulas ? ' WHERE ' . implode(' AND ', $clausulas) : '';
  }

  protected static function obtenerRelaciones(PDO $pdo, string $tabla, string $campoPlan, string $campoRelacionado, array $ids): array
  {
    if (!$ids) {
      return [];
    }

    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $sql = "SELECT {$campoPlan}, {$campoRelacionado} FROM {$tabla} WHERE {$campoPlan} IN ({$placeholders}) ORDER BY {$campoRelacionado}";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(array_values($ids));

    $relaciones = [];
    while ($fila = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $plan = (int)$fila[$campoPlan];
      $relaciones[$plan][] = (int)$fila[$campoRelacionado];
    }

    return $relaciones;
  }
}
