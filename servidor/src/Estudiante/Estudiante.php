<?php

namespace Micodigo\Estudiante;

use Valitron\Validator;

require_once __DIR__ . '/../Persona/Persona.php';

// Incluir traits (se crearán y completarán en siguientes pasos)
require_once __DIR__ . '/ConsultasEstudiante.php';
require_once __DIR__ . '/GestionEstudiante.php';
require_once __DIR__ . '/ValidacionesEstudiante.php';
require_once __DIR__ . '/OperacionesControladorEstudiante.php';
require_once __DIR__ . '/UtilidadesEstudiante.php';

class Estudiante
{
  use ConsultasEstudiante,
    GestionEstudiante,
    ValidacionesEstudiante,
    OperacionesControladorEstudiante,
    UtilidadesEstudiante;

  public function __construct()
  {
    Validator::lang('es');
  }
}
