<?php

namespace Micodigo\Impartir;

use Exception;
use PDO;
use RuntimeException;

trait ImpartirGestionTrait
{
  public function registrarDocenteTitular(PDO $conexion, int $aulaId, array $entrada): void
  {
    $validacion = $this->validarAsignacionDocente($entrada);
    if (!$validacion['valido']) {
      throw new RuntimeException(json_encode($validacion['errores'], JSON_UNESCAPED_UNICODE));
    }

    $datos = $validacion['datos'];
    $aula = $this->obtenerAulaPorId($conexion, $aulaId);
    if ($aula === null) {
      throw new RuntimeException('El aula seleccionada no existe.');
    }

    if (($aula['estado'] ?? null) !== 'activo') {
      throw new RuntimeException('Solo se puede asignar un docente a aulas activas.');
    }

    $anioId = (int) $aula['fk_anio_escolar'];

    $personal = $this->obtenerPersonalPorId($conexion, $datos['id_personal']);
    if ($personal === null) {
      throw new RuntimeException('El docente seleccionado no existe.');
    }

    if (strcasecmp($personal['tipo_funcion'] ?? '', 'Docente') !== 0) {
      throw new RuntimeException('El personal seleccionado no tiene rol de docente.');
    }

    if ($personal['estado_personal'] !== 'activo' || $personal['estado_persona'] !== 'activo') {
      throw new RuntimeException('El docente seleccionado no se encuentra activo.');
    }

    if ($this->personalTieneAsignacionActiva($conexion, $anioId, $personal['id_personal'], $aulaId)) {
      throw new RuntimeException('El docente ya tiene asignada otra aula en el año escolar.');
    }

    $componentes = $this->obtenerComponentesPorIds($conexion, $datos['componentes']);
    if (count($componentes) !== count($datos['componentes'])) {
      throw new RuntimeException('Uno o mas componentes seleccionados no existen.');
    }

    foreach ($componentes as $componente) {
      if (($componente['estado'] ?? '') !== 'activo') {
        throw new RuntimeException('Los componentes seleccionados deben estar activos.');
      }
    }

    $momentos = $this->obtenerMomentosActivos($conexion, $anioId);
    if (empty($momentos)) {
      throw new RuntimeException('No hay momentos activos configurados para el año escolar.');
    }

    $clasesTotales = $datos['clases_totales'];

    $conexion->beginTransaction();
    try {
      $this->eliminarDocenteTitularInterno($conexion, $aulaId);

      $sentencia = $conexion->prepare(
        'INSERT INTO imparte (fk_aula, fk_personal, fk_momento, fk_componente, tipo_docente, clases_totales)
         VALUES (?, ?, ?, ?, "aula", ?)'
      );

      foreach ($componentes as $componente) {
        foreach ($momentos as $momento) {
          $sentencia->execute([
            $aulaId,
            $personal['id_personal'],
            $momento['id'],
            $componente['id_componente'],
            $clasesTotales,
          ]);
        }
      }

      $conexion->commit();
    } catch (Exception $excepcion) {
      if ($conexion->inTransaction()) {
        $conexion->rollBack();
      }

      throw $excepcion;
    }
  }

  public function removerDocenteTitular(PDO $conexion, int $aulaId): void
  {
    $aula = $this->obtenerAulaPorId($conexion, $aulaId);
    if ($aula === null) {
      throw new RuntimeException('El aula especificada no existe.');
    }

    $this->eliminarDocenteTitularInterno($conexion, $aulaId);
  }

  protected function eliminarDocenteTitularInterno(PDO $conexion, int $aulaId): void
  {
    $sentencia = $conexion->prepare('DELETE FROM imparte WHERE fk_aula = ? AND tipo_docente = "aula"');
    $sentencia->execute([$aulaId]);
  }

  public function registrarEspecialista(PDO $conexion, int $aulaId, array $entrada): void
  {
    $validacion = $this->validarAsignacionEspecialista($entrada);
    if (!$validacion['valido']) {
      throw new RuntimeException(json_encode($validacion['errores'], JSON_UNESCAPED_UNICODE));
    }

    $datos = $validacion['datos'];
    $aula = $this->obtenerAulaPorId($conexion, $aulaId);
    if ($aula === null) {
      throw new RuntimeException('El aula seleccionada no existe.');
    }

    $anioId = (int) $aula['fk_anio_escolar'];

    $personal = $this->obtenerPersonalPorId($conexion, $datos['id_personal']);
    if ($personal === null) {
      throw new RuntimeException('El especialista seleccionado no existe.');
    }

    if (strcasecmp($personal['tipo_funcion'] ?? '', 'Especialista') !== 0) {
      throw new RuntimeException('El personal seleccionado no corresponde a un especialista.');
    }

    if ($personal['estado_personal'] !== 'activo' || $personal['estado_persona'] !== 'activo') {
      throw new RuntimeException('El especialista seleccionado no se encuentra activo.');
    }

    $componentes = $this->obtenerComponentesPorIds($conexion, $datos['componentes']);
    if (count($componentes) !== count($datos['componentes'])) {
      throw new RuntimeException('Uno o mas componentes seleccionados no existen.');
    }

    foreach ($componentes as $componente) {
      if (($componente['estado'] ?? '') !== 'activo') {
        throw new RuntimeException('Los componentes seleccionados deben estar activos.');
      }
    }

    $momentos = $this->obtenerMomentosActivos($conexion, $anioId);
    if (empty($momentos)) {
      throw new RuntimeException('No hay momentos activos configurados para el año escolar.');
    }

    $clasesTotales = $datos['clases_totales'];

    $conexion->beginTransaction();
    try {
      $sentenciaDelete = $conexion->prepare(
        'DELETE FROM imparte WHERE fk_aula = ? AND fk_componente = ? AND tipo_docente = "Especialista"'
      );
      $sentenciaInsert = $conexion->prepare(
        'INSERT INTO imparte (fk_aula, fk_personal, fk_momento, fk_componente, tipo_docente, clases_totales)
         VALUES (?, ?, ?, ?, "Especialista", ?)'
      );

      foreach ($componentes as $componente) {
        $sentenciaDelete->execute([$aulaId, $componente['id_componente']]);

        foreach ($momentos as $momento) {
          $sentenciaInsert->execute([
            $aulaId,
            $personal['id_personal'],
            $momento['id'],
            $componente['id_componente'],
            $clasesTotales,
          ]);
        }
      }

      $conexion->commit();
    } catch (Exception $excepcion) {
      if ($conexion->inTransaction()) {
        $conexion->rollBack();
      }

      throw $excepcion;
    }
  }

  public function removerEspecialista(PDO $conexion, int $aulaId, int $componenteId): void
  {
    $componenteId = $this->normalizarEntero($componenteId);
    if ($componenteId === null || $componenteId <= 0) {
      throw new RuntimeException('Componente invalido.');
    }

    $aula = $this->obtenerAulaPorId($conexion, $aulaId);
    if ($aula === null) {
      throw new RuntimeException('El aula especificada no existe.');
    }

    $sentencia = $conexion->prepare(
      'DELETE FROM imparte WHERE fk_aula = ? AND fk_componente = ? AND tipo_docente = "Especialista"'
    );
    $sentencia->execute([$aulaId, $componenteId]);
  }
}
