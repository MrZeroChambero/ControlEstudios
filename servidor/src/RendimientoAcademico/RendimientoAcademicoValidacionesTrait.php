<?php

namespace Micodigo\RendimientoAcademico;

use RuntimeException;

trait RendimientoAcademicoValidacionesTrait
{
  protected function valorEntero(mixed $valor): ?int
  {
    if ($valor === null || $valor === '') {
      return null;
    }

    if (is_int($valor)) {
      return $valor;
    }

    if (is_numeric($valor) && (string) (int) $valor === trim((string) $valor)) {
      return (int) $valor;
    }

    return null;
  }

  protected function valorEnteroPositivo(mixed $valor): ?int
  {
    $entero = $this->valorEntero($valor);
    if ($entero === null || $entero <= 0) {
      return null;
    }

    return $entero;
  }

  protected function asegurarPermisoEvaluacion(
    array $usuario,
    ?array $asignacionDocente,
    int $componenteId
  ): void {
    if ($this->usuarioPuedeSupervisarTodasLasAulas($usuario)) {
      return;
    }

    if (!$this->usuarioEsDocente($usuario)) {
      throw new RuntimeException('El usuario autenticado no posee permisos para cargar evaluaciones.');
    }

    if ($asignacionDocente === null) {
      throw new RuntimeException('No se encontró una asignación activa del docente para el componente seleccionado.');
    }

    if ((int) ($asignacionDocente['fk_componente'] ?? 0) !== $componenteId) {
      throw new RuntimeException('El docente no está asignado a este componente.');
    }
  }

  protected function validarEstadoAulaActiva(array $aula): void
  {
    if (($aula['estado'] ?? null) !== 'activo') {
      throw new RuntimeException('El aula seleccionada no está activa para evaluaciones.');
    }
  }

  protected function validarComponenteActivo(array $componente): void
  {
    if (($componente['estado_componente'] ?? null) !== 'activo') {
      throw new RuntimeException('El componente de aprendizaje se encuentra inactivo.');
    }
    if (($componente['evalua'] ?? 'no') !== 'si') {
      throw new RuntimeException('El componente seleccionado no admite evaluaciones de rendimiento.');
    }
  }

  protected function validarInscripcionActiva(array $inscripcion): void
  {
    if (($inscripcion['estado_inscripcion'] ?? null) !== 'activo') {
      throw new RuntimeException('El estudiante seleccionado no posee una inscripción activa.');
    }
  }

  protected function validarMomentoActivo(array $momento): void
  {
    if (($momento['estado_momento'] ?? null) !== 'activo') {
      throw new RuntimeException('El momento escolar seleccionado no se encuentra activo.');
    }
  }

  protected function validarPlanificacionActiva(?array $planificacion, int $estudianteId): void
  {
    if ($planificacion === null) {
      throw new RuntimeException('No existe una planificación activa asociada al estudiante ' . $estudianteId . ' para este componente.');
    }
    if (($planificacion['estado'] ?? null) !== 'activo') {
      throw new RuntimeException('La planificación asociada al estudiante ' . $estudianteId . ' no está activa.');
    }
  }

  protected function validarIndicadorPermitido(array $indicadoresPermitidos, int $estudianteId, int $indicadorId): void
  {
    $permitidos = $indicadoresPermitidos[$estudianteId] ?? [];
    if (!in_array($indicadorId, $permitidos, true)) {
      throw new RuntimeException('El indicador ' . $indicadorId . ' no forma parte de la planificación asignada al estudiante.');
    }
  }
}
