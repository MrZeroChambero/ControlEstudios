<?php

namespace Micodigo\AreasAprendizaje;

trait AreasAprendizajeAtributosTrait
{
  protected ?int $id_area_aprendizaje = null;
  protected ?string $nombre_area = null;
  protected string $estado_area = 'activo';

  protected function asignarDatos(array $datos): void
  {
    if (isset($datos['id_area_aprendizaje'])) {
      $this->id_area_aprendizaje = (int)$datos['id_area_aprendizaje'];
    }

    if (isset($datos['nombre_area'])) {
      $this->nombre_area = trim((string)$datos['nombre_area']);
    }

    if (isset($datos['estado_area']) && in_array($datos['estado_area'], ['activo', 'inactivo'], true)) {
      $this->estado_area = $datos['estado_area'];
    }
  }

  protected function limpiarNombre(?string $nombre): ?string
  {
    if ($nombre === null) {
      return null;
    }

    $nombreDepurado = preg_replace('/\s+/', ' ', trim($nombre));
    return $nombreDepurado === '' ? null : $nombreDepurado;
  }

  protected function obtenerDatosArea(): array
  {
    return [
      'id_area_aprendizaje' => $this->id_area_aprendizaje,
      'nombre_area' => $this->nombre_area,
      'estado_area' => $this->estado_area
    ];
  }
}
