<?php

namespace Micodigo\Alergias\ListaAlergias;

use PDO;

trait ListaAlergiasGestionTrait
{
  public function crear(PDO $pdo)
  {
    $val = $this->validar($pdo);
    if ($val !== true) return $val;
    $stmt = $pdo->prepare('INSERT INTO lista_alergias (fk_alergia,fk_estudiante) VALUES (?,?)');
    $stmt->execute([$this->fk_alergia, $this->fk_estudiante]);
    $this->id_lista_alergia = $pdo->lastInsertId();
    return $this->id_lista_alergia;
  }
  public static function eliminar(PDO $pdo, int $id)
  {
    $stmt = $pdo->prepare('DELETE FROM lista_alergias WHERE id_lista_alergia=?');
    return $stmt->execute([$id]);
  }
}
