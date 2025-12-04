<?php

namespace Micodigo\Indicadores;

use PDO;

trait IndicadoresConsultasTrait
{
  protected function obtenerCompetenciaContexto(PDO $conexion, int $idCompetencia): ?array
  {
    $sql = "SELECT comp.id_competencia,
                   comp.fk_componente,
                   comp.nombre_competencia,
                   comp.descripcion_competencia,
                   comp.reutilizable,
                   ca.nombre_componente,
                   ca.estado_componente,
                   ca.fk_area,
                   aa.nombre_area,
                   aa.estado_area
              FROM competencias comp
              INNER JOIN componentes_aprendizaje ca ON ca.id_componente = comp.fk_componente
              INNER JOIN areas_aprendizaje aa ON aa.id_area_aprendizaje = ca.fk_area
             WHERE comp.id_competencia = ?
             LIMIT 1";

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$idCompetencia]);
    $fila = $sentencia->fetch(PDO::FETCH_ASSOC);

    return $fila ?: null;
  }

  protected function obtenerIndicadoresPorCompetencia(PDO $conexion, int $idCompetencia): array
  {
    $sql = "SELECT i.id_indicador,
                   i.fk_competencia,
                   i.nombre_indicador,
                   i.aspecto,
                   i.orden,
                   i.ocultar
              FROM indicadores i
             WHERE i.fk_competencia = ?
             ORDER BY i.orden ASC, i.id_indicador ASC";

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$idCompetencia]);

    $registros = [];
    while ($fila = $sentencia->fetch(PDO::FETCH_ASSOC)) {
      $registros[] = $this->normalizarSalidaIndicador($fila);
    }

    return $registros;
  }

  protected function obtenerIndicadorDetalle(PDO $conexion, int $idIndicador): ?array
  {
    $sql = "SELECT i.id_indicador,
                   i.fk_competencia,
                   i.nombre_indicador,
                   i.aspecto,
                   i.orden,
                   i.ocultar
              FROM indicadores i
             WHERE i.id_indicador = ?
             LIMIT 1";

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$idIndicador]);
    $fila = $sentencia->fetch(PDO::FETCH_ASSOC);

    return $fila ? $this->normalizarSalidaIndicador($fila) : null;
  }

  protected function existeIndicadorConOrden(
    PDO $conexion,
    int $idCompetencia,
    int $orden,
    ?int $idIgnorar = null
  ): bool {
    $sql = 'SELECT COUNT(*) FROM indicadores WHERE fk_competencia = ? AND orden = ?';
    $parametros = [$idCompetencia, $orden];

    if ($idIgnorar !== null) {
      $sql .= ' AND id_indicador <> ?';
      $parametros[] = $idIgnorar;
    }

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute($parametros);

    return (int) $sentencia->fetchColumn() > 0;
  }

  protected function existeIndicadorConNombre(
    PDO $conexion,
    int $idCompetencia,
    string $nombre,
    ?int $idIgnorar = null
  ): bool {
    $sql = 'SELECT COUNT(*) FROM indicadores WHERE fk_competencia = ? AND LOWER(nombre_indicador) = ?';
    $parametros = [$idCompetencia, mb_strtolower($nombre)];

    if ($idIgnorar !== null) {
      $sql .= ' AND id_indicador <> ?';
      $parametros[] = $idIgnorar;
    }

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute($parametros);

    return (int) $sentencia->fetchColumn() > 0;
  }

  protected function normalizarSalidaIndicador(array $fila): array
  {
    return [
      'id_indicador' => (int) $fila['id_indicador'],
      'fk_competencia' => (int) $fila['fk_competencia'],
      'nombre_indicador' => (string) $fila['nombre_indicador'],
      'aspecto' => (string) $fila['aspecto'],
      'orden' => (int) $fila['orden'],
      'ocultar' => (string) $fila['ocultar'],
    ];
  }
}
