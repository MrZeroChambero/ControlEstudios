<?php

use Micodigo\ConsultasMedicas\ConsultasMedicas;

// Versión limpia: permite usar wrapper de roles si se provee
function registrarRutasConsultasMedicas(
  AltoRouter $router,
  callable $mapAuthenticated,
  callable $mapAuthenticatedRole = null,
  array $rolesPermitidos = []
) {
  $controlador = new ConsultasMedicas();

  $map = $mapAuthenticated;
  if ($mapAuthenticatedRole) {
    $map = function (string $method, string $route, callable $target) use ($mapAuthenticatedRole, $rolesPermitidos) {
      $mapAuthenticatedRole($method, $route, $target, $rolesPermitidos);
    };
  }

  // Endpoints placeholder (implementación real pendiente)
  $map('GET', '/consultas-medicas', [$controlador, 'listarTodas']);
  $map('GET', '/consultas-medicas/estudiante/[i:id]', [$controlador, 'listarPorEstudiante']);
  $map('POST', '/consultas-medicas', [$controlador, 'crear']);
  $map('PUT', '/consultas-medicas/[i:id]', [$controlador, 'actualizar']);
  $map('DELETE', '/consultas-medicas/[i:id]', [$controlador, 'eliminar']);
}
