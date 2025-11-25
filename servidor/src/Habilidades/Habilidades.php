<?php

namespace Micodigo\Habilidades;

use Valitron\Validator;

require_once __DIR__ . '/ConsultasHabilidades.php';
require_once __DIR__ . '/GestionHabilidades.php';
require_once __DIR__ . '/ValidacionesHabilidades.php';
require_once __DIR__ . '/OperacionesControladorHabilidades.php';

class Habilidades
{
  use ConsultasHabilidades,
    GestionHabilidades,
    ValidacionesHabilidades,
    OperacionesControladorHabilidades;

  public function __construct()
  {
    Validator::lang('es');
  }
}
