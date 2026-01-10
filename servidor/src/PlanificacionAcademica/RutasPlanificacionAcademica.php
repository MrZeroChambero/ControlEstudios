<?php

use Micodigo\PlanificacionAcademica\PlanificacionAcademica;

function registrarRutasPlanificacionAcademica(
  AltoRouter $router,
  callable $mapAuthenticated,
  callable $mapAuthenticatedRole = null,
  array $rolesPermitidos = []
): void {
  $controlador = new PlanificacionAcademica();

  $map = $mapAuthenticated;
  if ($mapAuthenticatedRole) {
    $map = function (string $method, string $route, callable $target) use ($mapAuthenticatedRole, $rolesPermitidos) {
      $mapAuthenticatedRole($method, $route, $target, $rolesPermitidos);
    };
  }

  $map('GET', '/api/planificaciones', [$controlador, 'listarApi']);
  $map('GET', '/api/planificaciones/contexto', [$controlador, 'contextoApi']);
  $map('GET', '/api/planificaciones/docentes/[i:id]/asignacion', function (int $id) use ($controlador) {
    $controlador->docenteAsignacionApi($id);
  });
  $map('GET', '/api/planificaciones/[i:id]', function (int $id) use ($controlador) {
    $controlador->obtenerApi($id);
  });
  $map('POST', '/api/planificaciones', [$controlador, 'crearApi']);
  $map('PUT', '/api/planificaciones/[i:id]', function (int $id) use ($controlador) {
    $controlador->actualizarApi($id);
  });
  $map('PATCH', '/api/planificaciones/[i:id]/estado', function (int $id) use ($controlador) {
    $controlador->cambiarEstadoApi($id);
  });
}
