<?php

namespace Micodigo\ImparticionClases;

use Valitron\Validator;

require_once __DIR__ . '/ConsultasImparticionClases.php';
require_once __DIR__ . '/GestionImparticionClases.php';
require_once __DIR__ . '/ValidacionesImparticionClases.php';
require_once __DIR__ . '/OperacionesControladorImparticionClases.php';
require_once __DIR__ . '/UtilidadesImparticionClases.php';

class ImparticionClases
{
  use ConsultasImparticionClases,
    GestionImparticionClases,
    ValidacionesImparticionClases,
    OperacionesControladorImparticionClases,
    UtilidadesImparticionClases {
    ConsultasImparticionClases::consultarImparticionPorId as consultarImparticionPorIdDatos;

    OperacionesControladorImparticionClases::crearImparticion insteadof GestionImparticionClases;
    GestionImparticionClases::crearImparticionBD as crearImparticionBD;

    OperacionesControladorImparticionClases::eliminarImparticion insteadof GestionImparticionClases;
    GestionImparticionClases::eliminarImparticionBD as eliminarImparticionBD;

    GestionImparticionClases::actualizarImparticionBD as actualizarImparticionInterno;
  }

  public function __construct()
  {
    Validator::lang('es');
  }
}
