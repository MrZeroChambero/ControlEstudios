<?php

namespace Micodigo\Competencias;

use PDO;
use Exception;

trait CompetenciasGestionTrait
{
  protected function registrarCompetencia(PDO $conexion, array $entrada): array
  {
    $validacion = $this->validarDatosCompetencia($conexion, $entrada);
    if (!empty($validacion['errores'])) {
      return ['errores' => $validacion['errores']];
    }

    $datos = $validacion['datos'];

    try {
      $conexion->beginTransaction();

      $sql = "INSERT INTO competencias (fk_componente, nombre_competencia, descripcion_competencia, reutilizable)
              VALUES (?, ?, ?, ?)";
      $sentencia = $conexion->prepare($sql);
      $sentencia->execute([
        $datos['fk_componente'],
        $datos['nombre_competencia'],
        $datos['descripcion_competencia'],
        $datos['reutilizable'],
      ]);

      $id = (int) $conexion->lastInsertId();
      $conexion->commit();

      $detalle = $this->obtenerCompetenciaDetalle($conexion, $id);
      return ['datos' => $detalle];
    } catch (Exception $excepcion) {
      if ($conexion->inTransaction()) {
        $conexion->rollBack();
      }
      throw new Exception('Error al registrar la competencia: ' . $excepcion->getMessage(), 0, $excepcion);
    }
  }

  protected function actualizarCompetenciaDatos(PDO $conexion, int $idCompetencia, array $entrada): array
  {
    $actual = $this->obtenerCompetenciaDetalle($conexion, $idCompetencia);
    if ($actual === null) {
      return ['errores' => [
        'id_competencia' => ['La competencia indicada no existe.'],
      ]];
    }

    $mezclado = [
      'fk_componente' => $entrada['fk_componente'] ?? $actual['fk_componente'],
      'nombre_competencia' => $entrada['nombre_competencia'] ?? $actual['nombre_competencia'],
      'descripcion_competencia' => $entrada['descripcion_competencia'] ?? $actual['descripcion_competencia'],
      'reutilizable' => $entrada['reutilizable'] ?? $actual['reutilizable'],
    ];

    $validacion = $this->validarDatosCompetencia($conexion, $mezclado, $idCompetencia);
    if (!empty($validacion['errores'])) {
      return ['errores' => $validacion['errores']];
    }

    $datos = $validacion['datos'];

    try {
      $conexion->beginTransaction();

      $sql = "UPDATE competencias
                 SET fk_componente = ?,
                     nombre_competencia = ?,
                     descripcion_competencia = ?,
                     reutilizable = ?
               WHERE id_competencia = ?";

      $sentencia = $conexion->prepare($sql);
      $sentencia->execute([
        $datos['fk_componente'],
        $datos['nombre_competencia'],
        $datos['descripcion_competencia'],
        $datos['reutilizable'],
        $idCompetencia,
      ]);

      $conexion->commit();

      $detalle = $this->obtenerCompetenciaDetalle($conexion, $idCompetencia);
      return ['datos' => $detalle];
    } catch (Exception $excepcion) {
      if ($conexion->inTransaction()) {
        $conexion->rollBack();
      }
      throw new Exception('Error al actualizar la competencia: ' . $excepcion->getMessage(), 0, $excepcion);
    }
  }

  protected function eliminarCompetenciaDatos(PDO $conexion, int $idCompetencia): array
  {
    $actual = $this->obtenerCompetenciaDetalle($conexion, $idCompetencia);
    if ($actual === null) {
      return ['errores' => [
        'id_competencia' => ['La competencia indicada no existe.'],
      ]];
    }

    try {
      $sql = 'DELETE FROM competencias WHERE id_competencia = ?';
      $sentencia = $conexion->prepare($sql);
      $sentencia->execute([$idCompetencia]);

      return [
        'datos' => [
          'eliminado' => true,
          'competencia' => $actual,
        ],
      ];
    } catch (Exception $excepcion) {
      throw new Exception('Error al eliminar la competencia: ' . $excepcion->getMessage(), 0, $excepcion);
    }
  }
}
