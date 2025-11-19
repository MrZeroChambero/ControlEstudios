<?php

namespace Micodigo\Alergias;

use PDO;

trait AlergiasGestionTrait
{
  public function crear(PDO $pdo)
  {
    $val = $this->validar($pdo);
    if ($val !== true) return $val;
    $stmt = $pdo->prepare('INSERT INTO alergias (nombre) VALUES (?)');
    $stmt->execute([$this->nombre]);
    $this->id_alergia = $pdo->lastInsertId();
    return $this->id_alergia;
  }

  public function actualizar(PDO $pdo)
  {
    if (!$this->id_alergia) return ['id_alergia' => ['ID requerido']];
    $val = $this->validar($pdo);
    if ($val !== true) return $val;
    $stmt = $pdo->prepare('UPDATE alergias SET nombre = ? WHERE id_alergia = ?');
    return $stmt->execute([$this->nombre, $this->id_alergia]);
  }

  public static function eliminar(PDO $pdo, int $id)
  {
    $stmt = $pdo->prepare('DELETE FROM alergias WHERE id_alergia = ?');
    return $stmt->execute([$id]);
  }
}
