<?php

namespace Micodigo\Contenidos;

use PDO;
use Exception;

trait OperacionesBDTrait
{
  protected function ejecutarConsulta(PDO $conexion, string $sql, array $parametros = []): array
  {
    try {
      $sentencia = $conexion->prepare($sql);
      $sentencia->execute($parametros);
      return $sentencia->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $excepcion) {
      throw new Exception('Error al ejecutar la consulta: ' . $excepcion->getMessage(), 0, $excepcion);
    }
  }

  protected function ejecutarConsultaUnica(PDO $conexion, string $sql, array $parametros = []): ?array
  {
    $filas = $this->ejecutarConsulta($conexion, $sql, $parametros);
    return $filas[0] ?? null;
  }

  protected function ejecutarAccion(PDO $conexion, string $sql, array $parametros = []): bool
  {
    try {
      $sentencia = $conexion->prepare($sql);
      $sentencia->execute($parametros);
      return $sentencia->rowCount() > 0;
    } catch (Exception $excepcion) {
      throw new Exception('Error al ejecutar la acción: ' . $excepcion->getMessage(), 0, $excepcion);
    }
  }

  protected function ejecutarValor(PDO $conexion, string $sql, array $parametros = []): mixed
  {
    try {
      $sentencia = $conexion->prepare($sql);
      $sentencia->execute($parametros);
      return $sentencia->fetchColumn();
    } catch (Exception $excepcion) {
      throw new Exception('Error al obtener el valor solicitado: ' . $excepcion->getMessage(), 0, $excepcion);
    }
  }
}
