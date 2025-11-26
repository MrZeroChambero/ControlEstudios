<?php

namespace Micodigo\Aula;

use Valitron\Validator;

require_once __DIR__ . '/ConsultasAula.php';
require_once __DIR__ . '/GestionAula.php';
require_once __DIR__ . '/ValidacionesAula.php';
require_once __DIR__ . '/OperacionesControladorAula.php';
require_once __DIR__ . '/UtilidadesAula.php';

class Aula
{
  use ConsultasAula,
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
