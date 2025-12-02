<?php

namespace Micodigo\SistemaAnioEscolar;

use Exception;
use PDO;
use PDOException;
use Micodigo\SistemaAnioEscolar\Traits\OperacionesAnio;
use Micodigo\SistemaAnioEscolar\Traits\ValidacionesAnioEscolar;
use Micodigo\SistemaAnioEscolar\Traits\ValidacionesMomentos;

class AnioEscolar
{
  use ValidacionesAnioEscolar;
  use ValidacionesMomentos;
  use OperacionesAnio;

  public function __construct(private PDO $pdo) {}

  public function listar(): array
  {
    $conteoAulas = $this->obtenerConteoAulas();
    $sql = 'SELECT a.*, m.id_momento, m.nombre AS momento_nombre, m.orden, m.fecha_inicio AS momento_inicio, m.fecha_fin AS momento_fin, m.estado AS momento_estado
                FROM anios_escolares a
                LEFT JOIN momentos_academicos m ON m.fk_anio_escolar = a.id_anio_escolar
                ORDER BY a.fecha_inicio DESC, m.orden ASC';
    $stmt = $this->pdo->query($sql);
    $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $resultado = [];
    foreach ($registros as $fila) {
      $id = (int) $fila['id_anio_escolar'];
      if (!isset($resultado[$id])) {
        $resultado[$id] = [
          'id' => $id,
          'nombre' => $fila['nombre'] ?? sprintf('Año Escolar %s', $fila['fecha_inicio']),
          'fecha_inicio' => $fila['fecha_inicio'],
          'fecha_final' => $fila['fecha_fin'],
          'fecha_limite_inscripcion' => $fila['fecha_limite_inscripcion'] ?? $fila['fecha_inicio'],
          'estado' => $fila['estado'],
          'aulas_asignadas' => $conteoAulas[$id] ?? 0,
          'momentos' => [],
        ];
      }

      if (!empty($fila['id_momento'])) {
        $resultado[$id]['momentos'][] = [
          'id' => (int) $fila['id_momento'],
          'orden' => (int) $fila['orden'],
          'nombre' => $fila['momento_nombre'],
          'fecha_inicio' => $fila['momento_inicio'],
          'fecha_final' => $fila['momento_fin'],
          'estado' => $fila['momento_estado'],
        ];
      }
    }

    return $this->formatearRespuesta(array_values($resultado), 'Listado de años escolares obtenido.');
  }

  public function crear(array $input): array
  {
    $validacion = $this->validarDatosAnio($input, false, null);
    if (!$validacion['valido']) {
      return $this->formatearRespuesta([], 'Errores de validación al crear el año escolar.', false, $validacion['errores']);
    }

    if ($this->existeAnioConEstado(['activo', 'incompleto'])) {
      return $this->formatearRespuesta([], 'Ya existe un año escolar activo o incompleto. Debe cerrarlo antes de crear uno nuevo.', false, [
        'estado' => ['Actualmente hay un año activo o incompleto.'],
      ]);
    }

    $datosAnio = $validacion['datos'];
    $momentos = $this->generarMomentosAutomaticos($datosAnio);

    try {
      $this->pdo->beginTransaction();
      $anioId = $this->insertarAnio($datosAnio);
      foreach ($momentos as $momento) {
        $this->insertarMomento($anioId, $momento);
      }
      $this->pdo->commit();

      $anioCreado = $this->obtenerAnioPorId($anioId);
      return $this->formatearRespuesta($anioCreado ?? [], 'Año escolar creado exitosamente.');
    } catch (PDOException $e) {
      if ($this->pdo->inTransaction()) {
        $this->pdo->rollBack();
      }
      return $this->formatearRespuesta([], 'Error interno al crear el año escolar.', false, [
        'exception' => [$e->getMessage()],
      ]);
    }
  }

