<?php

namespace Micodigo\MomentoAcademico;

use Exception;
use PDO;
use RuntimeException;

trait GestionMomentoAcademico
{
  public static function crearMomentoBD($pdo, $datos)
  {
    try {
      $orden = self::obtenerOrdenComoCadena($datos);
      $estado = self::normalizarEstadoMomento($datos);
      $fechaFin = $datos['fecha_fin'] ?? $datos['fecha_final'] ?? null;

      if (!isset($datos['fk_anio_escolar'])) {
        throw new RuntimeException('fk_anio_escolar es requerido para registrar un momento.');
      }

      $verificar = $pdo->prepare('SELECT COUNT(*) FROM momentos WHERE fk_anio_escolar = ? AND nombre_momento = ?');
      $verificar->execute([(int) $datos['fk_anio_escolar'], $orden]);
      if ((int) $verificar->fetchColumn() > 0) {
        throw new RuntimeException('Ya existe un momento con ese orden para el año escolar.');
      }

      $sql = "INSERT INTO momentos (fk_anio_escolar, nombre_momento, fecha_inicio, fecha_fin, estado_momento) VALUES (?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        (int) $datos['fk_anio_escolar'],
        $orden,
        $datos['fecha_inicio'] ?? null,
        $fechaFin,
        $estado
      ]);
      return $pdo->lastInsertId();
    } catch (RuntimeException $e) {
      throw $e;
    } catch (Exception $e) {
      throw new Exception("Error al crear momento académico: " . $e->getMessage(), 0, $e);
    }
  }

  public static function actualizarMomentoBD($pdo, $id, $datos)
  {
    try {
      $orden = self::obtenerOrdenComoCadena($datos);
      $estado = self::normalizarEstadoMomento($datos);
      $fechaFin = $datos['fecha_fin'] ?? $datos['fecha_final'] ?? null;

      if (!isset($datos['fk_anio_escolar'])) {
        throw new RuntimeException('fk_anio_escolar es requerido para actualizar un momento.');
      }

      $verificar = $pdo->prepare('SELECT COUNT(*) FROM momentos WHERE fk_anio_escolar = ? AND nombre_momento = ? AND id_momento <> ?');
      $verificar->execute([(int) $datos['fk_anio_escolar'], $orden, $id]);
      if ((int) $verificar->fetchColumn() > 0) {
        throw new RuntimeException('Ya existe otro momento con ese orden para el año escolar.');
      }

      $sql = "UPDATE momentos SET fk_anio_escolar = ?, nombre_momento = ?, fecha_inicio = ?, fecha_fin = ?, estado_momento = ? WHERE id_momento = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        (int) $datos['fk_anio_escolar'],
        $orden,
        $datos['fecha_inicio'] ?? null,
        $fechaFin,
        $estado,
        $id
      ]);
    } catch (RuntimeException $e) {
      throw $e;
    } catch (Exception $e) {
      throw new Exception("Error al actualizar momento académico: " . $e->getMessage(), 0, $e);
    }
  }

  public static function eliminarMomentoBD($pdo, $id)
  {
    try {
      $sql = "DELETE FROM momentos WHERE id_momento = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (RuntimeException $e) {
      throw $e;
    } catch (Exception $e) {
      throw new Exception("Error al eliminar momento académico: " . $e->getMessage(), 0, $e);
    }
  }

  private static function obtenerOrdenComoCadena(array $datos): string
  {
    $candidatos = [
      $datos['orden'] ?? null,
      $datos['nombre_momento'] ?? null,
      $datos['nombre'] ?? null,
    ];

    foreach ($candidatos as $valor) {
      if ($valor === null || $valor === '') {
        continue;
      }

      if (is_numeric($valor)) {
        $numero = (int) $valor;
        if ($numero >= 1 && $numero <= 3) {
          return (string) $numero;
        }
      }

      if (is_string($valor) && preg_match('/([1-3])/', $valor, $coincidencia)) {
        return $coincidencia[1];
      }
    }

    throw new RuntimeException('Orden de momento inválido. Debe estar entre 1 y 3.');
  }

  private static function normalizarEstadoMomento(array $datos): string
  {
    $estado = $datos['estado'] ?? $datos['estado_momento'] ?? null;
    $estado = is_string($estado) ? strtolower(trim($estado)) : null;

    if (in_array($estado, ['planificado', 'incompleto'], true)) {
      $estado = 'pendiente';
    }

    $permitidos = ['activo', 'pendiente', 'finalizado'];

    if ($estado === null || $estado === '') {
      return 'pendiente';
    }

    return in_array($estado, $permitidos, true) ? $estado : 'pendiente';
  }
}
