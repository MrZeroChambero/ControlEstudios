<?php

namespace Micodigo\Habilidades;

use Exception;
use PDO;

trait ConsultasHabilidades
{
  public static function existeHabilidadNombre(PDO $pdo, int $fk_representante, string $nombre): bool
  {
    $sql = 'SELECT COUNT(*) AS cnt FROM habilidades WHERE fk_representante = ? AND LOWER(nombre_habilidad) = LOWER(?)';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$fk_representante, $nombre]);
    $r = $stmt->fetch(PDO::FETCH_ASSOC);
    return ((int)($r['cnt'] ?? 0)) > 0;
  }

  public static function listarPorRepresentanteBD(PDO $pdo, int $fk_representante): array
  {
    $stmt = $pdo->prepare('SELECT id_habilidad, nombre_habilidad FROM habilidades WHERE fk_representante = ? ORDER BY nombre_habilidad');
    $stmt->execute([$fk_representante]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public static function obtenerPorIdBD(PDO $pdo, int $id)
  {
    $stmt = $pdo->prepare('SELECT id_habilidad, fk_representante, nombre_habilidad FROM habilidades WHERE id_habilidad = ?');
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }
}
