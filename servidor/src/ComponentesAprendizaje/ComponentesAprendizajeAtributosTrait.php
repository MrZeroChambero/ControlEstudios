<?php

namespace Micodigo\ComponentesAprendizaje;

trait ComponentesAprendizajeAtributosTrait
{
  protected const TIPOS_DOCENTE_PERMITIDOS = [
    'Docente de aula',
    'Docente especialista',
    'Docente de cultura',
  ];

  protected ?int $id_componente = null;
  protected ?int $fk_area = null;
  protected ?string $nombre_componente = null;
  protected ?string $especialista = null;
  protected string $evalua = 'no';
  protected string $estado_componente = 'activo';

  protected function asignarDatos(array $datos): void
  {
    if (isset($datos['id_componente'])) {
      $this->id_componente = (int)$datos['id_componente'];
    }

    if (isset($datos['fk_area'])) {
      $this->fk_area = is_numeric($datos['fk_area']) ? (int)$datos['fk_area'] : null;
    }

    if (isset($datos['nombre_componente'])) {
      $this->nombre_componente = $this->limpiarTexto($datos['nombre_componente']);
    }

    if (isset($datos['especialista'])) {
      $this->especialista = $this->normalizarTipoDocente($datos['especialista']);
    }

    if (isset($datos['evalua']) && in_array($datos['evalua'], ['si', 'no'], true)) {
      $this->evalua = $datos['evalua'];
    }

    if (isset($datos['estado_componente']) && in_array($datos['estado_componente'], ['activo', 'inactivo'], true)) {
      $this->estado_componente = $datos['estado_componente'];
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

  protected function obtenerDatosComponente(): array
  {
    return [
      'id_componente' => $this->id_componente,
      'fk_area' => $this->fk_area,
      'nombre_componente' => $this->nombre_componente,
      'especialista' => $this->especialista,
      'evalua' => $this->evalua,
      'estado_componente' => $this->estado_componente,
    ];
  }

  protected function normalizarTipoDocente(mixed $valor): ?string
  {
    if ($valor === null) {
      return null;
    }

    $texto = $this->limpiarTexto((string) $valor);
    if ($texto === null) {
      return null;
    }

    $comparar = strtolower($texto);

    foreach (self::TIPOS_DOCENTE_PERMITIDOS as $opcion) {
      if (strtolower($opcion) === $comparar) {
        return $opcion;
      }
    }

    if (str_contains($comparar, 'cultur')) {
      return 'Docente de cultura';
    }

    if ($comparar === 'si' || str_contains($comparar, 'especial')) {
      return 'Docente especialista';
    }

    if ($comparar === 'no') {
      return 'Docente de aula';
    }

    if (str_contains($comparar, 'aula') || str_contains($comparar, 'docente')) {
      return 'Docente de aula';
    }

    return null;
  }

  protected function obtenerCodigoTipoDocente(?string $valor): ?string
  {
    $tipo = $this->normalizarTipoDocente($valor);
    if ($tipo === null) {
      return null;
    }

    return match ($tipo) {
      'Docente especialista' => 'especialista',
      'Docente de cultura' => 'cultura',
      default => 'aula',
    };
  }
}
