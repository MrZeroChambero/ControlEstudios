<?php

namespace Micodigo\RendimientoAcademico;

use Valitron\Validator;

require_once __DIR__ . '/RendimientoAcademicoApiTrait.php';
require_once __DIR__ . '/RendimientoAcademicoContextoTrait.php';
require_once __DIR__ . '/RendimientoAcademicoConsultasTrait.php';
require_once __DIR__ . '/RendimientoAcademicoValidacionesTrait.php';
require_once __DIR__ . '/RendimientoAcademicoTransformacionesTrait.php';
require_once __DIR__ . '/RendimientoAcademicoPersistenciaTrait.php';
require_once __DIR__ . '/RendimientoAcademicoAuditoriaTrait.php';

class RendimientoAcademico
{
  use RendimientoAcademicoApiTrait;
  use RendimientoAcademicoContextoTrait;
  use RendimientoAcademicoConsultasTrait;
  use RendimientoAcademicoValidacionesTrait;
  use RendimientoAcademicoTransformacionesTrait;
  use RendimientoAcademicoPersistenciaTrait;
  use RendimientoAcademicoAuditoriaTrait;

  public function __construct()
  {
    Validator::lang('es');
  }
}
