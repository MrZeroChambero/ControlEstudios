<?php

namespace Micodigo\ComponentesAprendizaje;

use PDO;

trait ComponentesAprendizajeConsultasTrait
{
  public function consultarComponentesCompletos(PDO $conexion): array
  {
    $sql = 'SELECT c.id_componente,
                       c.grupo,
                       c.fk_area,
                       c.nombre_componente,
                       c.especialista,
                       c.evalua,
                       c.estado_componente,
                       a.nombre_area,
                       a.estado_area
                FROM componentes_aprendizaje c
                LEFT JOIN areas_aprendizaje a ON a.id_area_aprendizaje = c.fk_area
                ORDER BY c.nombre_componente';

    $registros = $this->ejecutarConsulta($conexion, $sql);
    return array_map(fn(array $fila): array => $this->mapearMetadatosComponente($fila), $registros);
  }

  public function consultarPorId(PDO $conexion, int $idComponente): ?array
  {
    $sql = 'SELECT c.id_componente,
                        c.grupo,
                       c.fk_area,
                       c.nombre_componente,
                       c.especialista,
                       c.evalua,
                       c.estado_componente,
                       a.nombre_area,
                       a.estado_area
                FROM componentes_aprendizaje c
                LEFT JOIN areas_aprendizaje a ON a.id_area_aprendizaje = c.fk_area
                WHERE c.id_componente = ?';

    $registro = $this->ejecutarConsultaUnica($conexion, $sql, [$idComponente]);
    return $registro === null ? null : $this->mapearMetadatosComponente($registro);
  }

  public function existePorId(PDO $conexion, int $idComponente): bool
  {
    $sql = 'SELECT COUNT(*) FROM componentes_aprendizaje WHERE id_componente = ?';
    $total = (int)$this->ejecutarValor($conexion, $sql, [$idComponente]);
    return $total > 0;
  }

  public function consultarActivos(PDO $conexion): array
  {
    $sql = "SELECT id_componente,
                       fk_area,
                       nombre_componente,
                       especialista,
                       grupo,
                       evalua,
                       estado_componente
                FROM componentes_aprendizaje
                WHERE estado_componente = 'activo'
                ORDER BY nombre_componente";

    $registros = $this->ejecutarConsulta($conexion, $sql);
    return array_map(fn(array $fila): array => $this->mapearMetadatosComponente($fila), $registros);
  }

  public function consultarParaSelect(PDO $conexion): array
  {
    $sql = "SELECT id_componente AS id,
                       nombre_componente AS nombre,
                       fk_area,
                       grupo,
                FROM componentes_aprendizaje
                WHERE estado_componente = 'activo'
                ORDER BY nombre_componente";

    return $this->ejecutarConsulta($conexion, $sql);
  }

  protected function contarDependencias(PDO $conexion, int $idComponente): array
  {
    $tablas = [
      ['tabla' => 'competencias', 'campo' => 'fk_componente'],
      ['tabla' => 'contenidos', 'campo' => 'fk_componente'],
      ['tabla' => 'horarios', 'campo' => 'fk_componente'],
      ['tabla' => 'imparte', 'campo' => 'fk_componente'],
      ['tabla' => 'planificaciones', 'campo' => 'fk_componente'],
    ];

    $dependencias = [];

    foreach ($tablas as $info) {
      $sql = "SELECT COUNT(*) FROM {$info['tabla']} WHERE {$info['campo']} = ?";
      $total = (int)$this->ejecutarValor($conexion, $sql, [$idComponente]);
      if ($total > 0) {
        $dependencias[] = [
          'tabla' => $info['tabla'],
          'cantidad' => $total,
        ];
      }
    }

    return $dependencias;
  }

  protected function areaExiste(PDO $conexion, int $idArea): bool
  {
    $sql = 'SELECT COUNT(*) FROM areas_aprendizaje WHERE id_area_aprendizaje = ?';
    $total = (int)$this->ejecutarValor($conexion, $sql, [$idArea]);
    return $total > 0;
  }

  protected function mapearMetadatosComponente(array $registro): array
  {
    $tipoDocente = $this->normalizarTipoDocente($registro['especialista'] ?? null) ?? 'Docente de aula';
    $codigoTipo = $this->obtenerCodigoTipoDocente($tipoDocente) ?? 'aula';

    $registro['especialista'] = $tipoDocente;
    $registro['tipo_docente'] = $codigoTipo;
    $registro['requiere_especialista'] = in_array($codigoTipo, ['especialista', 'cultura'], true);
    $registro['es_cultura'] = $codigoTipo === 'cultura';
    $registro['es_docente_aula'] = $codigoTipo === 'aula';
    $registro['grupo'] = $registro['grupo'] ?? 'Completo';

    return $registro;
  }
}