  public function actualizar(int $id, array $input): array
  {
    $anioExistente = $this->obtenerAnioPorId($id);
    if ($anioExistente === null) {
      return $this->formatearRespuesta([], 'El año escolar solicitado no existe.', false, [
        'id' => ['Registro no encontrado.'],
      ]);
    }

    $validacion = $this->validarDatosAnio($input, true, $id);
    if (!$validacion['valido']) {
      return $this->formatearRespuesta([], 'Errores de validación al actualizar el año escolar.', false, $validacion['errores']);
    }

    $datosAnio = $validacion['datos'];
    $momentosInput = $input['momentos'] ?? $anioExistente['momentos'];
    $momentosNormalizados = array_map(function ($momento) {
      return [
        'id' => $momento['id'] ?? $momento['id_momento'] ?? null,
        'orden' => (int) ($momento['orden'] ?? 0),
        'nombre' => $momento['nombre'] ?? $momento['momento_nombre'] ?? ('Momento ' . ($momento['orden'] ?? 0)),
        'fecha_inicio' => $momento['fecha_inicio'] ?? $momento['momento_inicio'] ?? null,
        'fecha_final' => $momento['fecha_final'] ?? $momento['fecha_fin'] ?? null,
        'estado' => $momento['estado'] ?? $momento['momento_estado'] ?? 'activo',
      ];
    }, $momentosInput ?? []);

    $momentosValidados = $this->validarMomentos($momentosNormalizados, $datosAnio);
    if (!$momentosValidados['valido']) {
      return $this->formatearRespuesta([], 'Errores al validar los momentos académicos.', false, $momentosValidados['errores']);
    }

    try {
      $this->pdo->beginTransaction();
      $this->actualizarAnio($id, $datosAnio);
      $this->actualizarMomentos($id, $momentosValidados['momentos']);
      $this->pdo->commit();

      $anioActualizado = $this->obtenerAnioPorId($id);
      return $this->formatearRespuesta($anioActualizado ?? [], 'Año escolar actualizado exitosamente.');
    } catch (PDOException $e) {
      if ($this->pdo->inTransaction()) {
        $this->pdo->rollBack();
      }
      return $this->formatearRespuesta([], 'Error interno al actualizar el año escolar.', false, [
        'exception' => [$e->getMessage()],
      ]);
    }
  }

  public function eliminar(int $id): array
  {
    $anioExistente = $this->obtenerAnioPorId($id);
    if ($anioExistente === null) {
      return $this->formatearRespuesta([], 'El año escolar no existe.', false, [
        'id' => ['Registro no encontrado.'],
      ]);
    }

    if ($this->tieneAulasAsociadas($id)) {
      return $this->formatearRespuesta([], 'No se puede eliminar el año escolar porque tiene aulas asociadas.', false, [
        'aulas' => ['Existen aulas asociadas al año escolar.'],
      ]);
    }

    try {
      $this->pdo->beginTransaction();
      $this->eliminarMomentos($id);
      $stmt = $this->pdo->prepare('DELETE FROM anios_escolares WHERE id_anio_escolar = :id');
      $stmt->execute([':id' => $id]);
      $this->pdo->commit();

      return $this->formatearRespuesta([], 'Año escolar eliminado correctamente.');
    } catch (PDOException $e) {
      if ($this->pdo->inTransaction()) {
        $this->pdo->rollBack();
      }
      return $this->formatearRespuesta([], 'Error interno al eliminar el año escolar.', false, [
        'exception' => [$e->getMessage()],
      ]);
    }
  }

  public function cambiarEstado(int $id, string $accion = 'activar'): array
  {
    $anio = $this->obtenerAnioPorId($id);
    if ($anio === null) {
      return $this->formatearRespuesta([], 'El año escolar no existe.', false, [
        'id' => ['Registro no encontrado.'],
      ]);
    }

    try {
      $this->pdo->beginTransaction();

      if ($accion === 'activar') {
        $this->desactivarOtrosAnios($id);
        $tieneAulas = $this->tieneAulasAsociadas($id);
        $nuevoEstado = $tieneAulas ? 'activo' : 'incompleto';
        $mensaje = $tieneAulas
          ? 'Año escolar activado correctamente.'
          : 'Año activado pero sin aulas - Estado: INCOMPLETO';

        $this->actualizarEstado($id, $nuevoEstado);
        $this->pdo->commit();

        $anioActual = $this->obtenerAnioPorId($id);
        return $this->formatearRespuesta($anioActual ?? [], $mensaje);
      }

      if ($accion === 'desactivar') {
        $this->actualizarEstado($id, 'inactivo');
        $this->pdo->commit();
        $anioActual = $this->obtenerAnioPorId($id);
        return $this->formatearRespuesta($anioActual ?? [], 'Año escolar desactivado correctamente.');
      }

      $this->pdo->rollBack();
      return $this->formatearRespuesta([], 'Acción inválida para el cambio de estado.', false, [
        'accion' => ['La acción especificada no es válida.'],
      ]);
    } catch (PDOException $e) {
      if ($this->pdo->inTransaction()) {
        $this->pdo->rollBack();
      }
      return $this->formatearRespuesta([], 'Error al cambiar el estado del año escolar.', false, [
        'exception' => [$e->getMessage()],
      ]);
    }
  }

