<?php

namespace Micodigo\DocumentosAcademicos;

use PDO;

trait DocumentosAcademicosConsultasTrait
{
  public static function listarPorEstudiante(PDO $pdo, int $fk_estudiante)
  {
    $st = $pdo->prepare('SELECT * FROM documentos_academicos WHERE fk_estudiante=? ORDER BY tipo_documento');
    $st->execute([$fk_estudiante]);
    return $st->fetchAll(PDO::FETCH_ASSOC);
  }
  public static function obtener(PDO $pdo, int $id)
  {
    $st = $pdo->prepare('SELECT * FROM documentos_academicos WHERE id_documento=?');
    $st->execute([$id]);
    return $st->fetch(PDO::FETCH_ASSOC);
  }
}
