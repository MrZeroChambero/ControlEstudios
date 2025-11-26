<?php

namespace Micodigo\MomentoAcademico;

use Valitron\Validator;

require_once __DIR__ . '/ConsultasMomentoAcademico.php';
require_once __DIR__ . '/GestionMomentoAcademico.php';
require_once __DIR__ . '/ValidacionesMomentoAcademico.php';
require_once __DIR__ . '/OperacionesControladorMomentoAcademico.php';
require_once __DIR__ . '/UtilidadesMomentoAcademico.php';

class MomentoAcademico
{
  use ConsultasMomentoAcademico,
    GestionMomentoAcademico,
    ValidacionesMomentoAcademico,
    OperacionesControladorMomentoAcademico,
    UtilidadesMomentoAcademico {
    ConsultasMomentoAcademico::consultarMomentoPorId as consultarMomentoPorIdDatos;

    OperacionesControladorMomentoAcademico::crearMomento insteadof GestionMomentoAcademico;
    GestionMomentoAcademico::crearMomentoBD as crearMomentoBD;

    OperacionesControladorMomentoAcademico::eliminarMomento insteadof GestionMomentoAcademico;
    GestionMomentoAcademico::eliminarMomentoBD as eliminarMomentoBD;

    GestionMomentoAcademico::actualizarMomentoBD as actualizarMomentoInterno;
  }

  public function __construct()
  {
    Validator::lang('es');
  }
}
