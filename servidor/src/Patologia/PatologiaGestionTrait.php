<?php

namespace Micodigo\Patologia;

use PDO;

trait PatologiaGestionTrait
{
  public function crear(PDO $pdo)
  {
    $val = $this->validar($pdo);
    if ($val !== true) return $val;
    $st = $pdo->prepare('INSERT INTO patologias (nombre_patologia,descripcion) VALUES (?,?)');
    $st->execute([$this->nombre_patologia, $this->descripcion]);
    $this->id_patologia = $pdo->lastInsertId();
    return $this->id_patologia;
  }
  public function actualizar(PDO $pdo)
  {
    if (!$this->id_patologia) return ['id_patologia' => ['ID requerido']];
    $val = $this->validar($pdo);
    if ($val !== true) return $val;
    $st = $pdo->prepare('UPDATE patologias SET nombre_patologia=?, descripcion=? WHERE id_patologia=?');
    return $st->execute([$this->nombre_patologia, $this->descripcion, $this->id_patologia]);
  }
  public static function eliminar(PDO $pdo, int $id)
  {
    $st = $pdo->prepare('DELETE FROM patologias WHERE id_patologia=?');
    return $st->execute([$id]);
  }
}
