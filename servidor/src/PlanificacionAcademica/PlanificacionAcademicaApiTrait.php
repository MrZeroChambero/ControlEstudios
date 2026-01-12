<?php

namespace Micodigo\PlanificacionAcademica;

use AltoRouter;
use Exception;
use Micodigo\Config\Conexion;
use Micodigo\Utils\RespuestaJson;
use PDO;
use PDOException;

trait PlanificacionAcademicaApiTrait
{
  protected function ejecutarPeticion(callable $callback): void
  {
    try {
      $callback();
    } catch (PDOException $e) {
      $this->responderJson(500, 'error', false, 'Error en la base de datos.', null, ['pdo' => [$e->getMessage()]]);
    } catch (Exception $e) {
      $this->responderJson(500, 'error', false, 'Error inesperado.', null, ['general' => [$e->getMessage()]]);
    }
  }

  protected function obtenerEntradaJson(): array
  {
    $contenido = file_get_contents('php://input');
    if ($contenido === false || $contenido === '') {
      return [];
    }
    $datos = json_decode($contenido, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
      throw new Exception('JSON inválido: ' . json_last_error_msg());
    }
    return $datos ?? [];
  }

  protected function responderJson(int $codigo, string $estado, bool $exito, string $mensaje, $datos = null, ?array $errores = null): void
  {
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

  protected function obtenerConexion(): PDO
  {
    return Conexion::obtener();
  }

  public function listarApi(): void
  {
    $this->ejecutarPeticion(function () {
      $pdo = $this->obtenerConexion();
      $filtros = $this->filtrosDesdeRequest();

      $momentoFiltro = $filtros['fk_momento'] ?? null;
      $anioFiltro = isset($_GET['fk_anio_escolar']) ? $this->valorEntero($_GET['fk_anio_escolar']) : null;
      $contexto = $this->obtenerContextoVisual($pdo, $momentoFiltro, $anioFiltro);

      if (!isset($filtros['fk_momento']) && isset($contexto['momento']['id_momento'])) {
        $filtros['fk_momento'] = (int) $contexto['momento']['id_momento'];
      }

      $datos = self::listar($pdo, $filtros);
      $respuesta = [
        'planificaciones' => $datos,
        'contexto' => $contexto,
        'filtros_aplicados' => array_merge($filtros, ['fk_anio_escolar' => $anioFiltro]),
      ];

      $this->responderJson(200, 'exito', true, 'Planificaciones obtenidas.', $respuesta);
    });
  }

  public function obtenerApi(int $id): void
  {
    $this->ejecutarPeticion(function () use ($id) {
      $pdo = $this->obtenerConexion();
      $registro = self::obtenerPorId($pdo, $id);
      if (!$registro) {
        $this->responderJson(404, 'error', false, 'Planificación no encontrada.');
        return;
      }
      $this->responderJson(200, 'exito', true, 'Planificación obtenida.', $registro);
    });
  }

  public function crearApi(): void
  {
    $this->ejecutarPeticion(function () {
      $this->reiniciarEstadoInterno();
      $this->establecerValoresPorDefecto();
      $entrada = $this->obtenerEntradaJson();
      $this->asignarDatos($entrada);
      $this->sincronizarColeccionesDesdeEntrada($entrada);
      $this->normalizarAutomaticamente();
      $this->establecerValoresPorDefecto();

      $pdo = $this->obtenerConexion();
      $resultado = $this->crear($pdo);
      if (isset($resultado['errores'])) {
        $this->responderJson(422, 'error', false, 'Validación fallida.', null, $resultado['errores']);
        return;
      }
      $this->responderJson(201, 'exito', true, 'Planificación creada.', $resultado);
    });
  }

  public function actualizarApi(int $id): void
  {
    $this->ejecutarPeticion(function () use ($id) {
      $this->reiniciarEstadoInterno();
      $this->establecerValoresPorDefecto();
      $entrada = $this->obtenerEntradaJson();
      $this->sincronizarColeccionesDesdeEntrada($entrada);
      $pdo = $this->obtenerConexion();
      $resultado = $this->actualizar($pdo, $id, $entrada);
      if (isset($resultado['errores'])) {
        $codigo = isset($resultado['errores']['general']) ? 404 : 422;
        $this->responderJson($codigo, 'error', false, 'No fue posible actualizar.', null, $resultado['errores']);
        return;
      }
      $this->responderJson(200, 'exito', true, 'Planificación actualizada.', $resultado);
    });
  }

  public function cambiarEstadoApi(int $id): void
  {
    $this->ejecutarPeticion(function () use ($id) {
      $entrada = $this->obtenerEntradaJson();
      $estado = $entrada['estado'] ?? null;
      $pdo = $this->obtenerConexion();
      $resultado = $this->cambiarEstado($pdo, $id, (string)$estado);
      if (isset($resultado['errores'])) {
        $codigo = isset($resultado['errores']['general']) ? 404 : 422;
        $this->responderJson($codigo, 'error', false, 'No fue posible cambiar el estado.', null, $resultado['errores']);
        return;
      }
      $this->responderJson(200, 'exito', true, 'Estado actualizado.', $resultado);
    });
  }

  public function contextoApi(): void
  {
    $this->ejecutarPeticion(function () {
      $pdo = $this->obtenerConexion();
      $momentoId = isset($_GET['fk_momento']) ? $this->valorEntero($_GET['fk_momento']) : null;
      $anioId = isset($_GET['fk_anio_escolar']) ? $this->valorEntero($_GET['fk_anio_escolar']) : null;
      $contexto = $this->obtenerContextoVisual($pdo, $momentoId, $anioId);

      $respuesta = [
        'contexto' => $contexto,
        'filtros' => [
          'fk_momento' => $contexto['momento']['id_momento'] ?? null,
          'fk_anio_escolar' => $contexto['anio']['id_anio_escolar'] ?? null,
        ],
      ];

      $this->responderJson(200, 'exito', true, 'Contexto obtenido.', $respuesta);
    });
  }

  public function docenteAsignacionApi(int $docenteId): void
  {
    $this->ejecutarPeticion(function () use ($docenteId) {
      $pdo = $this->obtenerConexion();
      $momentoId = isset($_GET['fk_momento']) ? $this->valorEntero($_GET['fk_momento']) : null;
      $anioId = isset($_GET['fk_anio_escolar']) ? $this->valorEntero($_GET['fk_anio_escolar']) : null;

      $contexto = $this->obtenerContextoVisual($pdo, $momentoId, $anioId);
      $momentoSeleccionado = $contexto['momento']['id_momento'] ?? null;

      if ($momentoSeleccionado === null) {
        $this->responderJson(422, 'error', false, 'No se pudo determinar un momento escolar válido.', null, [
          'contexto' => ['Debe seleccionar un momento para consultar asignaciones.'],
        ]);
        return;
      }

      $asignacion = $this->consultarAsignacionDocente($pdo, $docenteId, (int) $momentoSeleccionado);

      $this->responderJson(200, 'exito', true, 'Asignación obtenida.', [
        'contexto' => $contexto,
        'asignacion' => $asignacion,
      ]);
    });
  }

  public static function registrarRutas(AltoRouter $router): void
  {
    $obj = new self();
    $router->map('GET', '/api/planificaciones', [$obj, 'listarApi']);
    $router->map('GET', '/api/planificaciones/contexto', [$obj, 'contextoApi']);
    $router->map('GET', '/api/planificaciones/docentes/[i:id]/asignacion', function (int $id) use ($obj) {
      $obj->docenteAsignacionApi($id);
    });
    $router->map('GET', '/api/planificaciones/[i:id]', function (int $id) use ($obj) {
      $obj->obtenerApi($id);
    });
    $router->map('POST', '/api/planificaciones', [$obj, 'crearApi']);
    $router->map('PUT', '/api/planificaciones/[i:id]', function (int $id) use ($obj) {
      $obj->actualizarApi($id);
    });
    $router->map('PATCH', '/api/planificaciones/[i:id]/estado', function (int $id) use ($obj) {
      $obj->cambiarEstadoApi($id);
    });
  }
}
