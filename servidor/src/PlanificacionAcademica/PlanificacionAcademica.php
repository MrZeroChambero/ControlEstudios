<?php

namespace Micodigo\PlanificacionAcademica;

use Valitron\Validator;

require_once __DIR__ . '/PlanificacionAcademicaAtributosTrait.php';
require_once __DIR__ . '/PlanificacionAcademicaUtilidadesTrait.php';
require_once __DIR__ . '/PlanificacionAcademicaConsultasTrait.php';
require_once __DIR__ . '/PlanificacionAcademicaValidacionesTrait.php';
require_once __DIR__ . '/PlanificacionAcademicaGestionTrait.php';
require_once __DIR__ . '/PlanificacionAcademicaContextoTrait.php';
require_once __DIR__ . '/PlanificacionAcademicaAsignacionesTrait.php';
require_once __DIR__ . '/PlanificacionAcademicaApiTrait.php';

class PlanificacionAcademica
{
  public const TABLA = 'planificaciones';
  public const TABLA_COMPETENCIAS = 'plan_competencias';
  public const TABLA_INDIVIDUALES = 'planificaciones_individuales';

  use PlanificacionAcademicaAtributosTrait;
  use PlanificacionAcademicaUtilidadesTrait;
  use PlanificacionAcademicaConsultasTrait;
  use PlanificacionAcademicaValidacionesTrait;
  use PlanificacionAcademicaGestionTrait;
  use PlanificacionAcademicaContextoTrait;
  use PlanificacionAcademicaAsignacionesTrait;
  use PlanificacionAcademicaApiTrait;

  public function __construct(array $datos = [])
  {
    Validator::lang('es');
    $this->asignarDatos($datos);
    $this->normalizarAutomaticamente();
    $this->establecerValoresPorDefecto();
  }
}
