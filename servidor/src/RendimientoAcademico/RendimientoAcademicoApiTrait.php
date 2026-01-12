<?php

namespace Micodigo\RendimientoAcademico;

use Exception;
use Micodigo\Config\Conexion;
use Micodigo\Utils\RespuestaJson;
use PDO;
use PDOException;
use RuntimeException;

trait RendimientoAcademicoApiTrait
{
  protected function ejecutar(callable $callback): void
  {
    try {
      $callback();
    } catch (RuntimeException $e) {
      $this->responderJson(422, 'error', false, $e->getMessage());
    } catch (PDOException $e) {
      $this->responderJson(500, 'error', false, 'Error en la base de datos.', null, ['pdo' => [$e->getMessage()]]);
    } catch (Exception $e) {
      $this->responderJson(500, 'error', false, 'Error inesperado.', null, ['general' => [$e->getMessage()]]);
    }
  }

  protected function obtenerConexion(): PDO
  {
    return Conexion::obtener();
  }

  protected function obtenerEntradaJson(): array
  {
    $contenido = file_get_contents('php://input');
    if ($contenido === false || $contenido === '') {
      return [];
    }

    $datos = json_decode($contenido, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
      throw new RuntimeException('El cuerpo de la petición no contiene un JSON válido.');
    }

    return is_array($datos) ? $datos : [];
  }

  protected function responderJson(
    int $codigo,
    string $estado,
    bool $exito,
    string $mensaje,
    $datos = null,
    ?array $errores = null
  ): void {
    $extra = [
      'estado' => $estado,
      'exito' => $exito,
    ];

    if ($exito) {
      RespuestaJson::exito($datos, $mensaje, $codigo, $extra);
      return;
    }

    RespuestaJson::error($mensaje, $codigo, $errores, null, $extra);
  }

  public function contextoApi(): void
  {
    $this->ejecutar(function () {
      $pdo = $this->obtenerConexion();

      $momentoId = $this->valorEnteroPositivo($_GET['momento_id'] ?? $_GET['fk_momento'] ?? null);
      $anioId = $this->valorEnteroPositivo($_GET['anio_id'] ?? $_GET['fk_anio_escolar'] ?? null);

      $contexto = $this->construirContextoOperativo($pdo, $momentoId, $anioId);
      $this->asegurarContextoValido($contexto);

      $usuario = $contexto['usuario'];
      $anio = $contexto['anio'];
      $momento = $contexto['momento'];

      $componentes = $this->obtenerComponentesDisponiblesUsuario(
        $pdo,
        $usuario,
        (int) $momento['id_momento'],
        (int) $anio['id_anio_escolar']
      );

      $literales = $this->catalogoLiteralesEvaluacion($pdo);

      $respuesta = [
        'usuario' => [
          'id_usuario' => $usuario['id_usuario'],
          'rol' => $usuario['rol'],
          'nombre' => $usuario['nombre_completo'],
          'puede_supervisar' => $this->usuarioPuedeSupervisarTodasLasAulas($usuario),
        ],
        'anio' => $anio,
        'momento' => $momento,
        'componentes' => $componentes,
        'literales' => $literales,
      ];

      $this->responderJson(200, 'exito', true, 'Contexto de evaluación obtenido correctamente.', $respuesta);
    });
  }

  public function componentesApi(): void
  {
    $this->ejecutar(function () {
      $pdo = $this->obtenerConexion();
      $momentoId = $this->valorEnteroPositivo($_GET['momento_id'] ?? $_GET['fk_momento'] ?? null);
      $anioId = $this->valorEnteroPositivo($_GET['anio_id'] ?? $_GET['fk_anio_escolar'] ?? null);

      $contexto = $this->construirContextoOperativo($pdo, $momentoId, $anioId);
      $this->asegurarContextoValido($contexto);

      $componentes = $this->obtenerComponentesDisponiblesUsuario(
        $pdo,
        $contexto['usuario'],
        (int) $contexto['momento']['id_momento'],
        (int) $contexto['anio']['id_anio_escolar']
      );

      $this->responderJson(200, 'exito', true, 'Componentes disponibles obtenidos.', [
        'componentes' => $componentes,
      ]);
    });
  }

