<?php

use Micodigo\RendimientoAcademico\RendimientoAcademico;

function registrarRutasRendimientoAcademico(
  AltoRouter $router,
  callable $mapAuthenticated,
  callable $mapAuthenticatedRole,
  array $rolesPermitidos = []
): void {
  $controlador = new RendimientoAcademico();

  $map = $mapAuthenticated;
  if (!empty($rolesPermitidos)) {
    $map = function (string $method, string $route, callable $target) use ($mapAuthenticatedRole, $rolesPermitidos) {
      $mapAuthenticatedRole($method, $route, $target, $rolesPermitidos);
    };
  }

  $map('GET', '/api/rendimiento/contexto', [$controlador, 'contextoApi']);
  $map('GET', '/api/rendimiento/componentes', [$controlador, 'componentesApi']);
  $map('GET', '/api/rendimiento/componentes/[i:componenteId]/aulas', function (int $componenteId) use ($controlador) {
    $controlador->aulasPorComponenteApi($componenteId);
  });
  $map('GET', '/api/rendimiento/componentes/[i:componenteId]/aulas/[i:aulaId]/grid', function (int $componenteId, int $aulaId) use ($controlador) {
    $controlador->gridEvaluacionApi($componenteId, $aulaId);
  });
  $map('POST', '/api/rendimiento/evaluaciones', [$controlador, 'guardarEvaluacionesApi']);
  $map('GET', '/api/rendimiento/evaluaciones/estudiantes/[i:estudianteId]/historial', function (int $estudianteId) use ($controlador) {
    $controlador->historialEvaluacionesApi($estudianteId);
  });
}
