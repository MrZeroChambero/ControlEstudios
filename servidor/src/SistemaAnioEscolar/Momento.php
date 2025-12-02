<?php

namespace Micodigo\SistemaAnioEscolar;

class Momento
{
  public function __construct(
    public ?int $id = null,
    public ?int $anio_escolar_id = null,
    public string $nombre = '',
    public int $orden = 1,
    public string $fecha_inicio = '',
    public string $fecha_final = '',
    public string $estado = 'activo'
  ) {}
}
