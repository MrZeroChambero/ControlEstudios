<?php

namespace Micodigo\RendimientoAcademico;

use PDO;
use PDOException;
use RuntimeException;

trait RendimientoAcademicoPersistenciaTrait
{
  protected function procesarGuardadoEvaluaciones(PDO $conexion, array $contexto, array $usuario, array $payload): array
  {
    $componenteId = $this->valorEnteroPositivo($payload['componente_id'] ?? $payload['fk_componente'] ?? null);
    $aulaId = $this->valorEnteroPositivo($payload['aula_id'] ?? $payload['fk_aula'] ?? null);
    $momentoId = $this->valorEnteroPositivo($payload['momento_id'] ?? $payload['fk_momento'] ?? ($contexto['momento']['id_momento'] ?? null));

    if ($componenteId === null) {
      throw new RuntimeException('Debe indicar el componente de aprendizaje.');
    }
    if ($aulaId === null) {
      throw new RuntimeException('Debe indicar el aula asociada a las evaluaciones.');
    }
    if ($momentoId === null) {
      throw new RuntimeException('No se pudo determinar el momento escolar para la evaluación.');
    }

    $anioId = (int) ($contexto['anio']['id_anio_escolar'] ?? 0);
    $momentoContexto = $contexto['momento'] ?? null;
    if (!$momentoContexto || (int) ($momentoContexto['id_momento'] ?? 0) !== $momentoId) {
      throw new RuntimeException('Las evaluaciones solo pueden registrarse durante el momento escolar activo.');
    }
    $this->validarMomentoActivo($momentoContexto);

    $componente = $this->obtenerComponenteDetalle($conexion, $componenteId);
    if (!$componente) {
      throw new RuntimeException('El componente de aprendizaje indicado no existe.');
    }
    $this->validarComponenteActivo($componente);

    $aula = $this->obtenerDetalleAula($conexion, $aulaId);
    if (!$aula) {
      throw new RuntimeException('El aula indicada no existe.');
    }
    if ((int) $aula['fk_anio_escolar'] !== $anioId) {
      throw new RuntimeException('El aula seleccionada no pertenece al año escolar activo.');
    }
    $this->validarEstadoAulaActiva($aula);

    $asignacion = null;
    if (!$this->usuarioPuedeSupervisarTodasLasAulas($usuario)) {
      $personalId = $this->valorEnteroPositivo($usuario['id_personal'] ?? null);
      if ($personalId === null) {
        throw new RuntimeException('No se pudo asociar la cuenta de usuario con un registro de personal.');
      }
      $asignacion = $this->obtenerAsignacionDocente($conexion, $personalId, $componenteId, $momentoId, $anioId, $aulaId);
    }
    $this->asegurarPermisoEvaluacion($usuario, $asignacion, $componenteId);

    $inscripciones = $this->obtenerInscripcionesActivasPorAula($conexion, $aulaId);
    if (!$inscripciones) {
      throw new RuntimeException('El aula seleccionada no tiene estudiantes activos para evaluar.');
    }

    $matriz = $this->construirMatrizIndicadores($conexion, $inscripciones, $componenteId, $momentoId, $aulaId);
    if (!empty($matriz['sin_plan'])) {
      $ids = array_map(static fn($item) => (string) $item['id_estudiante'], $matriz['sin_plan']);
      throw new RuntimeException('Existen estudiantes sin planificación activa: ' . implode(', ', $ids));
    }

    $porEstudiante = $matriz['por_estudiante'];
    $permitidos = $matriz['permitidos_por_estudiante'];
    if (!$porEstudiante) {
      throw new RuntimeException('No se encontraron planificaciones aplicables para los estudiantes del aula.');
    }

    $estudianteIds = array_keys($porEstudiante);
    $indicadorIds = array_map(static fn($indicador) => (int) $indicador['id_indicador'], $matriz['indicadores_unicos']);
    $evaluacionesPrevias = $this->obtenerEvaluacionesPrevias($conexion, $componenteId, $momentoId, $estudianteIds, $indicadorIds);

    $entradas = $payload['evaluaciones'] ?? [];
    if (!is_array($entradas) || !$entradas) {
      throw new RuntimeException('Debe proporcionar al menos una evaluación para guardar.');
    }

    $acumulado = [];
    foreach ($entradas as $entrada) {
      if (!is_array($entrada)) {
        continue;
      }

      $estudianteId = $this->valorEnteroPositivo($entrada['estudiante_id'] ?? $entrada['fk_estudiante'] ?? null);
      $indicadorId = $this->valorEnteroPositivo($entrada['indicador_id'] ?? $entrada['fk_indicador'] ?? null);
      $valorLiteral = $entrada['valor'] ?? $entrada['literal'] ?? $entrada['letra'] ?? null;

      if ($estudianteId === null || $indicadorId === null || $valorLiteral === null) {
        throw new RuntimeException('Cada evaluación debe contener estudiante, indicador y valor literal.');
      }

      if (!isset($porEstudiante[$estudianteId])) {
        throw new RuntimeException('El estudiante ' . $estudianteId . ' no pertenece al aula seleccionada.');
      }

      $this->validarIndicadorPermitido($permitidos, $estudianteId, $indicadorId);

      $literalCodigo = strtoupper(trim((string) $valorLiteral));
      if (strlen($literalCodigo) === 1) {
        $literalCodigo = $this->normalizarLetraLiteral($literalCodigo);
      }
      $letra = $this->letraDesdeLiteralCodigo($literalCodigo);
      if ($letra === '') {
        throw new RuntimeException('Literal desconocido: ' . $valorLiteral);
      }

      $literalId = $this->literalIdDesdeCodigo($conexion, $literalCodigo);
      $clave = $estudianteId . '-' . $indicadorId;

      $planificacionId = (int) $porEstudiante[$estudianteId]['planificacion']['id_planificacion'];
      $inscripcionId = (int) $porEstudiante[$estudianteId]['id_inscripcion'];
      $origenPlan = $porEstudiante[$estudianteId]['planificacion']['origen'] ?? null;
      $anterior = $evaluacionesPrevias[$estudianteId][$indicadorId] ?? null;
      if ($anterior !== null) {
        $anterior['fk_planificacion'] = $planificacionId;
        $anterior['fk_inscripcion'] = $inscripcionId;
        $anterior['fk_momento'] = $momentoId;
        $anterior['fk_componente'] = $componenteId;
        $anterior['origen_planificacion'] = $origenPlan;
      }

      $acumulado[$clave] = [
        'estudiante_id' => $estudianteId,
        'indicador_id' => $indicadorId,
        'literal_id' => $literalId,
        'literal_codigo' => $literalCodigo,
        'letra' => $letra,
        'planificacion_id' => $planificacionId,
        'inscripcion_id' => $inscripcionId,
        'origen_planificacion' => $origenPlan,
        'anterior' => $anterior,
      ];
    }

    if (!$acumulado) {
      throw new RuntimeException('No se detectaron evaluaciones válidas para procesar.');
    }

    $conexion->beginTransaction();

    $insertados = 0;
    $actualizados = 0;
    $sinCambios = 0;
    $resultadoEvaluaciones = [];

    try {
      foreach ($acumulado as $registro) {
        $estudianteId = $registro['estudiante_id'];
        $indicadorId = $registro['indicador_id'];
        $literalId = $registro['literal_id'];
        $planificacionId = $registro['planificacion_id'];
        $inscripcionId = $registro['inscripcion_id'];
        $origenPlan = $registro['origen_planificacion'];
        $anterior = $registro['anterior'];

        if ($anterior !== null) {
          if ((int) $anterior['fk_literal'] === $literalId) {
            $sinCambios++;
            $resultadoEvaluaciones[] = $anterior;
            continue;
          }

          $sqlActualizar = 'UPDATE evaluar SET fk_literal = ? WHERE id_evaluar = ?';
          $stmtActualizar = $conexion->prepare($sqlActualizar);
          $stmtActualizar->execute([
            $literalId,
            $anterior['id_evaluar'],
          ]);

          $actualizados++;

          $nuevo = $anterior;
          $nuevo['fk_literal'] = $literalId;
          $nuevo['literal'] = $registro['literal_codigo'];
          $nuevo['letra'] = $registro['letra'];
          $nuevo['fk_planificacion'] = $planificacionId;
          $nuevo['fk_inscripcion'] = $inscripcionId;
          $nuevo['fk_momento'] = $momentoId;
          $nuevo['fk_componente'] = $componenteId;
          $nuevo['origen_planificacion'] = $origenPlan;
          $nuevo['actualizado_por'] = $usuario['id_usuario'];

          $resultadoEvaluaciones[] = $nuevo;
        } else {
          $sqlInsertar = 'INSERT INTO evaluar (fk_estudiante, fk_indicador, fk_literal) VALUES (?, ?, ?)';
          $stmtInsertar = $conexion->prepare($sqlInsertar);
          $stmtInsertar->execute([
            $estudianteId,
            $indicadorId,
            $literalId,
          ]);

          $idEvaluar = (int) $conexion->lastInsertId();
          $insertados++;

          $nuevo = [
            'id_evaluar' => $idEvaluar,
            'fk_estudiante' => $estudianteId,
            'fk_indicador' => $indicadorId,
            'fk_literal' => $literalId,
            'fk_planificacion' => $planificacionId,
            'fk_inscripcion' => $inscripcionId,
            'fk_momento' => $momentoId,
            'fk_componente' => $componenteId,
            'origen_planificacion' => $origenPlan,
            'literal' => $registro['literal_codigo'],
            'letra' => $registro['letra'],
            'registrado_por' => $usuario['id_usuario'],
            'actualizado_por' => $usuario['id_usuario'],
          ];

          $resultadoEvaluaciones[] = $nuevo;
        }
      }

      $conexion->commit();
    } catch (PDOException $ex) {
      $conexion->rollBack();
      throw $ex;
    }

    return [
      'resumen' => [
        'insertados' => $insertados,
        'actualizados' => $actualizados,
        'sin_cambios' => $sinCambios,
        'total' => $insertados + $actualizados + $sinCambios,
      ],
      'evaluaciones' => $resultadoEvaluaciones,
    ];
  }
}
