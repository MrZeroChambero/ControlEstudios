<?php

namespace Micodigo\Habilidades;

use Exception;
use PDO;
use Micodigo\Config\Conexion;
use Micodigo\Representate\ConsultasRepresentante;

trait ValidacionesHabilidades
{
  private function validarInputCrear(array $input)
  {
    $errors = [];
    if (empty($input['fk_representante']) || !is_numeric($input['fk_representante'])) {
      $errors['fk_representante'] = 'Representante inválido';
    }
    if (empty($input['nombre_habilidad']) || !is_string($input['nombre_habilidad'])) {
      $errors['nombre_habilidad'] = 'Nombre de la habilidad requerido';
    } elseif (mb_strlen($input['nombre_habilidad']) > 100) {
      $errors['nombre_habilidad'] = 'Máximo 100 caracteres';
    }
    return $errors;
  }

  private function validarRepresentanteActivo(PDO $pdo, int $fk_representante)
  {
    // Reutiliza método de Representate para obtener representante y persona asociada
    try {
      // Usamos la consulta estática definida en ConsultasRepresentante
      $rep = ConsultasRepresentante::obtenerRepresentantePorId($pdo, $fk_representante);
      if (!$rep) return ['fk_representante' => 'Representante no encontrado'];
      if (($rep['estado'] ?? '') !== 'activo') return ['fk_representante' => 'La persona asociada al representante no está activa'];
      return [];
    } catch (Exception $e) {
      return ['internal' => 'Error verificando representante: ' . $e->getMessage()];
    }
  }
}
