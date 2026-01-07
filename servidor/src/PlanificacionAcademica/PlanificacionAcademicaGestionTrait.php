<?php

namespace Micodigo\PlanificacionAcademica;

use PDO;

trait PlanificacionAcademicaGestionTrait
{
  public function crear(PDO $pdo): array
  {
    $validacion = $this->validar($pdo);
    if ($validacion !== true) {
      return ['errores' => $validacion];
    }

    $contextoValido = $this->validarContextoEditable($pdo, $this->fk_momento);
    if ($contextoValido !== true) {
      return ['errores' => $contextoValido];
    }

    return $this->ejecutarEnTransaccion($pdo, function () use ($pdo) {
      $sql = 'INSERT INTO ' . PlanificacionAcademica::TABLA . ' (fk_personal, fk_aula, fk_componente, fk_momento, tipo, estado, reutilizable) VALUES (:fk_personal, :fk_aula, :fk_componente, :fk_momento, :tipo, :estado, :reutilizable)';
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        ':fk_personal' => $this->fk_personal,
        ':fk_aula' => $this->fk_aula,
        ':fk_componente' => $this->fk_componente,
        ':fk_momento' => $this->fk_momento,
        ':tipo' => $this->tipo,
        ':estado' => $this->estado,
        ':reutilizable' => $this->reutilizable,
      ]);

      $this->id_planificacion = (int)$pdo->lastInsertId();
      $this->persistirRelaciones($pdo);

      return ['id' => $this->id_planificacion, 'datos' => $this->toArray()];
    });
  }

  public function actualizar(PDO $pdo, int $id, array $payload): array
  {
    $actual = self::obtenerPorId($pdo, $id);
    if (!$actual) {
      return ['errores' => ['general' => ['Planificación no encontrada.']]];
    }

    $fusion = array_merge($actual, $payload);
    $this->asignarDatos($fusion);
    $this->id_planificacion = $id;
    $this->normalizarAutomaticamente();
    $this->establecerValoresPorDefecto();

    $validacion = $this->validar($pdo);
    if ($validacion !== true) {
      return ['errores' => $validacion];
    }

    $contextoValido = $this->validarContextoEditable($pdo, $this->fk_momento);
    if ($contextoValido !== true) {
      return ['errores' => $contextoValido];
    }

    return $this->ejecutarEnTransaccion($pdo, function () use ($pdo, $id) {
      $sql = 'UPDATE ' . PlanificacionAcademica::TABLA . ' SET fk_personal = :fk_personal, fk_aula = :fk_aula, fk_componente = :fk_componente, fk_momento = :fk_momento, tipo = :tipo, estado = :estado, reutilizable = :reutilizable WHERE id_planificacion = :id';
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        ':fk_personal' => $this->fk_personal,
        ':fk_aula' => $this->fk_aula,
        ':fk_componente' => $this->fk_componente,
        ':fk_momento' => $this->fk_momento,
        ':tipo' => $this->tipo,
        ':estado' => $this->estado,
        ':reutilizable' => $this->reutilizable,
        ':id' => $id,
      ]);

      $this->persistirRelaciones($pdo);

      return ['id' => $id, 'datos' => self::obtenerPorId($pdo, $id)];
    });
  }

  public function cambiarEstado(PDO $pdo, int $id, string $nuevoEstado): array
  {
    $nuevoEstado = $this->limpiarString($nuevoEstado) ?? '';
    if (!in_array($nuevoEstado, ['activo', 'inactivo'], true)) {
      return ['errores' => ['estado' => ['Estado inválido.']]];
    }

    $plan = self::obtenerPorId($pdo, $id);
    if (!$plan) {
      return ['errores' => ['general' => ['Planificación no encontrada.']]];
    }

    if ($nuevoEstado === 'inactivo' && $this->tieneRegistrosHijos($pdo, $id)) {
      return ['errores' => ['estado' => ['No puede desactivar la planificación porque tiene dependencias activas.']]];
    }

    $momentoPlan = isset($plan['fk_momento']) ? (int) $plan['fk_momento'] : null;
    $contextoValido = $this->validarContextoEditable($pdo, $momentoPlan);
    if ($contextoValido !== true) {
      return ['errores' => $contextoValido];
    }

    $stmt = $pdo->prepare('UPDATE ' . PlanificacionAcademica::TABLA . ' SET estado = :estado WHERE id_planificacion = :id');
    $stmt->execute([':estado' => $nuevoEstado, ':id' => $id]);

    return ['id' => $id, 'datos' => self::obtenerPorId($pdo, $id)];
  }

  protected function persistirRelaciones(PDO $pdo): void
  {
    $this->sincronizarCompetencias($pdo);
    $this->sincronizarEstudiantes($pdo);
  }

  private function sincronizarCompetencias(PDO $pdo): void
  {
    $stmt = $pdo->prepare('DELETE FROM ' . PlanificacionAcademica::TABLA_COMPETENCIAS . ' WHERE fk_planificacion = :id');
    $stmt->execute([':id' => $this->id_planificacion]);

    if (!$this->competencias) {
      return;
    }

    $sql = 'INSERT INTO ' . PlanificacionAcademica::TABLA_COMPETENCIAS . ' (fk_competencias, fk_planificacion) VALUES (:fk_competencias, :fk_planificacion)';
    $insert = $pdo->prepare($sql);
    foreach ($this->competencias as $competencia) {
      $insert->execute([
        ':fk_competencias' => $competencia,
        ':fk_planificacion' => $this->id_planificacion,
      ]);
    }
  }

  private function sincronizarEstudiantes(PDO $pdo): void
  {
    $stmt = $pdo->prepare('DELETE FROM ' . PlanificacionAcademica::TABLA_INDIVIDUALES . ' WHERE fk_planificacion = :id');
    $stmt->execute([':id' => $this->id_planificacion]);

    if ($this->tipo !== 'individual' || !$this->estudiantes) {
      return;
    }

    $sql = 'INSERT INTO ' . PlanificacionAcademica::TABLA_INDIVIDUALES . ' (fk_planificacion, fk_estudiante) VALUES (:fk_planificacion, :fk_estudiante)';
    $insert = $pdo->prepare($sql);
    foreach ($this->estudiantes as $inscripcion) {
      $insert->execute([
        ':fk_planificacion' => $this->id_planificacion,
        ':fk_estudiante' => $inscripcion,
      ]);
    }
  }
}
