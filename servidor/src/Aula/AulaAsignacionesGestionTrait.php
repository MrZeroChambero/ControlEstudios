<?php

namespace Micodigo\Aula;

use Exception;
use PDO;
use RuntimeException;

trait AulaAsignacionesGestionTrait
{
  protected function registrarDocenteTitular(PDO $conexion, int $aulaId, array $entrada): void
  {
    $validacion = $this->validarAsignacionDocente($entrada);
    if (!$validacion['valido']) {
      throw new RuntimeException(json_encode($validacion['errores'], JSON_UNESCAPED_UNICODE));
    }

    $datos = $validacion['datos'];
    $aula = $this->obtenerAulaPorId($conexion, $aulaId);
    if ($aula === null) {
      throw new RuntimeException('El aula seleccionada no existe.');
    }

    if ($aula['estado'] !== 'activo') {
      throw new RuntimeException('Solo se puede asignar un docente a aulas activas.');
    }

    $anioId = (int) $aula['fk_anio_escolar'];

    $personal = $this->obtenerPersonalPorId($conexion, $datos['id_personal']);
    if ($personal === null) {
      throw new RuntimeException('El docente seleccionado no existe.');
    }

    // Determinar tipo de docente
    $tipoDocente = $this->normalizarTipoDocente($personal['tipo_cargo'] ?? null);

    // Solo permitir docentes (aula o especialista)
    if (!in_array($tipoDocente, ['aula', 'especialista'], true)) {
      throw new RuntimeException('El personal seleccionado no es un docente válido (debe ser docente de aula o especialista).');
    }

    if ($personal['estado_personal'] !== 'activo' || $personal['estado_persona'] !== 'activo') {
      throw new RuntimeException('El docente seleccionado no se encuentra activo.');
    }

    if ($this->personalTieneAsignacionActiva($conexion, $anioId, $personal['id_personal'], $aulaId)) {
      throw new RuntimeException('El docente ya tiene asignada otra aula en el año escolar.');
    }

    $componentes = $this->obtenerComponentesPorIds($conexion, $datos['componentes']);
    if (count($componentes) !== count($datos['componentes'])) {
      throw new RuntimeException('Uno o mas componentes seleccionados no existen.');
    }

    // VALIDACIÓN CRÍTICA: Compatibilidad docente-componente
    foreach ($componentes as $componente) {
      if ($componente['estado'] !== 'activo') {
        throw new RuntimeException('Los componentes seleccionados deben estar activos.');
      }

      // Determinar tipo de componente
      $tipoComponente = $this->normalizarTipoComponente($componente['especialista'] ?? null);

      // Validar compatibilidad usando el nuevo método
      if (!$this->validarCompatibilidadDocenteComponente($tipoDocente, $tipoComponente)) {
        throw new RuntimeException(sprintf(
          'Docente tipo "%s" no puede impartir el componente "%s" (requiere %s)',
          $tipoDocente,
          $componente['nombre_componente'],
          $componente['especialista']
        ));
      }
    }

    $momentos = $this->obtenerMomentosActivos($conexion, $anioId);
    if (empty($momentos)) {
      throw new RuntimeException('No hay momentos activos configurados para el año escolar.');
    }

    $clasesTotales = $datos['clases_totales'];

    $conexion->beginTransaction();
    try {
      $this->eliminarDocenteTitularInterno($conexion, $aulaId);

      $sentencia = $conexion->prepare('INSERT INTO imparte (fk_aula, fk_personal, fk_momento, fk_componente, tipo_docente, clases_totales)
        VALUES (?, ?, ?, ?, "aula", ?)');

      foreach ($componentes as $componente) {
        foreach ($momentos as $momento) {
          $sentencia->execute([
            $aulaId,
            $personal['id_personal'],
            $momento['id'],
            $componente['id_componente'],
            $clasesTotales,
          ]);
        }
      }

      $conexion->commit();
    } catch (Exception $excepcion) {
      if ($conexion->inTransaction()) {
        $conexion->rollBack();
      }
      throw $excepcion;
    }
  }

  protected function eliminarDocenteTitularInterno(PDO $conexion, int $aulaId): void
  {
    $sentencia = $conexion->prepare('DELETE FROM imparte WHERE fk_aula = ? AND tipo_docente = "aula"');
    $sentencia->execute([$aulaId]);
  }

  protected function eliminarDocenteTitularAsignacion(PDO $conexion, int $aulaId): void
  {
    $aula = $this->obtenerAulaPorId($conexion, $aulaId);
    if ($aula === null) {
      throw new RuntimeException('El aula especificada no existe.');
    }

    $this->eliminarDocenteTitularInterno($conexion, $aulaId);
  }

  protected function registrarEspecialista(PDO $conexion, int $aulaId, array $entrada): void
  {
    $validacion = $this->validarAsignacionEspecialista($entrada);
    if (!$validacion['valido']) {
      throw new RuntimeException(json_encode($validacion['errores'], JSON_UNESCAPED_UNICODE));
    }

    $datos = $validacion['datos'];
    $aula = $this->obtenerAulaPorId($conexion, $aulaId);
    if ($aula === null) {
      throw new RuntimeException('El aula seleccionada no existe.');
    }

    $anioId = (int) $aula['fk_anio_escolar'];

    $personal = $this->obtenerPersonalPorId($conexion, $datos['id_personal']);
    if ($personal === null) {
      throw new RuntimeException('El especialista seleccionado no existe.');
    }

    $tipoDocente = $this->determinarTipoDocenteDesdeCargo($personal['tipo_cargo'] ?? null);
    if (!in_array($tipoDocente, ['especialista', 'cultura'], true)) {
      throw new RuntimeException('El personal seleccionado no corresponde a un docente especialista o de cultura.');
    }

    if ($personal['estado_personal'] !== 'activo' || $personal['estado_persona'] !== 'activo') {
      throw new RuntimeException('El especialista seleccionado no se encuentra activo.');
    }

    $componentes = $this->obtenerComponentesPorIds($conexion, $datos['componentes']);
    if (count($componentes) !== count($datos['componentes'])) {
      throw new RuntimeException('Uno o mas componentes seleccionados no existen.');
    }

    foreach ($componentes as $componente) {
      if ($componente['estado'] !== 'activo') {
        throw new RuntimeException('Los componentes seleccionados deben estar activos.');
      }

      $tipoComponente = $this->determinarTipoComponenteDesdeEspecialista($componente['especialista'] ?? null);
      if (!$this->validarCompatibilidadDocenteComponente($tipoDocente ?? '', $tipoComponente ?? '')) {
        throw new RuntimeException(sprintf('Docente tipo "%s" no puede impartir componente "%s" (requiere "%s")', $tipoDocente ?? 'desconocido', $componente['nombre_componente'] ?? $componente['id_componente'], $tipoComponente ?? 'desconocido'));
      }
    }

    $momentos = $this->obtenerMomentosActivos($conexion, $anioId);
    if (empty($momentos)) {
      throw new RuntimeException('No hay momentos activos configurados para el año escolar.');
    }

    $clasesTotales = $datos['clases_totales'];

    $conexion->beginTransaction();
    try {
      $sentenciaDelete = $conexion->prepare('DELETE FROM imparte WHERE fk_aula = ? AND fk_componente = ? AND tipo_docente = "Especialista"');
      $sentenciaInsert = $conexion->prepare('INSERT INTO imparte (fk_aula, fk_personal, fk_momento, fk_componente, tipo_docente, clases_totales)
        VALUES (?, ?, ?, ?, "Especialista", ?)');

      foreach ($componentes as $componente) {
        $sentenciaDelete->execute([$aulaId, $componente['id_componente']]);

        foreach ($momentos as $momento) {
          $sentenciaInsert->execute([
            $aulaId,
            $personal['id_personal'],
            $momento['id'],
            $componente['id_componente'],
            $clasesTotales,
          ]);
        }
      }

      $conexion->commit();
    } catch (Exception $excepcion) {
      if ($conexion->inTransaction()) {
        $conexion->rollBack();
      }
      throw $excepcion;
    }
  }

  protected function eliminarEspecialistaAsignacion(PDO $conexion, int $aulaId, int $componenteId): void
  {
    $componenteId = $this->normalizarEntero($componenteId);
    if ($componenteId === null || $componenteId <= 0) {
      throw new RuntimeException('Componente invalido.');
    }

    $aula = $this->obtenerAulaPorId($conexion, $aulaId);
    if ($aula === null) {
      throw new RuntimeException('El aula especificada no existe.');
    }

    $sentencia = $conexion->prepare('DELETE FROM imparte WHERE fk_aula = ? AND fk_componente = ? AND tipo_docente = "Especialista"');
    $sentencia->execute([$aulaId, $componenteId]);
  }

  protected function normalizarTipoDocente(?string $valor): ?string
  {
    if ($valor === null) {
      return null;
    }

    $clave = strtolower(trim($valor));

    if ($clave === '') {
      return null;
    }

    if (str_contains($clave, 'administr')) {
      return 'administrativo';
    }

    if (str_contains($clave, 'obrer')) {
      return 'obrero';
    }

    if (str_contains($clave, 'especial')) {
      return 'especialista';
    }

    if (str_contains($clave, 'aula')) {
      return 'aula';
    }

    if ($clave === 'docente') {
      return 'aula';
    }

    return null;
  }

  protected function normalizarTipoComponente(?string $valor): ?string
  {
    if ($valor === null) {
      return null;
    }

    $clave = strtolower(trim($valor));
    if ($clave === '') {
      return null;
    }

    if (str_contains($clave, 'especial')) {
      return 'especialista';
    }

    return 'aula'; // Default para Docente de Aula
  }
}
