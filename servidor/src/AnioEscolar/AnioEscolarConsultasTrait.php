<?php

namespace Micodigo\AnioEscolar;

use Exception;
use PDO;

trait AnioEscolarConsultasTrait
{
  protected ?bool $momentosTablaDisponible = null;

  public function consultarAniosCompletos(PDO $conexion): array
  {
    $conteoAulas = $this->obtenerConteoAulas($conexion);

    if ($this->momentosTablaDisponible($conexion)) {
      $sql = 'SELECT a.*,
            m.id_momento,
            m.fk_anio_escolar AS momento_anio,
            m.nombre_momento AS momento_codigo,
            m.fecha_inicio AS momento_inicio,
            m.fecha_fin AS momento_fin,
            m.estado_momento AS momento_estado
          FROM anios_escolares a
          LEFT JOIN momentos m ON m.fk_anio_escolar = a.id_anio_escolar
          ORDER BY a.fecha_inicio DESC, m.nombre_momento ASC';

      try {
        $filas = $this->ejecutarConsulta($conexion, $sql);
      } catch (Exception $excepcion) {
        if ($this->esErrorTablaMomentosInexistente($excepcion)) {
          $this->momentosTablaDisponible = false;
          return $this->consultarAniosSinMomentos($conexion, $conteoAulas);
        }
        throw $excepcion;
      }

      $resultado = [];
      foreach ($filas as $fila) {
        $id = (int) $fila['id_anio_escolar'];
        if (!isset($resultado[$id])) {
          $resultado[$id] = $this->construirRegistroAnio($fila, $conteoAulas);
        }

        if (!empty($fila['id_momento'])) {
          $resultado[$id]['momentos'][] = $this->transformarMomentoDesdeConsulta([
            'id_momento' => $fila['id_momento'],
            'fk_anio_escolar' => $fila['momento_anio'] ?? $id,
            'nombre_momento' => $fila['momento_codigo'],
            'momento_estado' => $fila['momento_estado'],
            'fecha_inicio' => $fila['momento_inicio'],
            'fecha_fin' => $fila['momento_fin'],
          ]);
        }
      }

      return array_values($resultado);
    }

    return $this->consultarAniosSinMomentos($conexion, $conteoAulas);
  }

  public function consultarPorId(PDO $conexion, int $idAnio): ?array
  {
    $sql = 'SELECT a.*
          FROM anios_escolares a
          WHERE id_anio_escolar = ?';

    $anio = $this->ejecutarConsultaUnica($conexion, $sql, [$idAnio]);
    if ($anio === null) {
      return null;
    }

    $anio['id'] = (int) $anio['id_anio_escolar'];
    $anio['nombre'] = $this->resolverNombreAnio($anio);
    $limite = $this->resolverFechaLimite($anio);
    $anio['fecha_limite_inscripcion'] = $limite;
    $anio['limite_inscripcion'] = $limite;
    $anio['fecha_final'] = $anio['fecha_fin'];
    $anio['momentos'] = $this->consultarMomentosPorAnio($conexion, $idAnio);
    $conteo = $this->obtenerConteoAulas($conexion);
    $anio['aulas_asignadas'] = $conteo[$idAnio] ?? 0;
    $anio['tiene_aulas'] = $anio['aulas_asignadas'] > 0;

    return $anio;
  }

  public function consultarMomentosPorAnio(PDO $conexion, int $idAnio): array
  {
    if (!$this->momentosTablaDisponible($conexion)) {
      return [];
    }

    $sql = 'SELECT id_momento,
             fk_anio_escolar,
             nombre_momento,
             fecha_inicio,
             fecha_fin,
             estado_momento
           FROM momentos
           WHERE fk_anio_escolar = ?
           ORDER BY nombre_momento ASC';

    try {
      $momentos = $this->ejecutarConsulta($conexion, $sql, [$idAnio]);
    } catch (Exception $excepcion) {
      if ($this->esErrorTablaMomentosInexistente($excepcion)) {
        $this->momentosTablaDisponible = false;
        return [];
      }
      throw $excepcion;
    }

    return array_map(function (array $registro) {
      return $this->transformarMomentoDesdeConsulta($registro);
    }, $momentos);
  }

  protected function transformarMomentoDesdeConsulta(array $registro): array
  {
    $codigo = $registro['nombre_momento'] ?? $registro['momento_codigo'] ?? $registro['orden'] ?? null;
    $codigo = is_string($codigo) ? trim($codigo) : $codigo;

    $orden = null;
    if ($codigo !== null && $codigo !== '') {
      if (is_numeric($codigo)) {
        $orden = (int) $codigo;
      } elseif (preg_match('/([1-3])/', (string) $codigo, $coincidencia)) {
        $orden = (int) $coincidencia[1];
        $codigo = (string) $coincidencia[1];
      }
    }

    $estado = $registro['estado_momento'] ?? $registro['momento_estado'] ?? $registro['estado'] ?? null;
    $estado = is_string($estado) ? strtolower($estado) : $estado;

    $nombreLegible = $registro['momento_nombre'] ?? ($orden !== null ? sprintf('Momento %d', $orden) : ($codigo ?? null));

    $fechaFin = $registro['fecha_fin'] ?? $registro['momento_fin'] ?? $registro['fecha_final'] ?? null;
    $fechaInicio = $registro['fecha_inicio'] ?? $registro['momento_inicio'] ?? null;

    return [
      'id' => isset($registro['id_momento']) ? (int) $registro['id_momento'] : 0,
      'id_momento' => isset($registro['id_momento']) ? (int) $registro['id_momento'] : 0,
      'fk_anio_escolar' => isset($registro['fk_anio_escolar']) ? (int) $registro['fk_anio_escolar'] : 0,
      'orden' => $orden,
      'nombre_momento' => $codigo,
      'nombre' => $nombreLegible,
      'momento_nombre' => $nombreLegible,
      'fecha_inicio' => $fechaInicio,
      'fecha_fin' => $fechaFin,
      'fecha_final' => $fechaFin,
      'estado' => $estado,
      'estado_momento' => $estado,
      'momento_estado' => $estado,
    ];
  }

