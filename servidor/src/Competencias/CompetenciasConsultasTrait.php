<?php

namespace Micodigo\Competencias;

use PDO;
use Exception;

trait CompetenciasConsultasTrait
{
  protected function obtenerComponenteConArea(PDO $conexion, int $idComponente): ?array
  {
    $sql = "SELECT c.id_componente,
                   c.nombre_componente,
                   c.estado_componente,
                   c.fk_area,
                   a.nombre_area,
                   a.estado_area
              FROM componentes_aprendizaje c
              INNER JOIN areas_aprendizaje a ON a.id_area_aprendizaje = c.fk_area
             WHERE c.id_componente = ?
             LIMIT 1";

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$idComponente]);
    $resultado = $sentencia->fetch(PDO::FETCH_ASSOC);

    return $resultado ?: null;
  }

  protected function existeCompetenciaConNombre(
    PDO $conexion,
    int $idComponente,
    string $nombre,
    ?int $idIgnorar = null
  ): bool {
    $parametros = [$idComponente, mb_strtolower($nombre)];
    $sql = "SELECT COUNT(*)
              FROM competencias
             WHERE fk_componente = ?
               AND LOWER(nombre_competencia) = ?";

    if ($idIgnorar !== null) {
      $sql .= " AND id_competencia <> ?";
      $parametros[] = $idIgnorar;
    }

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute($parametros);

    return (int) $sentencia->fetchColumn() > 0;
  }

  protected function obtenerCompetenciaDetalle(PDO $conexion, int $idCompetencia): ?array
  {
    $sql = "SELECT c.id_competencia,
                   c.fk_componente,
                   c.nombre_competencia,
                   c.descripcion_competencia,
                   c.reutilizable,
                   comp.nombre_componente,
                   comp.estado_componente,
                   comp.fk_area,
                   area.nombre_area,
                   area.estado_area
              FROM competencias c
              INNER JOIN componentes_aprendizaje comp ON comp.id_componente = c.fk_componente
              INNER JOIN areas_aprendizaje area ON area.id_area_aprendizaje = comp.fk_area
             WHERE c.id_competencia = ?
             LIMIT 1";

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$idCompetencia]);
    $fila = $sentencia->fetch(PDO::FETCH_ASSOC);

    if (!$fila) {
      return null;
    }

    $indicadores = $this->obtenerIndicadoresAgrupados($conexion, [$idCompetencia]);
    $fila['indicadores'] = $indicadores[$idCompetencia] ?? [];
    $fila['total_indicadores'] = count($fila['indicadores']);

    return $this->normalizarSalidaCompetencia($fila);
  }

  protected function obtenerCompetencias(PDO $conexion, ?int $idArea = null, ?int $idComponente = null): array
  {
    $parametros = [];
    $filtros = [];

    $sql = "SELECT c.id_competencia,
                   c.fk_componente,
                   c.nombre_competencia,
                   c.descripcion_competencia,
                   c.reutilizable,
                   comp.nombre_componente,
                   comp.estado_componente,
                   comp.fk_area,
                   area.nombre_area,
                   area.estado_area
              FROM competencias c
              INNER JOIN componentes_aprendizaje comp ON comp.id_componente = c.fk_componente
              INNER JOIN areas_aprendizaje area ON area.id_area_aprendizaje = comp.fk_area
             WHERE comp.estado_componente = 'activo'
               AND area.estado_area = 'activo'";

    if ($idArea !== null) {
      $sql .= " AND comp.fk_area = ?";
      $parametros[] = $idArea;
      $filtros['area'] = $idArea;
    }

    if ($idComponente !== null) {
      $sql .= " AND comp.id_componente = ?";
      $parametros[] = $idComponente;
      $filtros['componente'] = $idComponente;
    }

    $sql .= " ORDER BY area.nombre_area ASC, comp.nombre_componente ASC, c.nombre_competencia ASC";

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute($parametros);
    $registros = $sentencia->fetchAll(PDO::FETCH_ASSOC);

    if (empty($registros)) {
      return [];
    }

    $ids = array_map(static fn($fila) => (int) $fila['id_competencia'], $registros);
    $indicadores = $this->obtenerIndicadoresAgrupados($conexion, $ids);

    $salida = [];
    foreach ($registros as $fila) {
      $id = (int) $fila['id_competencia'];
      $fila['indicadores'] = $indicadores[$id] ?? [];
      $fila['total_indicadores'] = count($fila['indicadores']);
      $salida[] = $this->normalizarSalidaCompetencia($fila);
    }

    return $salida;
  }

  protected function obtenerIndicadoresAgrupados(PDO $conexion, array $idsCompetencias): array
  {
    if (empty($idsCompetencias)) {
      return [];
    }

    $placeholders = implode(',', array_fill(0, count($idsCompetencias), '?'));
    $sql = "SELECT i.id_indicador,
                   i.fk_competencia,
                   i.nombre_indicador,
                   i.aspecto,
                   i.orden,
                   i.ocultar
              FROM indicadores i
             WHERE i.fk_competencia IN ($placeholders)
             ORDER BY i.fk_competencia ASC, i.orden ASC, i.id_indicador ASC";

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute($idsCompetencias);

    $agrupado = [];
    while ($fila = $sentencia->fetch(PDO::FETCH_ASSOC)) {
      $fk = (int) $fila['fk_competencia'];
      if (!isset($agrupado[$fk])) {
        $agrupado[$fk] = [];
      }

      $agrupado[$fk][] = [
        'id_indicador' => (int) $fila['id_indicador'],
        'fk_competencia' => $fk,
        'nombre_indicador' => $fila['nombre_indicador'],
        'aspecto' => $fila['aspecto'],
        'orden' => (int) $fila['orden'],
        'ocultar' => $fila['ocultar'],
      ];
    }

    return $agrupado;
  }

  protected function normalizarSalidaCompetencia(array $fila): array
  {
    return [
      'id_competencia' => (int) $fila['id_competencia'],
      'fk_componente' => (int) $fila['fk_componente'],
      'nombre_competencia' => (string) $fila['nombre_competencia'],
      'descripcion_competencia' => (string) $fila['descripcion_competencia'],
      'reutilizable' => (string) $fila['reutilizable'],
      'componente' => [
        'id' => (int) $fila['fk_componente'],
        'nombre' => (string) $fila['nombre_componente'],
        'estado' => (string) $fila['estado_componente'],
        'fk_area' => (int) $fila['fk_area'],
      ],
      'area' => [
        'id' => (int) $fila['fk_area'],
        'nombre' => (string) $fila['nombre_area'],
        'estado' => (string) $fila['estado_area'],
      ],
      'indicadores' => $fila['indicadores'] ?? [],
      'total_indicadores' => (int) ($fila['total_indicadores'] ?? 0),
    ];
  }
}
