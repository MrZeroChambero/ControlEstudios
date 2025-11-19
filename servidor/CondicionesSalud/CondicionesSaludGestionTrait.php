<?php

namespace Micodigo\CondicionesSalud;

use PDO;

trait CondicionesSaludGestionTrait
{
  public function crear(PDO $pdo)
  {
    $val = $this->validar($pdo);
    if ($val !== true) return $val;
    $st = $pdo->prepare('INSERT INTO condiciones_salud (fk_estudiante,fk_patologia,afectado,presente_en,tipo_familiar,fecha_deteccion,cronica,impedimento_fisico,observaciones) VALUES (?,?,?,?,?,?,?,?,?)');
    $st->execute([$this->fk_estudiante, $this->fk_patologia, $this->afectado, $this->presente_en, $this->tipo_familiar, $this->fecha_deteccion, $this->cronica, $this->impedimento_fisico, $this->observaciones]);
    $this->id_condicion = $pdo->lastInsertId();
    return $this->id_condicion;
  }
  public function actualizar(PDO $pdo)
  {
    if (!$this->id_condicion) return ['id_condicion' => ['ID requerido']];
    $val = $this->validar($pdo);
    if ($val !== true) return $val;
    $st = $pdo->prepare('UPDATE condiciones_salud SET fk_estudiante=?, fk_patologia=?, afectado=?, presente_en=?, tipo_familiar=?, fecha_deteccion=?, cronica=?, impedimento_fisico=?, observaciones=? WHERE id_condicion=?');
    return $st->execute([$this->fk_estudiante, $this->fk_patologia, $this->afectado, $this->presente_en, $this->tipo_familiar, $this->fecha_deteccion, $this->cronica, $this->impedimento_fisico, $this->observaciones, $this->id_condicion]);
  }
  public static function eliminar(PDO $pdo, int $id)
  {
    $st = $pdo->prepare('DELETE FROM condiciones_salud WHERE id_condicion=?');
    return $st->execute([$id]);
  }
}
