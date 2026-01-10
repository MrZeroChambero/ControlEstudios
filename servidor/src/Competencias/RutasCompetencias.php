<?php

use Micodigo\Competencias\Competencias;

function registrarRutasCompetencias(
  AltoRouter $router,
  callable $mapAuthenticated,
  callable $mapAuthenticatedRole = null,
  array $rolesPermitidos = []
) {
  $controlador = new Competencias();

  $map = $mapAuthenticated;
  if ($mapAuthenticatedRole) {
    $map = function (string $method, string $route, callable $target) use ($mapAuthenticatedRole, $rolesPermitidos) {
      $mapAuthenticatedRole($method, $route, $target, $rolesPermitidos);
    };
  }

  $map('GET', '/competencias', [$controlador, 'listarCompetencias']);
  $map('GET', '/competencias/[i:id]', [$controlador, 'obtenerCompetencia']);
  $map('POST', '/competencias', [$controlador, 'crearCompetencia']);
  $map('PUT', '/competencias/[i:id]', [$controlador, 'actualizarCompetencia']);
  $map('DELETE', '/competencias/[i:id]', [$controlador, 'eliminarCompetencia']);
}
