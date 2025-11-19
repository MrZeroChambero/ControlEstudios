<?php

namespace Micodigo\DocumentosAcademicos;

use Valitron\Validator;

require_once __DIR__ . '/DocumentosAcademicosAtributosTrait.php';
require_once __DIR__ . '/DocumentosAcademicosValidacionesTrait.php';
require_once __DIR__ . '/DocumentosAcademicosGestionTrait.php';
require_once __DIR__ . '/DocumentosAcademicosConsultasTrait.php';
require_once __DIR__ . '/DocumentosAcademicosOperacionesControladorTrait.php';
require_once __DIR__ . '/DocumentosAcademicosUtilidadesTrait.php';

class DocumentosAcademicos
{
  use DocumentosAcademicosAtributosTrait,
    DocumentosAcademicosValidacionesTrait,
    DocumentosAcademicosGestionTrait,
    DocumentosAcademicosConsultasTrait,
    DocumentosAcademicosOperacionesControladorTrait,
    DocumentosAcademicosUtilidadesTrait;

  public function __construct(array $data = [])
  {
    $this->fk_estudiante = $data['fk_estudiante'] ?? null;
    $this->tipo_documento = $data['tipo_documento'] ?? null;
    $this->grado = $data['grado'] ?? null;
    $this->entregado = $data['entregado'] ?? 'no';
    $this->observaciones = $data['observaciones'] ?? null;
    Validator::lang('es');
  }
}
