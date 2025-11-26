<?php

namespace Micodigo\Parentesco;

use PDO;
use Exception;

trait ConsultasParentesco
{
  /** Listar todas las relaciones de parentesco (solo datos mínimos). */
  public static function consultarTodosParentescos(PDO $pdo): array
  {
    $sql = "SELECT pa.id_parentesco, pa.fk_estudiante, pa.fk_representante, pa.tipo_parentesco,
            pe.id_persona AS id_persona_est, pe.primer_nombre AS est_primer_nombre, pe.primer_apellido AS est_primer_apellido, pe.cedula AS est_cedula,
            pr.id_persona AS id_persona_rep, pr.primer_nombre AS rep_primer_nombre, pr.primer_apellido AS rep_primer_apellido, pr.cedula AS rep_cedula
            FROM parentesco pa
            INNER JOIN estudiantes e ON pa.fk_estudiante = e.id_estudiante
            INNER JOIN personas pe ON e.id_persona = pe.id_persona
            INNER JOIN representantes r ON pa.fk_representante = r.id_representante
            INNER JOIN personas pr ON r.fk_persona = pr.id_persona
            WHERE pe.estado = 'activo' AND pr.estado = 'activo'
            ORDER BY pe.primer_nombre, pe.primer_apellido";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  /** Obtener parentesco por ID. */
  public static function consultarParentescoPorId(PDO $pdo, int $id_parentesco): ?array
  {
    $sql = "SELECT pa.id_parentesco, pa.fk_estudiante, pa.fk_representante, pa.tipo_parentesco,
            pe.primer_nombre AS est_primer_nombre, pe.primer_apellido AS est_primer_apellido, pe.cedula AS est_cedula,
            pr.primer_nombre AS rep_primer_nombre, pr.primer_apellido AS rep_primer_apellido, pr.cedula AS rep_cedula
            FROM parentesco pa
            INNER JOIN estudiantes e ON pa.fk_estudiante = e.id_estudiante
            INNER JOIN personas pe ON e.id_persona = pe.id_persona
            INNER JOIN representantes r ON pa.fk_representante = r.id_representante
            INNER JOIN personas pr ON r.fk_persona = pr.id_persona
            WHERE pa.id_parentesco = ? AND pe.estado='activo' AND pr.estado='activo'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id_parentesco]);
    $r = $stmt->fetch(PDO::FETCH_ASSOC);
    return $r ?: null;
  }

  /** Listar parentescos de un estudiante. */
  public static function consultarParentescosPorEstudiante(PDO $pdo, int $id_estudiante): array
  {
    $sql = "SELECT pa.id_parentesco, pa.tipo_parentesco,
            pr.primer_nombre AS rep_primer_nombre, pr.primer_apellido AS rep_primer_apellido, pr.cedula AS rep_cedula, r.id_representante, pr.genero AS rep_genero
            FROM parentesco pa
            INNER JOIN representantes r ON pa.fk_representante = r.id_representante
            INNER JOIN personas pr ON r.fk_persona = pr.id_persona
            WHERE pa.fk_estudiante = ? AND pr.estado='activo'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id_estudiante]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  /** Listar parentescos de un representante. */
  public static function consultarParentescosPorRepresentante(PDO $pdo, int $id_representante): array
  {
    $sql = "SELECT pa.id_parentesco, pa.tipo_parentesco,
        pe.primer_nombre AS est_primer_nombre, pe.primer_apellido AS est_primer_apellido, pe.cedula AS est_cedula, e.id_estudiante
            FROM parentesco pa
            INNER JOIN estudiantes e ON pa.fk_estudiante = e.id_estudiante
            INNER JOIN personas pe ON e.id_persona = pe.id_persona
            WHERE pa.fk_representante = ? AND pe.estado='activo'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id_representante]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  /** Verificar si estudiante ya tiene padre/madre según tipo. */
  public static function estudianteTieneTipo(PDO $pdo, int $id_estudiante, string $tipo): bool
  {
    $stmt = $pdo->prepare("SELECT 1 FROM parentesco WHERE fk_estudiante=? AND tipo_parentesco=? LIMIT 1");
    $stmt->execute([$id_estudiante, $tipo]);
    return (bool)$stmt->fetch();
  }

  /** Verificar si ya existe relación exacta. */
  public static function existeRelacion(PDO $pdo, int $id_estudiante, int $id_representante): bool
  {
    $stmt = $pdo->prepare("SELECT 1 FROM parentesco WHERE fk_estudiante=? AND fk_representante=? LIMIT 1");
    $stmt->execute([$id_estudiante, $id_representante]);
    return (bool)$stmt->fetch();
  }
}
