<?php

namespace Micodigo\SistemaAnioEscolar\Traits;

use DateTime;
use PDO;

trait OperacionesAnio
{
  protected function tieneAulasAsociadas(int $anioId): bool
  {
    $stmt = $this->pdo->prepare('SELECT COUNT(*) FROM aula WHERE fk_anio_escolar = :id');
    $stmt->execute([':id' => $anioId]);
    return (int) $stmt->fetchColumn() > 0;
  }

  protected function obtenerConteoAulas(): array
  {
    $stmt = $this->pdo->query('SELECT fk_anio_escolar, COUNT(*) AS total FROM aula GROUP BY fk_anio_escolar');
    $conteo = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
      $conteo[(int) $row['fk_anio_escolar']] = (int) $row['total'];
    }
    return $conteo;
  }

  protected function obtenerMomentosPorAnio(int $anioId): array
  {
    $stmt = $this->pdo->prepare('SELECT * FROM momentos_academicos WHERE fk_anio_escolar = :id ORDER BY orden');
    $stmt->execute([':id' => $anioId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  protected function obtenerAnioPorId(int $id): ?array
  {
    $stmt = $this->pdo->prepare('SELECT * FROM anios_escolares WHERE id_anio_escolar = :id');
    $stmt->execute([':id' => $id]);
    $anio = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$anio) {
      return null;
    }

    $anio['momentos'] = $this->obtenerMomentosPorAnio($id);
    $conteo = $this->obtenerConteoAulas();
    $anio['aulas_asignadas'] = $conteo[$id] ?? 0;
    $anio['tiene_aulas'] = $this->tieneAulasAsociadas($id);

    return $anio;
  }

  protected function existeAnioConEstado(array $estados, ?int $ignorarId = null): bool
  {
    $placeholders = implode(',', array_fill(0, count($estados), '?'));
    $sql = 'SELECT COUNT(*) FROM anios_escolares WHERE estado IN (' . $placeholders . ')';
    $params = array_values($estados);

    if ($ignorarId !== null) {
      $sql .= ' AND id_anio_escolar <> ?';
      $params[] = $ignorarId;
    }

    $stmt = $this->pdo->prepare($sql);
    $stmt->execute($params);
    return (int) $stmt->fetchColumn() > 0;
  }

  protected function desactivarOtrosAnios(int $idMantener): void
  {
    $stmt = $this->pdo->prepare('UPDATE anios_escolares SET estado = "inactivo" WHERE id_anio_escolar <> :id AND estado = "activo"');
    $stmt->execute([':id' => $idMantener]);
  }

  protected function formatearRespuesta(array $data, string $message, bool $success = true, array $errors = []): array
  {
    return [
      'success' => $success,
      'message' => $message,
      'data' => $data,
      'errors' => $errors,
      'consoleLog' => sprintf('console.log("%s")', addslashes($message)),
    ];
  }

  protected function mapearMomentos(array $momentos): array
  {
    return array_map(function ($momento) {
      return [
        'id' => (int) $momento['id_momento'],
        'orden' => (int) $momento['orden'],
        'nombre' => $momento['nombre'],
        'fecha_inicio' => $momento['fecha_inicio'],
        'fecha_final' => $momento['fecha_fin'],
        'estado' => $momento['estado'],
      ];
    }, $momentos);
  }
}
