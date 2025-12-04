<?php

namespace Micodigo\Aula;

use Micodigo\Impartir\Impartir;
use PDO;

trait AulaAsignacionesTrait
{
  protected ?Impartir $servicioImpartir = null;

  protected function obtenerServicioImpartir(): Impartir
  {
    if ($this->servicioImpartir === null) {
      $this->servicioImpartir = new Impartir();
    }

    return $this->servicioImpartir;
  }

  protected function obtenerResumenGestionGeneral(PDO $conexion): array
  {
    return $this->obtenerServicioImpartir()->obtenerResumenGestion($conexion);
  }

  protected function registrarDocenteTitular(PDO $conexion, int $aulaId, array $entrada): void
  {
    $this->obtenerServicioImpartir()->registrarDocenteTitular($conexion, $aulaId, $entrada);
  }

  protected function eliminarDocenteTitularAsignacion(PDO $conexion, int $aulaId): void
  {
    $this->obtenerServicioImpartir()->removerDocenteTitular($conexion, $aulaId);
  }

  protected function registrarEspecialista(PDO $conexion, int $aulaId, array $entrada): void
  {
    $this->obtenerServicioImpartir()->registrarEspecialista($conexion, $aulaId, $entrada);
  }

  protected function eliminarEspecialistaAsignacion(PDO $conexion, int $aulaId, int $componenteId): void
  {
    $this->obtenerServicioImpartir()->removerEspecialista($conexion, $aulaId, $componenteId);
  }
}
