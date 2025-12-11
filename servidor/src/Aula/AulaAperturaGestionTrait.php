<?php

namespace Micodigo\Aula;

use Exception;
use PDO;
use RuntimeException;

trait AulaAperturaGestionTrait
{
  protected function sincronizarAulasConConfiguracion(
    PDO $conexion,
    int $anioId,
    array $configuracion,
    array $catalogoGrados
  ): void {
    $conexion->beginTransaction();

    try {
      foreach ($configuracion as $grado => $cantidad) {
        if (!isset($catalogoGrados[$grado])) {
          continue;
        }

        $seccionesDisponibles = $catalogoGrados[$grado];
        $requeridas = array_slice($seccionesDisponibles, 0, $cantidad);
        $sobrantes = array_slice($seccionesDisponibles, $cantidad);

        foreach ($requeridas as $seccion) {
          $this->asegurarAulaActiva($conexion, $anioId, $seccion);
        }

        foreach ($sobrantes as $seccion) {
          $this->desactivarAulaSiEsPosible($conexion, $anioId, $seccion);
        }
      }

      $conexion->commit();
    } catch (Exception $excepcion) {
      $conexion->rollBack();
      throw $excepcion;
    }
  }

  protected function asegurarAulaActiva(PDO $conexion, int $anioId, array $seccion): void
  {
    $aula = $this->buscarAulaPorGradoSeccion($conexion, $anioId, $seccion['id_grado_seccion']);

    if ($aula === null) {
      self::crearAulaBD($conexion, [
        'fk_anio_escolar' => $anioId,
        'fk_grado_seccion' => $seccion['id_grado_seccion'],
        'cupos' => 37,
        'estado' => 'activo',
      ]);
      return;
    }

    if ($aula['estado'] !== 'activo') {
      $this->actualizarEstadoBase($conexion, $aula['id_aula'], 'activo');
    }

    $inscripciones = $this->contarInscripciones($conexion, $aula['id_aula']);

    if ($inscripciones === 0 && ((int) ($aula['cupos'] ?? 0)) !== 37) {
      $this->actualizarCuposBase($conexion, $aula['id_aula'], 37);
    }
  }

  protected function desactivarAulaSiEsPosible(PDO $conexion, int $anioId, array $seccion): void
  {
    $aula = $this->buscarAulaPorGradoSeccion($conexion, $anioId, $seccion['id_grado_seccion']);

    if ($aula === null || $aula['estado'] === 'inactivo') {
      return;
    }

    $this->eliminarDocenteTitularAsignacion($conexion, $aula['id_aula']);
    $this->eliminarEspecialistasAula($conexion, $aula['id_aula']);
    $this->actualizarEstadoBase($conexion, $aula['id_aula'], 'inactivo');
  }

