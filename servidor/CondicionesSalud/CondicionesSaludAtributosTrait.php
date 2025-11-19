<?php

namespace Micodigo\CondicionesSalud;

trait CondicionesSaludAtributosTrait
{
  public $id_condicion;
  public $fk_estudiante;
  public $fk_patologia;
  public $afectado;
  public $presente_en;
  public $tipo_familiar;
  public $fecha_deteccion;
  public $cronica;
  public $impedimento_fisico;
  public $observaciones;
}
