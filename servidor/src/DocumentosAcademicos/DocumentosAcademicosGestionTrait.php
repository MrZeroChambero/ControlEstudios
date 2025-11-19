<?php

namespace Micodigo\DocumentosAcademicos;

use PDO;

trait DocumentosAcademicosGestionTrait
{
  public function crear(PDO $pdo)
  {
    $val = $this->validar($pdo);
    if ($val !== true) return $val;
    $st = $pdo->prepare('INSERT INTO documentos_academicos (fk_estudiante,tipo_documento,grado,entregado,observaciones) VALUES (?,?,?,?,?)');
    $st->execute([$this->fk_estudiante, $this->tipo_documento, $this->grado, $this->entregado, $this->observaciones]);
    $this->id_documento = $pdo->lastInsertId();
    return $this->id_documento;
  }
  public function actualizar(PDO $pdo)
  {
    if (!$this->id_documento) return ['id_documento' => ['ID requerido']];
    $val = $this->validar($pdo);
    if ($val !== true) return $val;
    $st = $pdo->prepare('UPDATE documentos_academicos SET fk_estudiante=?, tipo_documento=?, grado=?, entregado=?, observaciones=? WHERE id_documento=?');
    return $st->execute([$this->fk_estudiante, $this->tipo_documento, $this->grado, $this->entregado, $this->observaciones, $this->id_documento]);
  }
  public static function eliminar(PDO $pdo, int $id)
  {
    $st = $pdo->prepare('DELETE FROM documentos_academicos WHERE id_documento=?');
    return $st->execute([$id]);
  }
}
