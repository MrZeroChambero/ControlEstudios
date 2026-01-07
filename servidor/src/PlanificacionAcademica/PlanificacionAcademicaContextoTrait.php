<?php

namespace Micodigo\PlanificacionAcademica;

use PDO;

trait PlanificacionAcademicaContextoTrait
{
  protected function obtenerContextoVisual(PDO $pdo, ?int $momentoId = null, ?int $anioId = null): array
  {
    $momento = null;
    $anio = null;

    if ($momentoId !== null) {
      $contextoPorMomento = $this->consultarContextoMomento($pdo, $momentoId);
      if ($contextoPorMomento !== null) {
        $momento = $contextoPorMomento['momento'];
        $anio = $contextoPorMomento['anio'];
      }
    }

    if ($momento === null && $anioId !== null) {
      $preferencia = $this->consultarMomentoPorAnio($pdo, $anioId);
      if ($preferencia !== null) {
        $momento = $preferencia['momento'];
        $anio = $preferencia['anio'];
      } else {
        $anio = $this->consultarAnioPorIdInterno($pdo, $anioId);
      }
    }

    if ($momento === null) {
      $preferencia = $this->consultarMomentoActivoGlobal($pdo);
      if ($preferencia === null) {
        $preferencia = $this->consultarMomentoFinalizadoReciente($pdo);
      }
      if ($preferencia !== null) {
        $momento = $preferencia['momento'];
        $anio ??= $preferencia['anio'];
      }
    }

    if ($anio === null && $momento !== null) {
      $anio = $this->consultarAnioPorIdInterno($pdo, (int) $momento['fk_anio_escolar']);
    }

    if ($anio === null) {
      $anio = $this->consultarAnioActivo($pdo) ?? $this->consultarAnioFinalizado($pdo);
    }

    return [
      'anio' => $anio,
      'momento' => $momento,
      'editable' => $this->contextoEsEditable($anio, $momento),
    ];
  }

  protected function validarContextoEditable(PDO $pdo, ?int $momentoId)
  {
    if ($momentoId === null) {
      return ['contexto' => ['Debe indicar un momento escolar válido.']];
    }

    $contexto = $this->consultarContextoMomento($pdo, $momentoId);
    if ($contexto === null) {
      return ['contexto' => ['El momento escolar indicado no existe.']];
    }

    if ($this->contextoEsEditable($contexto['anio'], $contexto['momento'])) {
      return true;
    }

    return ['contexto' => [$this->motivoBloqueoContexto($contexto['anio'], $contexto['momento'])]];
  }

  private function motivoBloqueoContexto(?array $anio, ?array $momento): string
  {
    if ($anio === null) {
      return 'No se encontró un año escolar asociado al momento indicado.';
    }

    if (strtolower($anio['estado'] ?? '') !== 'activo') {
      return 'El año escolar asociado no está activo; la operación es de solo lectura.';
    }

    if ($momento === null) {
      return 'No se encontró el momento escolar indicado.';
    }

    if (strtolower($momento['estado_momento'] ?? '') !== 'activo') {
      return 'El momento escolar asociado no está activo; la operación es de solo lectura.';
    }

    return 'El contexto escolar no permite realizar modificaciones.';
  }

  private function contextoEsEditable(?array $anio, ?array $momento): bool
  {
    if (!$anio || !$momento) {
      return false;
    }

    return strtolower($anio['estado'] ?? '') === 'activo'
      && strtolower($momento['estado_momento'] ?? '') === 'activo';
  }

  private function consultarContextoMomento(PDO $pdo, int $momentoId): ?array
  {
    return $this->consultarMomentoConJoin(
      $pdo,
      ['m.id_momento = :momento'],
      [':momento' => $momentoId],
      'ORDER BY m.id_momento DESC'
    );
  }

  private function consultarMomentoPorAnio(PDO $pdo, int $anioId): ?array
  {
    $porEstado = $this->consultarMomentoConJoin(
      $pdo,
      ['m.fk_anio_escolar = :anio', 'm.estado_momento = "activo"'],
      [':anio' => $anioId],
      'ORDER BY m.fecha_inicio ASC, m.id_momento ASC'
    );

    if ($porEstado !== null) {
      return $porEstado;
    }

    return $this->consultarMomentoConJoin(
      $pdo,
      ['m.fk_anio_escolar = :anio'],
      [':anio' => $anioId],
      'ORDER BY (m.fecha_fin IS NULL) ASC, m.fecha_fin DESC, m.id_momento DESC'
    );
  }