  protected function actualizarCuposBase(PDO $conexion, int $idAula, int $cupos): void
  {
    $sql = "UPDATE aula SET cupos = ? WHERE id_aula = ?";
    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$cupos, $idAula]);
  }

  protected function actualizarEstadoBase(PDO $conexion, int $idAula, string $estado): void
  {
    $sql = "UPDATE aula SET estado = ? WHERE id_aula = ?";
    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$estado, $idAula]);
  }

  protected function construirResumenAulas(
    PDO $conexion,
    ?int $anioId,
    array $catalogoGrados
  ): array {
    $anio = null;
    $aulas = [];

    if ($anioId !== null) {
      $anio = $this->obtenerAnioPorId($conexion, $anioId);
      if ($anio !== null) {
        $aulas = $this->obtenerAulasPorAnio($conexion, $anioId);
      }
    }

    $agrupadas = $this->agruparAulasPorGrado($aulas);
    $grados = $this->prepararGradosParaRespuesta($catalogoGrados, $agrupadas);
    $aulasRespuesta = $this->prepararAulasParaRespuesta($catalogoGrados, $agrupadas);

    return [
      'anio' => $anio ? [
        'id' => (int) $anio['id_anio_escolar'],
        'fecha_inicio' => $anio['fecha_inicio'],
        'fecha_fin' => $anio['fecha_fin'],
        'estado' => $anio['estado'],
      ] : null,
      'grados' => $grados,
      'aulas' => $aulasRespuesta,
    ];
  }

  protected function agruparAulasPorGrado(array $aulas): array
  {
    $agrupadas = [];

    foreach ($aulas as $aula) {
      $grado = $aula['grado'];
      $agrupadas[$grado] ??= [];
      $agrupadas[$grado][] = $aula;
    }

    foreach ($agrupadas as &$lista) {
      usort($lista, fn(array $a, array $b): int => $a['orden'] <=> $b['orden']);
    }

    return $agrupadas;
  }

  protected function prepararGradosParaRespuesta(array $catalogo, array $agrupadas): array
  {
    $respuesta = [];

    foreach ($catalogo as $grado => $secciones) {
      $lista = $agrupadas[$grado] ?? [];
      $activos = array_filter($lista, fn(array $aula): bool => $aula['estado'] === 'activo');
      $activosCount = count($activos);

      $respuesta[] = [
        'grado' => $grado,
        'maximo' => count($secciones),
        'seleccionActual' => $activosCount,
        'seleccion' => $activosCount > 0 ? $activosCount : 1,
        'secciones' => array_map(function (array $seccion): array {
          return [
            'id_grado_seccion' => (int) $seccion['id_grado_seccion'],
            'seccion' => $seccion['seccion'],
            'orden' => (int) $seccion['orden'],
          ];
        }, $secciones),
      ];
    }

    usort($respuesta, fn(array $a, array $b): int => (int) $a['grado'] <=> (int) $b['grado']);

    return $respuesta;
  }

  protected function prepararAulasParaRespuesta(array $catalogo, array $agrupadas): array
  {
    $resultado = [];

    foreach ($catalogo as $grado => $seccionesCatalogo) {
      $lista = $agrupadas[$grado] ?? [];
      if (empty($lista)) {
        continue;
      }

      $porOrden = [];
      foreach ($lista as $aula) {
        $porOrden[$aula['orden']] = $aula;
      }

      $activos = array_filter($lista, fn(array $aula): bool => $aula['estado'] === 'activo');
      $activosCount = count($activos);
      $ordenMaxActivo = $activosCount > 0
        ? max(array_map(fn(array $aula): int => $aula['orden'], $activos))
        : 0;

      foreach ($lista as $aula) {
        $orden = $aula['orden'];
        $inscripciones = (int) $aula['total_inscripciones'];
        $puedeDesactivar = $aula['estado'] === 'activo'
          && $activosCount > 1
          && $orden === $ordenMaxActivo;

        $puedeActivar = false;
        if ($aula['estado'] === 'inactivo') {
          if ($orden === 1) {
            $puedeActivar = true;
          } else {
            $previo = $porOrden[$orden - 1] ?? null;
            $puedeActivar = $previo !== null && $previo['estado'] === 'activo';
          }
        }

        $resultado[] = [
          'id' => (int) $aula['id_aula'],
          'grado' => $grado,
          'seccion' => $aula['seccion'],
          'orden' => $orden,
          'estado' => $aula['estado'],
          'cupos' => $aula['cupos'],
          'inscripciones' => $inscripciones,
          'puedeEditarCupos' => $inscripciones === 0,
          'puedeDesactivar' => $puedeDesactivar,
          'puedeActivar' => $puedeActivar,
        ];
      }
    }

    usort($resultado, function (array $a, array $b): int {
      $gradoA = (int) $a['grado'];
      $gradoB = (int) $b['grado'];

      if ($gradoA === $gradoB) {
        return (int) $a['orden'] <=> (int) $b['orden'];
      }

      return $gradoA <=> $gradoB;
    });

    return $resultado;
  }

  protected function verificarReglasCambioEstado(
    PDO $conexion,
    int $idAula,
    string $estado
  ): array {
    $aula = $this->obtenerAulaPorId($conexion, $idAula);
    if ($aula === null) {
      throw new RuntimeException('El aula solicitada no existe.');
    }

    $aulasGrado = $this->obtenerAulasPorAnio($conexion, $aula['fk_anio_escolar']);
    $agrupadas = $this->agruparAulasPorGrado($aulasGrado);
    $lista = $agrupadas[$aula['grado']] ?? [];

    if (empty($lista)) {
      throw new RuntimeException('No se encontraron registros asociados al grado del aula.');
    }

    $activos = array_filter($lista, fn(array $registro): bool => $registro['estado'] === 'activo');
    $activosCount = count($activos);
    $ordenActual = $aula['orden'];

    if ($estado === 'inactivo') {
      if ($activosCount <= 1) {
        throw new RuntimeException('Cada grado debe mantener al menos una seccion activa.');
      }

      $ordenMax = max(array_map(fn(array $registro): int => $registro['orden'], $activos));
      if ($ordenActual !== $ordenMax) {
        throw new RuntimeException('Solo se puede desactivar la ultima seccion habilitada del grado.');
      }
    } else {
      if ($ordenActual === 1) {
        return $aula;
      }

      $porOrden = [];
      foreach ($lista as $registro) {
        $porOrden[$registro['orden']] = $registro;
      }

      $previo = $porOrden[$ordenActual - 1] ?? null;
      if ($previo === null || $previo['estado'] !== 'activo') {
        throw new RuntimeException('Debe activar primero la seccion inmediatamente anterior.');
      }
    }

    return $aula;
  }

  protected function aplicarCambioEstado(PDO $conexion, int $idAula, string $estado): void
  {
    $this->actualizarEstadoBase($conexion, $idAula, $estado);
  }

  protected function aplicarActualizacionCupos(PDO $conexion, int $idAula, int $cupos): void
  {
    $inscripciones = $this->contarInscripciones($conexion, $idAula);
    if ($inscripciones > 0) {
      throw new RuntimeException('No es posible actualizar los cupos: existen inscripciones registradas en esta aula.');
    }

    $this->actualizarCuposBase($conexion, $idAula, $cupos);
  }

  protected function eliminarEspecialistasAula(PDO $conexion, int $aulaId): void
  {
    $sentencia = $conexion->prepare(
      'DELETE FROM imparte WHERE fk_aula = ? AND tipo_docente = "Especialista"'
    );
    $sentencia->execute([$aulaId]);
  }
}
