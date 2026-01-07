<?php

namespace Micodigo\PlanificacionAcademica;

use PDO;

trait PlanificacionAcademicaAsignacionesTrait
{
  protected function consultarAsignacionDocente(PDO $pdo, int $docenteId, int $momentoId): array
  {
    $sql = <<<SQL
SELECT
  i.fk_aula,
  i.fk_componente,
  i.tipo_docente,
  a.fk_anio_escolar,
  a.estado AS estado_aula,
  gs.grado,
  gs.seccion,
  c.nombre_componente,
  c.estado_componente
FROM imparte i
INNER JOIN aula a ON a.id_aula = i.fk_aula
INNER JOIN grado_seccion gs ON gs.id_grado_seccion = a.fk_grado_seccion
INNER JOIN componentes_aprendizaje c ON c.id_componente = i.fk_componente
WHERE i.fk_personal = :docente
  AND i.fk_momento = :momento
ORDER BY c.nombre_componente ASC
SQL;

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
      ':docente' => $docenteId,
      ':momento' => $momentoId,
    ]);

    $filas = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    $componentes = [];
    $aula = null;

    foreach ($filas as $fila) {
      if ($aula === null) {
        $aula = [
          'id_aula' => (int) $fila['fk_aula'],
          'anio_escolar' => (int) $fila['fk_anio_escolar'],
          'grado' => isset($fila['grado']) ? (int) $fila['grado'] : null,
          'seccion' => $fila['seccion'] ?? null,
          'estado' => $fila['estado_aula'] ?? null,
        ];
      }

      $idComponente = (int) $fila['fk_componente'];
      if (!isset($componentes[$idComponente])) {
        $componentes[$idComponente] = [
          'id' => $idComponente,
          'nombre' => $fila['nombre_componente'],
          'estado' => $fila['estado_componente'],
          'tipo_docente' => strtolower((string) $fila['tipo_docente']),
        ];
      }
    }

    return [
      'docente_id' => $docenteId,
      'momento_id' => $momentoId,
      'aula' => $aula,
      'componentes' => array_values($componentes),
      'tiene_asignaciones' => $aula !== null,
    ];
  }
}
