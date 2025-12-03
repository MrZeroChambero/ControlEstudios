<?php

namespace Micodigo\MomentoAcademico;

use Exception;
use PDO;

trait ConsultasMomentoAcademico
{
  public static function consultarTodosLosMomentos($pdo)
  {
    try {
      $sql = "SELECT id_momento,
                     fk_anio_escolar,
                     nombre_momento,
                     fecha_inicio,
                     fecha_fin,
                     estado_momento
              FROM momentos
              ORDER BY fk_anio_escolar ASC, nombre_momento ASC";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      $filas = $stmt->fetchAll(PDO::FETCH_ASSOC);
      return array_map([self::class, 'formatearMomento'], $filas);
    } catch (Exception $e) {
      throw new Exception("Error al consultar momentos académicos: " . $e->getMessage());
    }
  }

  public static function consultarMomentoPorId($pdo, $id)
  {
    try {
      $sql = "SELECT id_momento,
                     fk_anio_escolar,
                     nombre_momento,
                     fecha_inicio,
                     fecha_fin,
                     estado_momento
              FROM momentos
              WHERE id_momento = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $registro = $stmt->fetch(PDO::FETCH_ASSOC);
      return $registro ? self::formatearMomento($registro) : null;
    } catch (Exception $e) {
      throw new Exception("Error al obtener momento por id: " . $e->getMessage());
    }
  }

  public static function consultarMomentosPorAnio($pdo, $id_anio)
  {
    try {
      $sql = "SELECT id_momento,
                     fk_anio_escolar,
                     nombre_momento,
                     fecha_inicio,
                     fecha_fin,
                     estado_momento
              FROM momentos
              WHERE fk_anio_escolar = ?
              ORDER BY nombre_momento";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id_anio]);
      $filas = $stmt->fetchAll(PDO::FETCH_ASSOC);
      return array_map([self::class, 'formatearMomento'], $filas);
    } catch (Exception $e) {
      throw new Exception("Error al consultar momentos por año: " . $e->getMessage());
    }
  }

  protected static function formatearMomento(array $registro): array
  {
    $ordenCadena = (string)($registro['nombre_momento'] ?? '');
    $orden = ctype_digit($ordenCadena) ? (int) $ordenCadena : null;
    $estado = $registro['estado_momento'] ?? null;
    $estado = is_string($estado) ? strtolower($estado) : $estado;
    $nombreLegible = $orden !== null ? sprintf('Momento %d', $orden) : ($registro['nombre'] ?? $ordenCadena);

    return [
      'id' => (int) $registro['id_momento'],
      'id_momento' => (int) $registro['id_momento'],
      'fk_anio_escolar' => (int) $registro['fk_anio_escolar'],
      'orden' => $orden,
      'nombre_momento' => $ordenCadena !== '' ? $ordenCadena : ($orden !== null ? (string) $orden : null),
      'nombre' => $nombreLegible,
      'momento_nombre' => $nombreLegible,
      'fecha_inicio' => $registro['fecha_inicio'],
      'fecha_fin' => $registro['fecha_fin'],
      'fecha_final' => $registro['fecha_fin'],
      'estado' => $estado,
      'estado_momento' => $estado,
      'momento_estado' => $estado,
    ];
  }
}
