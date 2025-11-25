<?php

namespace Micodigo\Representate;

use Exception;
use DateTime;

trait ValidacionesRepresentante
{
  private function edadDesdeFecha(?string $fecha)
  {
    if (empty($fecha)) return null;
    $dt = DateTime::createFromFormat('Y-m-d', $fecha);
    if (!$dt) return null;
    return (int) $dt->diff(new DateTime())->y;
  }

  private function validarEdadMinima16(?string $fecha_nacimiento)
  {
    $edad = $this->edadDesdeFecha($fecha_nacimiento);
    if ($edad === null) return ['fecha_nacimiento' => ['Fecha inválida']];
    if ($edad < 16) return ['edad' => ["La edad mínima para representante es 16 años. Actualmente: $edad."]];
    return true;
  }
}
