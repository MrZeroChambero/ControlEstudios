<?php

use Micodigo\Impartir\Impartir;

function registrarRutasImpartir(
  AltoRouter $router,
  callable $mapAuthenticated,
  callable $mapAuthenticatedRole = null,
  array $rolesPermitidos = []
): void {
  $controlador = new Impartir();

  $map = $mapAuthenticated;
  if ($mapAuthenticatedRole) {
    $map = function (string $method, string $route, callable $target) use ($mapAuthenticatedRole, $rolesPermitidos) {
      $mapAuthenticatedRole($method, $route, $target, $rolesPermitidos);
    };
  }

  $map('GET', '/aulas/gestion-docentes', [$controlador, 'obtenerGestionDocentes']);
  $map('POST', '/aulas/[i:id]/docente', [$controlador, 'asignarDocenteTitular']);
  $map('DELETE', '/aulas/[i:id]/docente', [$controlador, 'eliminarDocenteTitular']);
  $map('POST', '/aulas/[i:id]/especialistas', [$controlador, 'asignarEspecialista']);
  $map('DELETE', '/aulas/[i:id]/especialistas/[i:componenteId]', [$controlador, 'eliminarEspecialista']);
}
