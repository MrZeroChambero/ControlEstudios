<?php

namespace Micodigo\Contenidos;

trait ContenidosAtributosTrait
{
  protected ?int $id_contenido = null;
  protected ?int $fk_componente = null;
  protected ?string $nombre_contenido = null;
  protected ?string $grado = null;
  protected ?string $descripcion = null;
  protected string $estado = 'activo';

  protected const GRADOS_VALIDOS = ['1', '2', '3', '4', '5', '6', 'general'];

  protected function asignarDatos(array $datos): void
  {
    if (isset($datos['id_contenido'])) {
      $this->id_contenido = is_numeric($datos['id_contenido'])
        ? (int)$datos['id_contenido']
        : null;
    }

    if (isset($datos['fk_componente'])) {
      $this->fk_componente = is_numeric($datos['fk_componente'])
        ? (int)$datos['fk_componente']
        : null;
    }

    if (isset($datos['nombre_contenido'])) {
      $this->nombre_contenido = $this->limpiarTexto($datos['nombre_contenido']);
    }

    if (isset($datos['grado'])) {
      $this->grado = $this->normalizarGrado($datos['grado']);
    }

    if (array_key_exists('descripcion', $datos)) {
      $this->descripcion = $this->limpiarTexto($datos['descripcion']);
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

  protected function normalizarGrado(?string $valor): ?string
  {
    if ($valor === null) {
      return null;
    }

    $limpio = strtolower(trim((string)$valor));

    $mapa = [
      '1' => '1',
      'primero' => '1',
      '01' => '1',
      '2' => '2',
      'segundo' => '2',
      '02' => '2',
      '3' => '3',
      'tercero' => '3',
      '03' => '3',
      '4' => '4',
      'cuarto' => '4',
      '04' => '4',
      '5' => '5',
      'quinto' => '5',
      '05' => '5',
      '6' => '6',
      'sexto' => '6',
      '06' => '6',
      'general' => 'general',
    ];

    return $mapa[$limpio] ?? null;
  }

  protected function obtenerDatosContenido(): array
  {
    return [
      'id_contenido' => $this->id_contenido,
      'fk_componente' => $this->fk_componente,
      'nombre_contenido' => $this->nombre_contenido,
      'grado' => $this->grado,
      'descripcion' => $this->descripcion,
      'estado' => $this->estado,
    ];
  }
}