  private function consultarMomentoActivoGlobal(PDO $pdo): ?array
  {
    return $this->consultarMomentoConJoin(
      $pdo,
      ['m.estado_momento = "activo"', 'ae.estado = "activo"'],
      [],
      'ORDER BY m.fecha_inicio ASC, m.id_momento ASC'
    );
  }

  private function consultarMomentoFinalizadoReciente(PDO $pdo): ?array
  {
    return $this->consultarMomentoConJoin(
      $pdo,
      [],
      [],
      'ORDER BY (m.estado_momento = "finalizado") DESC, (m.fecha_fin IS NULL) ASC, m.fecha_fin DESC, m.id_momento DESC'
    );
  }

  private function consultarMomentoConJoin(PDO $pdo, array $where, array $params, string $orderBy): ?array
  {
    $sql = <<<SQL
SELECT
  m.id_momento,
  m.fk_anio_escolar,
  m.nombre_momento,
  m.fecha_inicio AS momento_fecha_inicio,
  m.fecha_fin AS momento_fecha_fin,
  m.estado_momento,
  ae.id_anio_escolar AS anio_id,
  ae.fecha_inicio AS anio_fecha_inicio,
  ae.fecha_fin AS anio_fecha_fin,
  ae.limite_inscripcion AS anio_limite_inscripcion,
  ae.estado AS estado_anio
FROM momentos m
INNER JOIN anios_escolares ae ON ae.id_anio_escolar = m.fk_anio_escolar
SQL;

    if ($where) {
      $sql .= ' WHERE ' . implode(' AND ', $where);
    }

    $sql .= ' ' . $orderBy . ' LIMIT 1';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $fila = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$fila) {
      return null;
    }

    return $this->mapearContextoMomento($fila);
  }

  private function mapearContextoMomento(array $fila): array
  {
    $momento = [
      'id_momento' => (int) $fila['id_momento'],
      'fk_anio_escolar' => (int) $fila['fk_anio_escolar'],
      'nombre_momento' => $fila['nombre_momento'],
      'fecha_inicio' => $fila['momento_fecha_inicio'],
      'fecha_fin' => $fila['momento_fecha_fin'],
      'estado_momento' => strtolower($fila['estado_momento'] ?? ''),
    ];

    $anio = [
      'id_anio_escolar' => (int) $fila['anio_id'],
      'fecha_inicio' => $fila['anio_fecha_inicio'],
      'fecha_fin' => $fila['anio_fecha_fin'],
      'limite_inscripcion' => $fila['anio_limite_inscripcion'],
      'estado' => strtolower($fila['estado_anio'] ?? ''),
    ];

    return [
      'momento' => $momento,
      'anio' => $anio,
    ];
  }

  private function consultarAnioPorIdInterno(PDO $pdo, int $anioId): ?array
  {
    return $this->consultarAnio(
      $pdo,
      ['ae.id_anio_escolar = :anio'],
      [':anio' => $anioId],
      'ORDER BY ae.id_anio_escolar DESC'
    );
  }

  private function consultarAnioActivo(PDO $pdo): ?array
  {
    return $this->consultarAnio(
      $pdo,
      ['ae.estado = "activo"'],
      [],
      'ORDER BY ae.fecha_inicio DESC, ae.id_anio_escolar DESC'
    );
  }

  private function consultarAnioFinalizado(PDO $pdo): ?array
  {
    return $this->consultarAnio(
      $pdo,
      ['ae.estado <> "activo"'],
      [],
      'ORDER BY (ae.fecha_fin IS NULL) ASC, ae.fecha_fin DESC, ae.id_anio_escolar DESC'
    );
  }

  private function consultarAnio(PDO $pdo, array $where, array $params, string $orderBy): ?array
  {
    $sql = <<<SQL
SELECT
  ae.id_anio_escolar,
  ae.fecha_inicio,
  ae.fecha_fin,
  ae.limite_inscripcion,
  ae.estado
FROM anios_escolares ae
SQL;

    if ($where) {
      $sql .= ' WHERE ' . implode(' AND ', $where);
    }

    $sql .= ' ' . $orderBy . ' LIMIT 1';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $fila = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$fila) {
      return null;
    }

    return [
      'id_anio_escolar' => (int) $fila['id_anio_escolar'],
      'fecha_inicio' => $fila['fecha_inicio'],
      'fecha_fin' => $fila['fecha_fin'],
      'limite_inscripcion' => $fila['limite_inscripcion'],
      'estado' => strtolower($fila['estado'] ?? ''),
    ];
  }
}