  public function existePorId(PDO $conexion, int $idAnio): bool
  {
    $sql = 'SELECT COUNT(*) FROM anios_escolares WHERE id_anio_escolar = ?';
    $total = (int) $this->ejecutarValor($conexion, $sql, [$idAnio]);
    return $total > 0;
  }

  protected function obtenerConteoAulas(PDO $conexion): array
  {
    $sql = 'SELECT fk_anio_escolar, COUNT(*) AS total FROM aula GROUP BY fk_anio_escolar';
    $filas = $this->ejecutarConsulta($conexion, $sql);

    $conteo = [];
    foreach ($filas as $fila) {
      $conteo[(int) $fila['fk_anio_escolar']] = (int) $fila['total'];
    }

    return $conteo;
  }

  protected function tieneAulasAsociadas(PDO $conexion, int $idAnio): bool
  {
    $sql = 'SELECT COUNT(*) FROM aula WHERE fk_anio_escolar = ?';
    $total = (int) $this->ejecutarValor($conexion, $sql, [$idAnio]);
    return $total > 0;
  }

  protected function existeConEstado(PDO $conexion, array $estados, ?int $ignorarId = null): bool
  {
    if (empty($estados)) {
      return false;
    }

    $placeholders = implode(',', array_fill(0, count($estados), '?'));
    $sql = 'SELECT COUNT(*) FROM anios_escolares WHERE estado IN (' . $placeholders . ')';
    $parametros = array_values($estados);

    if ($ignorarId !== null) {
      $sql .= ' AND id_anio_escolar <> ?';
      $parametros[] = $ignorarId;
    }

    $total = (int) $this->ejecutarValor($conexion, $sql, $parametros);
    return $total > 0;
  }

  protected function momentosTablaDisponible(PDO $conexion): bool
  {
    if ($this->momentosTablaDisponible !== null) {
      return $this->momentosTablaDisponible;
    }

    try {
      $sql = 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ? LIMIT 1';
      $total = (int) $this->ejecutarValor($conexion, $sql, ['momentos']);
      $this->momentosTablaDisponible = $total > 0;
      return $this->momentosTablaDisponible;
    } catch (Exception $excepcion) {
      $this->momentosTablaDisponible = false;
      return false;
    }
  }

  protected function consultarAniosSinMomentos(PDO $conexion, array $conteoAulas): array
  {
    $sql = 'SELECT a.*
            FROM anios_escolares a
            ORDER BY fecha_inicio DESC';

    $filas = $this->ejecutarConsulta($conexion, $sql);

    return array_map(function (array $fila) use ($conteoAulas) {
      return $this->construirRegistroAnio($fila, $conteoAulas);
    }, $filas);
  }

  protected function esErrorTablaMomentosInexistente(Exception $excepcion): bool
  {
    $previa = $excepcion->getPrevious();
    if ($previa instanceof \PDOException) {
      return $previa->getCode() === '42S02';
    }

    return str_contains(strtolower($excepcion->getMessage()), 'base table or view not found');
  }

  protected function construirRegistroAnio(array $fila, array $conteoAulas): array
  {
    $id = (int) ($fila['id_anio_escolar'] ?? 0);
    $limite = $this->resolverFechaLimite($fila);

    return [
      'id' => $id,
      'id_anio_escolar' => $id,
      'nombre' => $this->resolverNombreAnio($fila),
      'fecha_inicio' => $fila['fecha_inicio'] ?? null,
      'fecha_fin' => $fila['fecha_fin'] ?? null,
      'fecha_final' => $fila['fecha_fin'] ?? null,
      'fecha_limite_inscripcion' => $limite,
      'limite_inscripcion' => $limite,
      'estado' => $fila['estado'] ?? 'incompleto',
      'aulas_asignadas' => $conteoAulas[$id] ?? 0,
      'tiene_aulas' => ($conteoAulas[$id] ?? 0) > 0,
      'momentos' => [],
    ];
  }

  protected function resolverFechaLimite(array $fila): ?string
  {
    if (!empty($fila['fecha_limite_inscripcion'])) {
      return $fila['fecha_limite_inscripcion'];
    }

    if (!empty($fila['limite_inscripcion'])) {
      return $fila['limite_inscripcion'];
    }

    return $fila['fecha_inicio'] ?? null;
  }

  protected function resolverNombreAnio(array $fila): string
  {
    $nombre = $fila['nombre'] ?? null;
    if (is_string($nombre) && trim($nombre) !== '') {
      return trim($nombre);
    }

    $inicio = $fila['fecha_inicio'] ?? null;
    if ($inicio !== null) {
      try {
        $dt = new \DateTime($inicio);
        $anioBase = (int) $dt->format('Y');
        return sprintf('Año Escolar %d-%d', $anioBase, $anioBase + 1);
      } catch (\Exception $ignore) {
        // ignorar y continuar con fallback
      }
    }

    $id = $fila['id_anio_escolar'] ?? null;
    return $id !== null ? sprintf('Año Escolar #%s', $id) : 'Año Escolar';
  }
}
