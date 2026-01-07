<?php

use Micodigo\PlanificacionAcademica\PlanificacionAcademica;

function registrarRutasPlanificacionAcademica(AltoRouter $router, callable $mapAuthenticated): void
{
  $controlador = new PlanificacionAcademica();

  $mapAuthenticated('GET', '/api/planificaciones', [$controlador, 'listarApi']);
  $mapAuthenticated('GET', '/api/planificaciones/contexto', [$controlador, 'contextoApi']);
  $mapAuthenticated('GET', '/api/planificaciones/docentes/[i:id]/asignacion', function (int $id) use ($controlador) {
    $controlador->docenteAsignacionApi($id);
  });
  $mapAuthenticated('GET', '/api/planificaciones/[i:id]', function (int $id) use ($controlador) {
    $controlador->obtenerApi($id);
  });
  $mapAuthenticated('POST', '/api/planificaciones', [$controlador, 'crearApi']);
  $mapAuthenticated('PUT', '/api/planificaciones/[i:id]', function (int $id) use ($controlador) {
    $controlador->actualizarApi($id);
  });
  $mapAuthenticated('PATCH', '/api/planificaciones/[i:id]/estado', function (int $id) use ($controlador) {
    $controlador->cambiarEstadoApi($id);
  });
}
