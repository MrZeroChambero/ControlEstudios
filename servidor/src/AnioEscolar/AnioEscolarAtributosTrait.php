<?php

namespace Micodigo\AnioEscolar;

trait AnioEscolarAtributosTrait
{
  protected ?int $id_anio_escolar = null;
  protected ?string $fecha_inicio = null;
  protected ?string $fecha_fin = null;
  protected ?string $fecha_limite_inscripcion = null;
  protected string $estado = 'incompleto';
  protected array $momentos = [];

  protected const ESTADOS_VALIDOS = ['activo', 'inactivo', 'incompleto'];

  protected function asignarDatos(array $datos): void
  {
    if (isset($datos['id_anio_escolar'])) {
      $this->id_anio_escolar = is_numeric($datos['id_anio_escolar'])
        ? (int) $datos['id_anio_escolar']
        : null;
    }

    if (isset($datos['fecha_inicio'])) {
      $this->fecha_inicio = $datos['fecha_inicio'];
    }

    if (isset($datos['fecha_fin'])) {
      $this->fecha_fin = $datos['fecha_fin'];
    }

    if (isset($datos['fecha_limite_inscripcion'])) {
      $this->fecha_limite_inscripcion = $datos['fecha_limite_inscripcion'];
    } elseif (isset($datos['limite_inscripcion'])) {
      $this->fecha_limite_inscripcion = $datos['limite_inscripcion'];
    }

    if (isset($datos['estado'])) {
      $this->estado = $this->normalizarEstado($datos['estado']);
    }

    if (isset($datos['momentos']) && is_array($datos['momentos'])) {
      $this->momentos = $datos['momentos'];
    }
  }

  protected function normalizarEstado(?string $estado): string
  {
    if ($estado === null) {
      return 'incompleto';
    }

    $estadoLimpio = strtolower(trim($estado));
    return in_array($estadoLimpio, self::ESTADOS_VALIDOS, true) ? $estadoLimpio : 'incompleto';
  }

  protected function obtenerDatosAnio(): array
  {
    return [
      'id_anio_escolar' => $this->id_anio_escolar,
      'fecha_inicio' => $this->fecha_inicio,
      'fecha_fin' => $this->fecha_fin,
      'fecha_limite_inscripcion' => $this->fecha_limite_inscripcion,
      'limite_inscripcion' => $this->fecha_limite_inscripcion,
      'estado' => $this->estado,
      'momentos' => $this->momentos,
    ];
  }
}
