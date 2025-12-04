<?php

namespace Micodigo\Indicadores;

use PDO;
use Exception;

trait IndicadoresGestionTrait
{
  protected function registrarIndicador(PDO $conexion, array $entrada): array
  {
    $validacion = $this->validarDatosIndicador($conexion, $entrada);
    if (!empty($validacion['errores'])) {
      return ['errores' => $validacion['errores']];
    }

    $datos = $validacion['datos'];

    try {
      $sql = "INSERT INTO indicadores (fk_competencia, nombre_indicador, aspecto, orden, ocultar)
              VALUES (?, ?, ?, ?, ?)";

      $sentencia = $conexion->prepare($sql);
      $sentencia->execute([
        $datos['fk_competencia'],
        $datos['nombre_indicador'],
        $datos['aspecto'],
        $datos['orden'],
        $datos['ocultar'],
      ]);

      $id = (int) $conexion->lastInsertId();
      $detalle = $this->obtenerIndicadorDetalle($conexion, $id);

      return ['datos' => $detalle];
    } catch (Exception $excepcion) {
      throw new Exception('Error al registrar el indicador: ' . $excepcion->getMessage(), 0, $excepcion);
    }
  }

  protected function actualizarIndicadorDatos(PDO $conexion, int $idIndicador, array $entrada): array
  {
    $actual = $this->obtenerIndicadorDetalle($conexion, $idIndicador);
    if ($actual === null) {
      return ['errores' => [
        'id_indicador' => ['El indicador indicado no existe.'],
      ]];
    }

    $mezclado = [
      'fk_competencia' => $entrada['fk_competencia'] ?? $actual['fk_competencia'],
      'nombre_indicador' => $entrada['nombre_indicador'] ?? $actual['nombre_indicador'],
      'aspecto' => $entrada['aspecto'] ?? $actual['aspecto'],
      'orden' => $entrada['orden'] ?? $actual['orden'],
      'ocultar' => $entrada['ocultar'] ?? $actual['ocultar'],
    ];

    $validacion = $this->validarDatosIndicador($conexion, $mezclado, $idIndicador);
    if (!empty($validacion['errores'])) {
      return ['errores' => $validacion['errores']];
    }

    $datos = $validacion['datos'];

    try {
      $sql = "UPDATE indicadores
                 SET fk_competencia = ?,
                     nombre_indicador = ?,
                     aspecto = ?,
                     orden = ?,
                     ocultar = ?
               WHERE id_indicador = ?";

      $sentencia = $conexion->prepare($sql);
      $sentencia->execute([
        $datos['fk_competencia'],
        $datos['nombre_indicador'],
        $datos['aspecto'],
        $datos['orden'],
        $datos['ocultar'],
        $idIndicador,
      ]);

      $detalle = $this->obtenerIndicadorDetalle($conexion, $idIndicador);
      return ['datos' => $detalle];
    } catch (Exception $excepcion) {
      throw new Exception('Error al actualizar el indicador: ' . $excepcion->getMessage(), 0, $excepcion);
    }
  }

  protected function eliminarIndicadorDatos(PDO $conexion, int $idIndicador): array
  {
    $detalle = $this->obtenerIndicadorDetalle($conexion, $idIndicador);
    if ($detalle === null) {
      return ['errores' => [
        'id_indicador' => ['El indicador indicado no existe.'],
      ]];
    }

    try {
      $sql = 'DELETE FROM indicadores WHERE id_indicador = ?';
      $sentencia = $conexion->prepare($sql);
      $sentencia->execute([$idIndicador]);

      return ['datos' => [
        'eliminado' => true,
        'indicador' => $detalle,
      ]];
    } catch (Exception $excepcion) {
      throw new Exception('Error al eliminar el indicador: ' . $excepcion->getMessage(), 0, $excepcion);
    }
  }

  protected function actualizarOcultarIndicador(PDO $conexion, int $idIndicador, string $estado): array
  {
    $detalle = $this->obtenerIndicadorDetalle($conexion, $idIndicador);
    if ($detalle === null) {
      return ['errores' => [
        'id_indicador' => ['El indicador indicado no existe.'],
      ]];
    }

    $estadoNormalizado = in_array($estado, ['si', 'no'], true) ? $estado : 'no';

    try {
      $sql = 'UPDATE indicadores SET ocultar = ? WHERE id_indicador = ?';
      $sentencia = $conexion->prepare($sql);
      $sentencia->execute([$estadoNormalizado, $idIndicador]);

      $detalleActualizado = $this->obtenerIndicadorDetalle($conexion, $idIndicador);
      return ['datos' => $detalleActualizado];
    } catch (Exception $excepcion) {
      throw new Exception('Error al actualizar la visibilidad del indicador: ' . $excepcion->getMessage(), 0, $excepcion);
    }
  }
}
