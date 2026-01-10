<?php

use Micodigo\Indicadores\Indicadores;

function registrarRutasIndicadores(
  AltoRouter $router,
  callable $mapAuthenticated,
  callable $mapAuthenticatedRole = null,
  array $rolesPermitidos = []
) {
  $controlador = new Indicadores();

  $map = $mapAuthenticated;
  if ($mapAuthenticatedRole) {
    $map = function (string $method, string $route, callable $target) use ($mapAuthenticatedRole, $rolesPermitidos) {
      $mapAuthenticatedRole($method, $route, $target, $rolesPermitidos);
    };
  }

  $map('GET', '/competencias/[i:id]/indicadores', [$controlador, 'listarIndicadoresPorCompetencia']);
  $map('POST', '/indicadores', [$controlador, 'crearIndicador']);
  $map('PUT', '/indicadores/[i:id]', [$controlador, 'actualizarIndicador']);
  $map('DELETE', '/indicadores/[i:id]', [$controlador, 'eliminarIndicador']);
  $map('PATCH', '/indicadores/[i:id]/ocultar', [$controlador, 'cambiarOcultarIndicador']);
}