  private function insertarAnio(array $datos): int
  {
    $nombre = $datos['nombre'] ?? sprintf('Año Escolar %d-%d', $datos['anio_base'], $datos['anio_base'] + 1);
    $stmt = $this->pdo->prepare('INSERT INTO anios_escolares (nombre, fecha_inicio, fecha_fin, fecha_limite_inscripcion, estado) VALUES (:nombre, :inicio, :fin, :limite, :estado)');
    $stmt->execute([
      ':nombre' => $nombre,
      ':inicio' => $datos['fecha_inicio'],
      ':fin' => $datos['fecha_final'],
      ':limite' => $datos['fecha_limite_inscripcion'],
      ':estado' => $datos['estado'] ?? 'incompleto',
    ]);

    return (int) $this->pdo->lastInsertId();
  }

  private function insertarMomento(int $anioId, array $momento): void
  {
    $stmt = $this->pdo->prepare('INSERT INTO momentos_academicos (fk_anio_escolar, nombre, orden, fecha_inicio, fecha_fin, estado) VALUES (:anio, :nombre, :orden, :inicio, :fin, :estado)');
    $stmt->execute([
      ':anio' => $anioId,
      ':nombre' => $momento['nombre'],
      ':orden' => $momento['orden'],
      ':inicio' => $momento['fecha_inicio'],
      ':fin' => $momento['fecha_final'],
      ':estado' => $momento['estado'] ?? 'activo',
    ]);
  }

  private function actualizarAnio(int $id, array $datos): void
  {
    $stmt = $this->pdo->prepare('UPDATE anios_escolares SET fecha_inicio = :inicio, fecha_fin = :fin, fecha_limite_inscripcion = :limite WHERE id_anio_escolar = :id');
    $stmt->execute([
      ':inicio' => $datos['fecha_inicio'],
      ':fin' => $datos['fecha_final'],
      ':limite' => $datos['fecha_limite_inscripcion'],
      ':id' => $id,
    ]);
  }

  private function actualizarMomentos(int $anioId, array $momentos): void
  {
    foreach ($momentos as $momento) {
      if (!empty($momento['id'])) {
        $stmt = $this->pdo->prepare('UPDATE momentos_academicos SET nombre = :nombre, orden = :orden, fecha_inicio = :inicio, fecha_fin = :fin, estado = :estado WHERE id_momento = :id AND fk_anio_escolar = :anio');
        $stmt->execute([
          ':nombre' => $momento['nombre'],
          ':orden' => $momento['orden'],
          ':inicio' => $momento['fecha_inicio'],
          ':fin' => $momento['fecha_final'],
          ':estado' => $momento['estado'],
          ':id' => $momento['id'],
          ':anio' => $anioId,
        ]);
        continue;
      }

      $this->insertarMomento($anioId, $momento);
    }
  }

  private function eliminarMomentos(int $anioId): void
  {
    $stmt = $this->pdo->prepare('DELETE FROM momentos_academicos WHERE fk_anio_escolar = :id');
    $stmt->execute([':id' => $anioId]);
  }

  private function actualizarEstado(int $id, string $estado): void
  {
    $stmt = $this->pdo->prepare('UPDATE anios_escolares SET estado = :estado WHERE id_anio_escolar = :id');
    $stmt->execute([
      ':estado' => $estado,
      ':id' => $id,
    ]);
  }
}
