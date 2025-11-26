<?php

namespace Micodigo\MomentoAcademico;

use Valitron\Validator;
use PDO;

trait ValidacionesMomentoAcademico
{
  private function limpiarTexto($texto)
  {
    if ($texto === null) return null;
    $texto = trim($texto);
    $texto = preg_replace('/\s+/', ' ', $texto);
    return $texto === '' ? null : $texto;
  }

  private function crearValidadorMomento(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data);
    $v->rule('required', ['nombre', 'orden', 'fecha_inicio', 'fecha_fin']);
    $v->rule('integer', 'orden');
    $v->rule('date', ['fecha_inicio', 'fecha_fin']);
    $v->rule('lengthMax', 'nombre', 100);
    return $v;
  }

  // Calcula días inclusivos
  public static function calcularDuracionDias(string $fecha_inicio, string $fecha_fin): int
  {
    $a = \DateTime::createFromFormat('Y-m-d', $fecha_inicio);
    $b = \DateTime::createFromFormat('Y-m-d', $fecha_fin);
    if (!$a || !$b) return 0;
    $diff = $a->diff($b);
    return (int) $diff->days + 1;
  }

  // Verifica solapamiento de un momento dentro del mismo año escolar
  public static function verificarSolapamientoMomento(PDO $pdo, int $fk_anio_escolar, string $fecha_inicio, string $fecha_fin, ?int $ignorar_id = null): bool
  {
    try {
      $sql = "SELECT COUNT(*) FROM momentos_academicos WHERE fk_anio_escolar = ? AND NOT (fecha_fin < ? OR fecha_inicio > ?)";
      $params = [$fk_anio_escolar, $fecha_inicio, $fecha_fin];
      if ($ignorar_id !== null) {
        $sql .= " AND id_momento != ?";
        $params[] = $ignorar_id;
      }
      $stmt = $pdo->prepare($sql);
      $stmt->execute($params);
      $cnt = (int) $stmt->fetchColumn();
      return $cnt > 0;
    } catch (\Exception $e) {
      return true;
    }
  }
}