  public function aulasPorComponenteApi(int $componenteId): void
  {
    $this->ejecutar(function () use ($componenteId) {
      $pdo = $this->obtenerConexion();
      $contexto = $this->construirContextoOperativo($pdo);
      $this->asegurarContextoValido($contexto);

      $componente = $this->obtenerComponenteDetalle($pdo, $componenteId);
      if (!$componente) {
        $this->responderJson(404, 'error', false, 'El componente seleccionado no existe.');
        return;
      }
      $this->validarComponenteActivo($componente);

      $aulas = $this->obtenerAulasParaComponente(
        $pdo,
        $contexto['usuario'],
        $componenteId,
        (int) $contexto['momento']['id_momento'],
        (int) $contexto['anio']['id_anio_escolar']
      );

      $this->responderJson(200, 'exito', true, 'Aulas disponibles obtenidas.', [
        'componente' => $componente,
        'aulas' => $aulas,
      ]);
    });
  }

  public function gridEvaluacionApi(int $componenteId, int $aulaId): void
  {
    $this->ejecutar(function () use ($componenteId, $aulaId) {
      $pdo = $this->obtenerConexion();
      $contexto = $this->construirContextoOperativo($pdo);
      $this->asegurarContextoValido($contexto);

      $momentoId = (int) $contexto['momento']['id_momento'];
      $anioId = (int) $contexto['anio']['id_anio_escolar'];

      $componente = $this->obtenerComponenteDetalle($pdo, $componenteId);
      if (!$componente) {
        $this->responderJson(404, 'error', false, 'El componente indicado no existe.');
        return;
      }
      $this->validarComponenteActivo($componente);

      $aula = $this->obtenerDetalleAula($pdo, $aulaId);
      if (!$aula) {
        $this->responderJson(404, 'error', false, 'El aula indicada no existe.');
        return;
      }
      if ((int) $aula['fk_anio_escolar'] !== $anioId) {
        throw new RuntimeException('El aula seleccionada no pertenece al año escolar activo.');
      }
      $this->validarEstadoAulaActiva($aula);

      $asignacion = null;
      if (!$this->usuarioPuedeSupervisarTodasLasAulas($contexto['usuario'])) {
        $personalId = $this->valorEnteroPositivo($contexto['usuario']['id_personal'] ?? null);
        if ($personalId === null) {
          throw new RuntimeException('No se pudo validar la asignación del docente.');
        }
        $asignacion = $this->obtenerAsignacionDocente($pdo, $personalId, $componenteId, $momentoId, $anioId, $aulaId);
      }
      $this->asegurarPermisoEvaluacion($contexto['usuario'], $asignacion, $componenteId);

      $inscripciones = $this->obtenerInscripcionesActivasPorAula($pdo, $aulaId);
      if (!$inscripciones) {
        throw new RuntimeException('El aula no posee estudiantes activos para evaluar.');
      }

      $matriz = $this->construirMatrizIndicadores($pdo, $inscripciones, $componenteId, $momentoId, $aulaId);
      if (!empty($matriz['sin_plan'])) {
        $ids = array_map(static fn($item) => (string) $item['id_estudiante'], $matriz['sin_plan']);
        throw new RuntimeException('Existen estudiantes sin planificación activa: ' . implode(', ', $ids));
      }

      $estudianteIds = array_keys($matriz['por_estudiante']);
      $indicadorIds = array_map(static fn($indicador) => (int) $indicador['id_indicador'], $matriz['indicadores_unicos']);
      $evaluacionesPrevias = $this->obtenerEvaluacionesPrevias($pdo, $componenteId, $momentoId, $estudianteIds, $indicadorIds);

      $estudiantesRespuesta = [];
      foreach ($inscripciones as $inscripcion) {
        $estudianteId = (int) $inscripcion['fk_estudiante'];
        $infoPlan = $matriz['por_estudiante'][$estudianteId] ?? null;

        $indicadores = [];
        if ($infoPlan) {
          foreach ($infoPlan['indicadores'] as $indicador) {
            $indId = (int) $indicador['id_indicador'];
            $evaluacion = $evaluacionesPrevias[$estudianteId][$indId] ?? null;
            if ($evaluacion) {
              $evaluacion['literal'] = $evaluacion['literal'] ?? $this->literalCodigoDesdeId($pdo, (int) $evaluacion['fk_literal']);
              $evaluacion['letra'] = $evaluacion['letra'] ?? ($evaluacion['literal'] ? $this->letraDesdeLiteralCodigo($evaluacion['literal']) : null);
              $evaluacion['fk_planificacion'] = $infoPlan['planificacion']['id_planificacion'] ?? $evaluacion['fk_planificacion'];
              $evaluacion['fk_inscripcion'] = $infoPlan['id_inscripcion'] ?? $evaluacion['fk_inscripcion'];
              $evaluacion['fk_momento'] = $momentoId;
              $evaluacion['fk_componente'] = $componenteId;
              $evaluacion['origen_planificacion'] = $infoPlan['planificacion']['origen'] ?? null;
            }
            $indicadores[] = [
              'indicador' => $indicador,
              'evaluacion' => $evaluacion,
            ];
          }
        }

        $estudiantesRespuesta[] = [
          'id_estudiante' => $estudianteId,
          'id_inscripcion' => $infoPlan['id_inscripcion'] ?? null,
          'nombre' => $inscripcion['nombre_estudiante'],
          'planificacion' => $infoPlan['planificacion'] ?? null,
          'indicadores' => $indicadores,
        ];
      }

      $respuesta = [
        'metadata' => [
          'momento' => $contexto['momento'],
          'anio' => $contexto['anio'],
          'aula' => $aula,
          'componente' => $componente,
        ],
        'literales' => $this->catalogoLiteralesEvaluacion($pdo),
        'indicadores' => $matriz['indicadores_unicos'],
        'estudiantes' => $estudiantesRespuesta,
        'permitidos_por_estudiante' => $matriz['permitidos_por_estudiante'],
      ];

      $this->responderJson(200, 'exito', true, 'Matriz de evaluación generada correctamente.', $respuesta);
    });
  }

