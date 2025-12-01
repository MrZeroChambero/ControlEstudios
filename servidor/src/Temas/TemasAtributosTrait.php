<?php

namespace Micodigo\Temas;

trait TemasAtributosTrait
{
  protected ?int $id_tema = null;
  protected ?int $fk_contenido = null;
  protected ?string $nombre_tema = null;
  protected string $estado = 'activo';

  protected function asignarDatos(array $datos): void
  {
    if (isset($datos['id_tema'])) {
      $this->id_tema = is_numeric($datos['id_tema']) ? (int)$datos['id_tema'] : null;
    }

    if (isset($datos['fk_contenido'])) {
      $this->fk_contenido = is_numeric($datos['fk_contenido']) ? (int)$datos['fk_contenido'] : null;
    }

    if (isset($datos['nombre_tema'])) {
      $this->nombre_tema = $this->limpiarTexto($datos['nombre_tema']);
    }

    if (isset($datos['estado']) && in_array($datos['estado'], ['activo', 'inactivo'], true)) {
      $this->estado = $datos['estado'];
    }
  }

  protected function limpiarTexto(?string $valor): ?string
  {
    if ($valor === null) {
      return null;
    }

    $limpio = preg_replace('/\s+/', ' ', trim($valor));
    return $limpio === '' ? null : $limpio;
  }

  protected function obtenerDatosTema(): array
  {
    return [
      'id_tema' => $this->id_tema,
      'fk_contenido' => $this->fk_contenido,
      'nombre_tema' => $this->nombre_tema,
      'estado' => $this->estado,
    ];
  }
}
