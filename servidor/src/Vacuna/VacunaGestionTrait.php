<?php

namespace Micodigo\Vacuna;

use PDO;

trait VacunaGestionTrait
{
  public function crear(PDO $pdo)
  {
    $val = $this->validar($pdo);
    if ($val !== true) return $val;
    $stmt = $pdo->prepare('INSERT INTO vacuna (nombre) VALUES (?)');
    $stmt->execute([$this->nombre]);
    $this->id_vacuna = $pdo->lastInsertId();
    return $this->id_vacuna;
  }
  public function actualizar(PDO $pdo)
  {
    if (!$this->id_vacuna) return ['id_vacuna' => ['ID requerido']];
    $val = $this->validar($pdo);
    if ($val !== true) return $val;
    $stmt = $pdo->prepare('UPDATE vacuna SET nombre=? WHERE id_vacuna=?');
    return $stmt->execute([$this->nombre, $this->id_vacuna]);
  }
  public static function eliminar(PDO $pdo, int $id)
  {
    $stmt = $pdo->prepare('DELETE FROM vacuna WHERE id_vacuna=?');
    return $stmt->execute([$id]);
  }
}
