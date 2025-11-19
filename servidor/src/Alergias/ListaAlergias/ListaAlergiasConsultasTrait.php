<?php

namespace Micodigo\Alergias\ListaAlergias;

use PDO;

trait ListaAlergiasConsultasTrait
{
  public static function listarPorEstudiante(PDO $pdo, int $fk_estudiante)
  {
    $stmt = $pdo->prepare('SELECT la.id_lista_alergia, a.id_alergia, a.nombre FROM lista_alergias la INNER JOIN alergias a ON la.fk_alergia=a.id_alergia WHERE la.fk_estudiante=? ORDER BY a.nombre');
    $stmt->execute([$fk_estudiante]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }
}
