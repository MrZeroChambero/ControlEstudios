<?php

namespace Micodigo\AnioEscolar;

use Exception;
use PDO;
use Micodigo\MomentoAcademico\MomentoAcademico;

trait GestionAnioEscolar
{
  public static function crearAnioBD($pdo, $datos)
  {
    try {
      $sql = "INSERT INTO anios_escolares (nombre, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $datos['nombre'] ?? null,
        $datos['fecha_inicio'] ?? null,
        $datos['fecha_fin'] ?? null,
        $datos['estado'] ?? 'activo'
      ]);
      return $pdo->lastInsertId();
    } catch (Exception $e) {
      throw new Exception("Error al crear año escolar: " . $e->getMessage());
    }
  }

  public static function actualizarAnioBD($pdo, $id, $datos)
  {
    try {
      $sql = "UPDATE anios_escolares SET nombre = ?, fecha_inicio = ?, fecha_fin = ?, estado = ? WHERE id_anio_escolar = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $datos['nombre'] ?? null,
        $datos['fecha_inicio'] ?? null,
        $datos['fecha_fin'] ?? null,
        $datos['estado'] ?? 'activo',
        $id
      ]);
    } catch (Exception $e) {
      throw new Exception("Error al actualizar año escolar: " . $e->getMessage());
    }
  }

  public static function eliminarAnioBD($pdo, $id)
  {
    try {
      $sql = "DELETE FROM anios_escolares WHERE id_anio_escolar = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      throw new Exception("Error al eliminar año escolar: " . $e->getMessage());
    }
  }

  // Crea un año escolar y genera automáticamente 3 momentos consecutivos de 70 días.
  // Retorna arreglo con id del año y ids de los momentos: ['id_anio' => ..., 'momentos' => [...]]
  public static function crearAnioConMomentosBD($pdo, $datos)
  {
    try {
      $pdo->beginTransaction();

      $sql = "INSERT INTO anios_escolares (nombre, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $datos['nombre'] ?? null,
        $datos['fecha_inicio'] ?? null,
        $datos['fecha_fin'] ?? null,
        $datos['estado'] ?? 'incompleto'
      ]);
      $id_anio = $pdo->lastInsertId();

      // Generar 3 momentos consecutivos de 70 días cada uno, empezando desde fecha_inicio
      $fecha_inicio = new \DateTime($datos['fecha_inicio']);
      $momentos_ids = [];

      for ($i = 0; $i < 3; $i++) {
        $s = (clone $fecha_inicio)->modify('+' . ($i * 70) . ' days');
        $e = (clone $s)->modify('+69 days'); // 70 días en total

        $momentData = [
          'fk_anio_escolar' => $id_anio,
          'nombre' => 'Momento ' . ($i + 1),
          'orden' => $i + 1,
          'fecha_inicio' => $s->format('Y-m-d'),
          'fecha_fin' => $e->format('Y-m-d'),
          'estado' => 'incompleto'
        ];

        $id_momento = MomentoAcademico::crearMomentoBD($pdo, $momentData);
        $momentos_ids[] = $id_momento;
      }

      $pdo->commit();

      return ['id_anio' => $id_anio, 'momentos' => $momentos_ids];
    } catch (Exception $e) {
      if ($pdo->inTransaction()) $pdo->rollBack();
      throw new Exception('Error al crear año con momentos: ' . $e->getMessage());
    }
  }
}
