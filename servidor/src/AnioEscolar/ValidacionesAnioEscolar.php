<?php

namespace Micodigo\AnioEscolar;

use PDO;
use Valitron\Validator;

trait ValidacionesAnioEscolar
{
  private function limpiarTexto($texto)
  {
    if ($texto === null) return null;
    $texto = trim($texto);
    $texto = preg_replace('/\s+/', ' ', $texto);
    return $texto === '' ? null : $texto;
  }

  private function crearValidadorAnio(array $data)
  {
    Validator::lang('es');
    $v = new Validator($data);
    $v->rule('required', ['nombre', 'fecha_inicio', 'fecha_fin']);
    $v->rule('date', ['fecha_inicio', 'fecha_fin']);
    $v->rule('lengthMax', 'nombre', 100);
    return $v;
  }

  // Calcula la duración en días (inclusiva) entre dos fechas Y-m-d
  public static function calcularDuracionDias(string $fecha_inicio, string $fecha_fin): int
  {
    $a = \DateTime::createFromFormat('Y-m-d', $fecha_inicio);
    $b = \DateTime::createFromFormat('Y-m-d', $fecha_fin);
    if (!$a || !$b) return 0;
    $diff = $a->diff($b);
    return (int) $diff->days + 1;
  }

  // Verifica si un rango de fechas se solapa con años escolares existentes
  public static function verificarSolapamiento(PDO $pdo, string $fecha_inicio, string $fecha_fin, ?int $ignorar_id = null): bool
  {
    try {
      $sql = "SELECT COUNT(*) FROM anios_escolares WHERE NOT (fecha_fin < ? OR fecha_inicio > ?)";
      $params = [$fecha_inicio, $fecha_fin];
      if ($ignorar_id !== null) {
        $sql .= " AND id_anio_escolar != ?";
        $params[] = $ignorar_id;
      }
      $stmt = $pdo->prepare($sql);
      $stmt->execute($params);
      $cnt = (int) $stmt->fetchColumn();
      return $cnt > 0;
    } catch (\Exception $e) {
      // En caso de error conservador: considerar solapamiento
      return true;
    }
  }
}
