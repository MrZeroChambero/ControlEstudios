<?php

namespace Micodigo\PlanificacionAcademica;

trait PlanificacionAcademicaAtributosTrait
{
  protected ?int $id_planificacion = null;
  protected ?int $fk_personal = null;
  protected ?int $fk_aula = null;
  protected ?int $fk_componente = null;
  protected ?int $fk_momento = null;
  protected ?string $tipo = null;
  protected ?string $estado = null;
  protected ?string $reutilizable = null;
  protected array $competencias = [];
  protected array $estudiantes = [];

  protected function asignarDatos(array $datos): void
  {
    if (array_key_exists('id_planificacion', $datos)) {
      $this->id_planificacion = $this->valorEntero($datos['id_planificacion']);
    }
    if (array_key_exists('fk_personal', $datos)) {
      $this->fk_personal = $this->valorEntero($datos['fk_personal']);
    }
    if (array_key_exists('fk_aula', $datos)) {
      $this->fk_aula = $this->valorEntero($datos['fk_aula']);
    }
    if (array_key_exists('fk_componente', $datos)) {
      $this->fk_componente = $this->valorEntero($datos['fk_componente']);
    }
    if (array_key_exists('fk_momento', $datos)) {
      $this->fk_momento = $this->valorEntero($datos['fk_momento']);
    }
    if (array_key_exists('tipo', $datos)) {
      $this->tipo = $this->limpiarString($datos['tipo']);
    }
    if (array_key_exists('estado', $datos)) {
      $this->estado = $this->limpiarString($datos['estado']);
    }
    if (array_key_exists('reutilizable', $datos)) {
      $this->reutilizable = $this->limpiarString($datos['reutilizable']);
    }
    if (array_key_exists('competencias', $datos)) {
      $this->competencias = $this->depurarColeccionEnteros($datos['competencias']);
    }
    if (array_key_exists('estudiantes', $datos)) {
      $this->estudiantes = $this->depurarColeccionEnteros($datos['estudiantes']);
    }
  }

  protected function normalizarAutomaticamente(): void
  {
    foreach (['tipo', 'estado', 'reutilizable'] as $campo) {
      if (is_string($this->{$campo})) {
        $this->{$campo} = $this->limpiarString($this->{$campo});
      }
    }
  }

  protected function establecerValoresPorDefecto(): void
  {
    $this->tipo ??= 'aula';
    $this->estado ??= 'activo';
    $this->reutilizable ??= 'no';
  }

  protected function obtenerPayloadValidable(): array
  {
    return [
      'id_planificacion' => $this->id_planificacion,
      'fk_personal' => $this->fk_personal,
      'fk_aula' => $this->fk_aula,
      'fk_componente' => $this->fk_componente,
      'fk_momento' => $this->fk_momento,
      'tipo' => $this->tipo,
      'estado' => $this->estado,
      'reutilizable' => $this->reutilizable,
      'competencias' => $this->competencias,
      'estudiantes' => $this->estudiantes,
    ];
  }

  protected function reiniciarEstadoInterno(): void
  {
    $this->id_planificacion = null;
    $this->fk_personal = null;
    $this->fk_aula = null;
    $this->fk_componente = null;
    $this->fk_momento = null;
    $this->tipo = null;
    $this->estado = null;
    $this->reutilizable = null;
    $this->competencias = [];
    $this->estudiantes = [];
  }

  public function toArray(): array
  {
    return [
      'id_planificacion' => $this->id_planificacion,
      'fk_personal' => $this->fk_personal,
      'fk_aula' => $this->fk_aula,
      'fk_componente' => $this->fk_componente,
      'fk_momento' => $this->fk_momento,
      'tipo' => $this->tipo,
      'estado' => $this->estado,
      'reutilizable' => $this->reutilizable,
      'competencias' => $this->competencias,
      'estudiantes' => $this->estudiantes,
    ];
  }
}
