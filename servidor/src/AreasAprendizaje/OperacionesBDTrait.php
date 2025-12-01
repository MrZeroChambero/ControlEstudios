<?php

namespace Micodigo\AreasAprendizaje;

use PDO;
use Exception;

trait OperacionesBDTrait
{
  /**
   * Ejecuta una consulta SQL y devuelve todas las filas encontradas.
   *
   * @param PDO $conexion Instancia PDO activa.
   * @param string $sql Consulta parametrizada.
   * @param array $parametros Valores vinculados a la consulta.
   * @return array Filas devueltas por la consulta.
   * @throws Exception Cuando la ejecución falla.
   */
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

  /**
   * Ejecuta una consulta SQL y devuelve una sola fila.
   *
   * @param PDO $conexion Instancia PDO activa.
   * @param string $sql Consulta parametrizada.
   * @param array $parametros Valores vinculados a la consulta.
   * @return array|null Fila encontrada o null si no existen datos.
   * @throws Exception Cuando la ejecución falla.
   */
  protected function ejecutarConsultaUnica(PDO $conexion, string $sql, array $parametros = []): ?array
  {
    $filas = $this->ejecutarConsulta($conexion, $sql, $parametros);
    return $filas[0] ?? null;
  }

  /**
   * Ejecuta una consulta SQL de modificación (INSERT, UPDATE, DELETE).
   *
   * @param PDO $conexion Instancia PDO activa.
   * @param string $sql Consulta parametrizada.
   * @param array $parametros Valores vinculados a la consulta.
   * @return bool Verdadero si se afectó al menos una fila.
   * @throws Exception Cuando la ejecución falla.
   */
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

  /**
   * Ejecuta una consulta que devuelve un único valor escalar.
   *
   * @param PDO $conexion Instancia PDO activa.
   * @param string $sql Consulta parametrizada.
   * @param array $parametros Valores vinculados a la consulta.
   * @return mixed Valor devuelto por la consulta.
   * @throws Exception Cuando la ejecución falla.
   */
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
