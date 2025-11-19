<?php

namespace Micodigo\ConsultasMedicas;

trait ConsultasMedicasAtributosTrait
{
  public $id_consulta;
  public $fk_estudiante;
  public $tipo_consulta;
  public $motivo;
  public $tiene_informe_medico;
  public $fecha_consulta;
  public $observaciones;
}
