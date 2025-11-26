<?php

namespace Micodigo\GradosSecciones;

use Valitron\Validator;

require_once __DIR__ . '/ConsultasGradosSecciones.php';
require_once __DIR__ . '/GestionGradosSecciones.php';
require_once __DIR__ . '/ValidacionesGradosSecciones.php';
require_once __DIR__ . '/OperacionesControladorGradosSecciones.php';
require_once __DIR__ . '/UtilidadesGradosSecciones.php';

class GradosSecciones
{
  use ConsultasGradosSecciones,
    GestionGradosSecciones,
    ValidacionesGradosSecciones,
    OperacionesControladorGradosSecciones,
    UtilidadesGradosSecciones {
    ConsultasGradosSecciones::consultarGradoSeccionPorId as consultarGradoSeccionPorIdDatos;

    OperacionesControladorGradosSecciones::crearGradoSeccion insteadof GestionGradosSecciones;
    GestionGradosSecciones::crearGradoSeccionBD as crearGradoSeccionBD;

    OperacionesControladorGradosSecciones::eliminarGradoSeccion insteadof GestionGradosSecciones;
    GestionGradosSecciones::eliminarGradoSeccionBD as eliminarGradoSeccionBD;

    GestionGradosSecciones::actualizarGradoSeccionBD as actualizarGradoSeccionInterno;
  }

  public function __construct()
  {
    Validator::lang('es');
  }
}
