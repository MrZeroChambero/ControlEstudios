<?php

namespace Micodigo\Personal;

use Valitron\Validator;

require_once __DIR__ . '/ConsultasPersonal.php';
require_once __DIR__ . '/GestionPersonal.php';
require_once __DIR__ . '/ValidacionesPersonal.php';
require_once __DIR__ . '/OperacionesControladorPersonal.php';
require_once __DIR__ . '/UtilidadesPersonal.php';

class Personal
{
  use ConsultasPersonal,
    GestionPersonal,
    ValidacionesPersonal,
    OperacionesControladorPersonal,
    UtilidadesPersonal {
    OperacionesControladorPersonal::obtenerPersonalCompleto insteadof ConsultasPersonal;
    ConsultasPersonal::obtenerPersonalCompleto as obtenerPersonalCompletoDatos;

    // Precedencia: usar método endpoint crearPersona del controlador
    OperacionesControladorPersonal::crearPersona insteadof GestionPersonal;
    GestionPersonal::crearPersona as crearPersonaBD;

    OperacionesControladorPersonal::eliminarPersonal insteadof GestionPersonal;
    GestionPersonal::eliminarPersonal as eliminarPersonalBD;

    OperacionesControladorPersonal::cambiarEstadoPersonal insteadof GestionPersonal;
    GestionPersonal::cambiarEstadoPersonal as cambiarEstadoPersonalBD;

    GestionPersonal::actualizarPersonalBD as actualizarPersonalInterno;
  }

  public function __construct()
  {
    Validator::lang('es');
  }
}
