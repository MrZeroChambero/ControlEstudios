<?php

namespace Micodigo\RendimientoAcademico;

trait RendimientoAcademicoAuditoriaTrait
{
  /**
   * Auditoría deshabilitada: se deja método vacío para preservar compatibilidad.
   */
  protected function registrarAuditoriaEvaluacion(
    $conexion = null,
    $accion = null,
    $usuario = null,
    $momentoId = null,
    $componenteId = null,
    $estudianteId = null,
    $indicadorId = null,
    $anterior = null,
    $nuevo = null
  ): void {
    // Auditoría de evaluaciones pendiente de reimplementación.
  }

  /**
   * Retorna un historial vacío mientras la característica se reimplementa.
   */
  protected function obtenerHistorialEvaluaciones(
    $conexion = null,
    $estudianteId = null,
    $indicadorId = null
  ): array {
    return [];
  }
}