  public function guardarEvaluacionesApi(): void
  {
    $this->ejecutar(function () {
      $pdo = $this->obtenerConexion();
      $entrada = $this->obtenerEntradaJson();
      $contexto = $this->construirContextoOperativo($pdo);
      $this->asegurarContextoValido($contexto);

      $resultado = $this->procesarGuardadoEvaluaciones($pdo, $contexto, $contexto['usuario'], $entrada);

      $this->responderJson(200, 'exito', true, 'Evaluaciones guardadas correctamente.', $resultado);
    });
  }

  public function historialEvaluacionesApi(int $estudianteId): void
  {
    $this->ejecutar(function () use ($estudianteId) {
      $pdo = $this->obtenerConexion();
      $contexto = $this->construirContextoOperativo($pdo);
      $this->asegurarContextoValido($contexto);

      $indicadorId = $this->valorEnteroPositivo($_GET['indicador_id'] ?? $_GET['fk_indicador'] ?? null);

      if (!$this->usuarioPuedeSupervisarTodasLasAulas($contexto['usuario'])) {
        throw new RuntimeException('Solo el director puede consultar el historial completo de evaluaciones.');
      }

      $historial = $this->obtenerHistorialEvaluaciones($pdo, $estudianteId, $indicadorId);

      $this->responderJson(200, 'exito', true, 'Historial de evaluaciones obtenido.', [
        'historial' => $historial,
      ]);
    });
  }
}
