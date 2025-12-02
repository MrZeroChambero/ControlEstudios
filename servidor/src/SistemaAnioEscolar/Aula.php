<?php

namespace Micodigo\SistemaAnioEscolar;

class Aula
{
  public function __construct(
    public ?int $id = null,
    public ?int $anio_escolar_id = null,
    public string $nombre = ''
  ) {}
}
