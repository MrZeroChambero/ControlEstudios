<?php

namespace Micodigo\Vacuna\VacunasEstudiante;

use Valitron\Validator;

require_once __DIR__ . '/VacunasEstudianteAtributosTrait.php';
require_once __DIR__ . '/VacunasEstudianteValidacionesTrait.php';
require_once __DIR__ . '/VacunasEstudianteGestionTrait.php';
require_once __DIR__ . '/VacunasEstudianteConsultasTrait.php';
require_once __DIR__ . '/VacunasEstudianteOperacionesControladorTrait.php';
require_once __DIR__ . '/VacunasEstudianteUtilidadesTrait.php';

class VacunasEstudiante
{
  use VacunasEstudianteAtributosTrait,
    VacunasEstudianteValidacionesTrait,
    VacunasEstudianteGestionTrait,
    VacunasEstudianteConsultasTrait,
    VacunasEstudianteOperacionesControladorTrait,
    VacunasEstudianteUtilidadesTrait;

  public function __construct(array $data = [])
  {
    $this->fk_vacuna = $data['fk_vacuna'] ?? null;
    $this->fk_estudiante = $data['fk_estudiante'] ?? null;
    $this->fecha_aplicacion = $data['fecha_aplicacion'] ?? null;
    $this->refuerzos = $data['refuerzos'] ?? 0;
    Validator::lang('es');
  }
}
