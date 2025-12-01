<?php

namespace Micodigo\AreasAprendizaje;

use PDO;

trait AreasAprendizajeConsultasTrait
{
  public function consultarTodos(PDO $conexion): array
  {
    $sql = 'SELECT id_area_aprendizaje, nombre_area, estado_area FROM areas_aprendizaje ORDER BY nombre_area';
    return $this->ejecutarConsulta($conexion, $sql);
  }

  public function consultarActivos(PDO $conexion): array
  {
    $sql = "SELECT id_area_aprendizaje, nombre_area, estado_area FROM areas_aprendizaje WHERE estado_area = 'activo' ORDER BY nombre_area";
    return $this->ejecutarConsulta($conexion, $sql);
  }

  public function existePorId(PDO $conexion, int $idArea): bool
  {
    $sql = 'SELECT COUNT(*) FROM areas_aprendizaje WHERE id_area_aprendizaje = ?';
    $total = (int)$this->ejecutarValor($conexion, $sql, [$idArea]);
    return $total > 0;
  }

  public function consultarPorId(PDO $conexion, int $idArea): ?array
  {
    $sql = 'SELECT id_area_aprendizaje, nombre_area, estado_area FROM areas_aprendizaje WHERE id_area_aprendizaje = ?';
    return $this->ejecutarConsultaUnica($conexion, $sql, [$idArea]);
  }

  public function consultarAreaConComponentes(PDO $conexion, int $idArea): ?array
  {
    $sql = 'SELECT a.id_area_aprendizaje, a.nombre_area, a.estado_area, c.id_componente, c.nombre_componente, c.especialista, c.evalua, c.estado_componente
      FROM areas_aprendizaje a
      LEFT JOIN componentes_aprendizaje c ON c.fk_area = a.id_area_aprendizaje
      WHERE a.id_area_aprendizaje = ?
      ORDER BY c.nombre_componente';

    $filas = $this->ejecutarConsulta($conexion, $sql, [$idArea]);
    if (empty($filas)) {
      return null;
    }

    $areas = $this->agruparAreas($filas);
    return $areas[0] ?? null;
  }

  public function consultarAreasCompletas(PDO $conexion): array
  {
    $sql = 'SELECT a.id_area_aprendizaje, a.nombre_area, a.estado_area, c.id_componente, c.nombre_componente, c.especialista, c.evalua, c.estado_componente
      FROM areas_aprendizaje a
      LEFT JOIN componentes_aprendizaje c ON c.fk_area = a.id_area_aprendizaje
      ORDER BY a.nombre_area, c.nombre_componente';

    $filas = $this->ejecutarConsulta($conexion, $sql);
    if (empty($filas)) {
      return [];
    }

    return $this->agruparAreas($filas);
  }

  public function consultarParaSelect(PDO $conexion): array
  {
    $sql = "SELECT id_area_aprendizaje AS id, nombre_area AS nombre FROM areas_aprendizaje WHERE estado_area = 'activo' ORDER BY nombre_area";
    return $this->ejecutarConsulta($conexion, $sql);
  }

  protected function contarComponentesAsociados(PDO $conexion, int $idArea): int
  {
    $sql = 'SELECT COUNT(*) FROM componentes_aprendizaje WHERE fk_area = ?';
    return (int)$this->ejecutarValor($conexion, $sql, [$idArea]);
  }

  private function agruparAreas(array $filas): array
  {
    $agrupadas = [];

    foreach ($filas as $fila) {
      $idArea = (int)$fila['id_area_aprendizaje'];
      if (!isset($agrupadas[$idArea])) {
        $agrupadas[$idArea] = [
          'id_area_aprendizaje' => $idArea,
          'nombre_area' => $fila['nombre_area'],
          'estado_area' => $fila['estado_area'],
          'componentes' => []
        ];
      }

      if (!empty($fila['id_componente'])) {
        $agrupadas[$idArea]['componentes'][] = [
          'id_componente' => (int)$fila['id_componente'],
          'nombre_componente' => $fila['nombre_componente'],
          'especialista' => $fila['especialista'],
          'evalua' => $fila['evalua'],
          'estado_componente' => $fila['estado_componente']
        ];
      }
    }

    return array_values($agrupadas);
  }
}
