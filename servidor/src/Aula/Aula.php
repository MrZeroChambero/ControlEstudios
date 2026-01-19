<?php

namespace Micodigo\Aula;

use Valitron\Validator;

require_once __DIR__ . '/ConsultasAula.php';
require_once __DIR__ . '/GestionAula.php';
require_once __DIR__ . '/ValidacionesAula.php';
require_once __DIR__ . '/OperacionesControladorAula.php';
require_once __DIR__ . '/UtilidadesAula.php';
require_once __DIR__ . '/AulaRespuestaTrait.php';
require_once __DIR__ . '/AulaAperturaHelpersTrait.php';
require_once __DIR__ . '/AulaAperturaValidacionesTrait.php';
require_once __DIR__ . '/AulaAperturaConsultasTrait.php';
require_once __DIR__ . '/AulaAperturaGestionTrait.php';
require_once __DIR__ . '/AulaAsignacionesConsultasTrait.php';
require_once __DIR__ . '/AulaAsignacionesValidacionesTrait.php';
require_once __DIR__ . '/AulaAsignacionesGestionTrait.php';
require_once __DIR__ . '/../Impartir/Impartir.php';

class Aula
{
  use AulaRespuestaTrait,
    AulaAperturaHelpersTrait,
    AulaAperturaValidacionesTrait,
    AulaAperturaConsultasTrait,
    AulaAperturaGestionTrait,
    AulaAsignacionesConsultasTrait,
    AulaAsignacionesValidacionesTrait,
    AulaAsignacionesGestionTrait,
    ConsultasAula,
    GestionAula,
    ValidacionesAula,
    OperacionesControladorAula,
    UtilidadesAula {
    ConsultasAula::consultarAulaPorId as consultarAulaPorIdDatos;

    OperacionesControladorAula::crearAula insteadof GestionAula;
    GestionAula::crearAulaBD as crearAulaBD;

    OperacionesControladorAula::eliminarAula insteadof GestionAula;
    GestionAula::eliminarAulaBD as eliminarAulaBD;

    GestionAula::actualizarAulaBD as actualizarAulaInterno;
  }

  public function __construct()
  {
    Validator::lang('es');
  }
}
