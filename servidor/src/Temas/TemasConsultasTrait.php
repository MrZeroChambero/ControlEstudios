<?php

namespace Micodigo\Temas;

use PDO;

trait TemasConsultasTrait
{
  public function consultarTemasPorContenido(PDO $conexion, int $idContenido): array
  {
    $sql = 'SELECT t.id_tema,
                       t.fk_contenido,
                       t.nombre_tema,
                       t.estado,
                       c.nombre_contenido,
                       c.grado,
                       c.estado AS estado_contenido,
                       comp.id_componente,
                       comp.nombre_componente,
                       comp.estado_componente,
                       area.id_area_aprendizaje,
                       area.nombre_area
                FROM temas t
                INNER JOIN contenidos c ON c.id_contenido = t.fk_contenido
                LEFT JOIN componentes_aprendizaje comp ON comp.id_componente = c.fk_componente
                LEFT JOIN areas_aprendizaje area ON area.id_area_aprendizaje = comp.fk_area
                WHERE t.fk_contenido = ?
                ORDER BY t.nombre_tema';

    return $this->ejecutarConsulta($conexion, $sql, [$idContenido]);
  }

  public function consultarPorId(PDO $conexion, int $idTema): ?array
  {
    $sql = 'SELECT t.id_tema,
                       t.fk_contenido,
                       t.nombre_tema,
                       t.estado,
                       c.nombre_contenido,
                       c.grado,
                       c.estado AS estado_contenido,
                       comp.id_componente,
                       comp.nombre_componente,
                       comp.estado_componente,
                       area.id_area_aprendizaje,
                       area.nombre_area
                FROM temas t
                INNER JOIN contenidos c ON c.id_contenido = t.fk_contenido
                LEFT JOIN componentes_aprendizaje comp ON comp.id_componente = c.fk_componente
                LEFT JOIN areas_aprendizaje area ON area.id_area_aprendizaje = comp.fk_area
                WHERE t.id_tema = ?';

    return $this->ejecutarConsultaUnica($conexion, $sql, [$idTema]);
  }

  public function existePorId(PDO $conexion, int $idTema): bool
  {
    $sql = 'SELECT COUNT(*) FROM temas WHERE id_tema = ?';
    $total = (int)$this->ejecutarValor($conexion, $sql, [$idTema]);
    return $total > 0;
  }

  public function consultarParaSelect(PDO $conexion, ?int $idContenido = null): array
  {
    $sql = "SELECT id_tema AS id, nombre_tema AS nombre, fk_contenido
            FROM temas
            WHERE estado = 'activo'";
    $parametros = [];

    if ($idContenido !== null) {
      $sql .= ' AND fk_contenido = ?';
      $parametros[] = $idContenido;
    }

    $sql .= ' ORDER BY nombre_tema';

    return $this->ejecutarConsulta($conexion, $sql, $parametros);
  }

  protected function contenidoExiste(PDO $conexion, int $idContenido): bool
  {
    $sql = 'SELECT COUNT(*) FROM contenidos WHERE id_contenido = ?';
    $total = (int)$this->ejecutarValor($conexion, $sql, [$idContenido]);
    return $total > 0;
  }

  protected function contenidoActivo(PDO $conexion, int $idContenido): bool
  {
    $sql = 'SELECT estado FROM contenidos WHERE id_contenido = ?';
    $estado = $this->ejecutarValor($conexion, $sql, [$idContenido]);
    return $estado === 'activo';
  }

  protected function nombreDuplicado(PDO $conexion, int $idContenido, string $nombreTema, ?int $idIgnorar = null): bool
  {
    $sql = 'SELECT COUNT(*)
                FROM temas
                WHERE fk_contenido = ?
                  AND LOWER(nombre_tema) = LOWER(?)';
    $parametros = [$idContenido, $nombreTema];

    if ($idIgnorar !== null) {
      $sql .= ' AND id_tema <> ?';
      $parametros[] = $idIgnorar;
    }

    $total = (int)$this->ejecutarValor($conexion, $sql, $parametros);
    return $total > 0;
  }
}
