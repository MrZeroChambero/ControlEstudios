<?php

namespace Micodigo\AnioEscolar;

use Valitron\Validator;

require_once __DIR__ . '/ConsultasAnioEscolar.php';
require_once __DIR__ . '/GestionAnioEscolar.php';
require_once __DIR__ . '/ValidacionesAnioEscolar.php';
require_once __DIR__ . '/OperacionesControladorAnioEscolar.php';
require_once __DIR__ . '/UtilidadesAnioEscolar.php';

class AnioEscolar
{
  use ConsultasAnioEscolar,
    GestionAnioEscolar,
    ValidacionesAnioEscolar,
    OperacionesControladorAnioEscolar,
    UtilidadesAnioEscolar {
    ConsultasAnioEscolar::consultarAnioPorId as consultarAnioPorIdDatos;

    OperacionesControladorAnioEscolar::crearAnio insteadof GestionAnioEscolar;
    GestionAnioEscolar::crearAnioBD as crearAnioBD;

    OperacionesControladorAnioEscolar::eliminarAnio insteadof GestionAnioEscolar;
    GestionAnioEscolar::eliminarAnioBD as eliminarAnioBD;

    GestionAnioEscolar::actualizarAnioBD as actualizarAnioInterno;
  }

  public function __construct()
  {
    Validator::lang('es');
  }
}
