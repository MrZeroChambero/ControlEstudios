<?php

namespace Micodigo\GradosSecciones;

use Exception;
use PDO;

trait ConsultasGradosSecciones
{
  public static function consultarTodosLosGradosSecciones($pdo)
  {
    return self::consultarGradosSeccionesPorFiltro($pdo);
  }

  public static function consultarGradosSeccionesActivos($pdo)
  {
    return self::consultarGradosSeccionesPorFiltro($pdo, ['estado' => 'activo']);
  }

  public static function consultarGradosSeccionesPorFiltro($pdo, array $filtros = [])
  {
    try {
      $condiciones = [];
      $parametros = [];

      $estado = self::normalizarEstado($filtros['estado'] ?? null);
      if ($estado !== null) {
        $condiciones[] = 'estado = :estado';
        $parametros[':estado'] = $estado;
      }

      $grados = self::normalizarListado($filtros['grados'] ?? null);
      if (!empty($grados)) {
        $condiciones[] = self::construirClausulaIn('grado', $grados, $parametros);
      }

      $secciones = self::normalizarListado($filtros['secciones'] ?? null);
      if (!empty($secciones)) {
        $condiciones[] = self::construirClausulaIn('seccion', $secciones, $parametros);
      }

      $sql = 'SELECT * FROM grados_secciones';
      if (!empty($condiciones)) {
        $sql .= ' WHERE ' . implode(' AND ', $condiciones);
      }
      $sql .= ' ORDER BY grado, seccion';

      $stmt = $pdo->prepare($sql);
      $stmt->execute($parametros);
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception('Error al consultar grados y secciones: ' . $e->getMessage());
    }
  }

  public static function consultarGradoSeccionPorId($pdo, $id)
  {
    try {
      $sql = 'SELECT * FROM grados_secciones WHERE id_grado_seccion = ?';
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception('Error al obtener grado-sección por id: ' . $e->getMessage());
    }
  }

  private static function normalizarListado($entrada)
  {
    if ($entrada === null) return [];
    if (!is_array($entrada)) $entrada = [$entrada];

    $resultado = [];
    foreach ($entrada as $valor) {
      if ($valor === null) continue;
      $valor = trim((string)$valor);
      if ($valor === '') continue;
      $resultado[] = $valor;
    }

    return array_values(array_unique($resultado));
  }

  private static function normalizarEstado($estado)
  {
    if ($estado === null) return null;
    $estado = strtolower(trim((string)$estado));
    if ($estado === '') return null;
    return $estado;
  }

  private static function construirClausulaIn($campo, array $valores, array &$parametros)
  {
    $placeholders = [];
    foreach ($valores as $indice => $valor) {
      $placeholder = ':' . $campo . '_' . $indice;
      $placeholders[] = $placeholder;
      $parametros[$placeholder] = $valor;
    }

    return sprintf('%s IN (%s)', $campo, implode(', ', $placeholders));
  }
}
