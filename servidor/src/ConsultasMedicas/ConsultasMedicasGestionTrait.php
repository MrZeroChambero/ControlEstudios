<?php

namespace Micodigo\ConsultasMedicas;

use PDO;

trait ConsultasMedicasGestionTrait
{
  public function crear(PDO $pdo)
  {
    $val = $this->validar($pdo);
    if ($val !== true) return $val;
    $st = $pdo->prepare('INSERT INTO consultas_medicas (fk_estudiante,tipo_consulta,motivo,tiene_informe_medico,fecha_consulta,observaciones) VALUES (?,?,?,?,?,?)');
    $st->execute([$this->fk_estudiante, $this->tipo_consulta, $this->motivo, $this->tiene_informe_medico, $this->fecha_consulta, $this->observaciones]);
    $this->id_consulta = $pdo->lastInsertId();
    return $this->id_consulta;
  }
  public function actualizar(PDO $pdo)
  {
    if (!$this->id_consulta) return ['id_consulta' => ['ID requerido']];
    $val = $this->validar($pdo);
    if ($val !== true) return $val;
    $st = $pdo->prepare('UPDATE consultas_medicas SET fk_estudiante=?, tipo_consulta=?, motivo=?, tiene_informe_medico=?, fecha_consulta=?, observaciones=? WHERE id_consulta=?');
    return $st->execute([$this->fk_estudiante, $this->tipo_consulta, $this->motivo, $this->tiene_informe_medico, $this->fecha_consulta, $this->observaciones, $this->id_consulta]);
  }
  public static function eliminar(PDO $pdo, int $id)
  {
    $st = $pdo->prepare('DELETE FROM consultas_medicas WHERE id_consulta=?');
    return $st->execute([$id]);
  }
}
