<?php

namespace Micodigo\Contenidos;

use PDO;

trait ContenidosConsultasTrait
{
  public function consultarContenidosCompletos(PDO $conexion): array
  {
    $sql = 'SELECT c.id_contenido,
                       c.fk_componente,
                       c.nombre_contenido,
                       c.grado,
                       c.descripcion,
                       c.estado,
                       comp.nombre_componente,
                       comp.estado_componente,
                       comp.fk_area,
                       area.nombre_area,
                       area.estado_area
                FROM contenidos c
                LEFT JOIN componentes_aprendizaje comp ON comp.id_componente = c.fk_componente
                LEFT JOIN areas_aprendizaje area ON area.id_area_aprendizaje = comp.fk_area
                ORDER BY c.nombre_contenido';

    return $this->ejecutarConsulta($conexion, $sql);
  }

  public function consultarPorId(PDO $conexion, int $idContenido): ?array
  {
    $sql = 'SELECT c.id_contenido,
                       c.fk_componente,
                       c.nombre_contenido,
                       c.grado,
                       c.descripcion,
                       c.estado,
                       comp.nombre_componente,
                       comp.estado_componente,
                       comp.fk_area,
                       area.nombre_area,
                       area.estado_area
                FROM contenidos c
                LEFT JOIN componentes_aprendizaje comp ON comp.id_componente = c.fk_componente
                LEFT JOIN areas_aprendizaje area ON area.id_area_aprendizaje = comp.fk_area
                WHERE c.id_contenido = ?';

    return $this->ejecutarConsultaUnica($conexion, $sql, [$idContenido]);
  }

  public function existePorId(PDO $conexion, int $idContenido): bool
  {
    $sql = 'SELECT COUNT(*) FROM contenidos WHERE id_contenido = ?';
    $total = (int)$this->ejecutarValor($conexion, $sql, [$idContenido]);
    return $total > 0;
  }

  public function consultarActivos(PDO $conexion): array
  {
    $sql = "SELECT id_contenido,
                       fk_componente,
                       nombre_contenido,
                       grado,
                       descripcion,
                       estado
                FROM contenidos
                WHERE estado = 'activo'
                ORDER BY nombre_contenido";

    return $this->ejecutarConsulta($conexion, $sql);
  }

  public function consultarParaSelect(PDO $conexion): array
  {
    $sql = "SELECT id_contenido AS id,
                       nombre_contenido AS nombre,
                       fk_componente,
                       grado
                FROM contenidos
                WHERE estado = 'activo'
                ORDER BY nombre_contenido";

    return $this->ejecutarConsulta($conexion, $sql);
  }

  protected function contarDependencias(PDO $conexion, int $idContenido): array
  {
    $tablas = [
      ['tabla' => 'temas', 'campo' => 'fk_contenido'],
      ['tabla' => 'contenido_indicador', 'campo' => 'fk_contenido'],
    ];

    $dependencias = [];

    foreach ($tablas as $info) {
      $sql = "SELECT COUNT(*) FROM {$info['tabla']} WHERE {$info['campo']} = ?";
      $total = (int)$this->ejecutarValor($conexion, $sql, [$idContenido]);

      if ($total > 0) {
        $dependencias[] = [
          'tabla' => $info['tabla'],
          'cantidad' => $total,
        ];
      }
    }

    return $dependencias;
  }

  protected function componenteExiste(PDO $conexion, int $idComponente): bool
  {
    $sql = 'SELECT COUNT(*) FROM componentes_aprendizaje WHERE id_componente = ?';
    $total = (int)$this->ejecutarValor($conexion, $sql, [$idComponente]);
    return $total > 0;
  }

  protected function componenteActivo(PDO $conexion, int $idComponente): bool
  {
    $sql = "SELECT estado_componente FROM componentes_aprendizaje WHERE id_componente = ?";
    $estado = $this->ejecutarValor($conexion, $sql, [$idComponente]);
    return $estado === 'activo';
  }
}
