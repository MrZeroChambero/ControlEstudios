<?php

use Micodigo\Inscripcion\Inscripcion;

function registrarRutasInscripcion(
  AltoRouter $router,
  callable $mapAuthenticated,
  callable $mapAuthenticatedRole = null,
  array $rolesPermitidos = []
): void {
  $controlador = new Inscripcion();

  $map = $mapAuthenticated;
  if ($mapAuthenticatedRole) {
    $map = function (string $method, string $route, callable $target) use ($mapAuthenticatedRole, $rolesPermitidos) {
      $mapAuthenticatedRole($method, $route, $target, $rolesPermitidos);
    };
  }

  $map('GET', '/inscripciones/precondiciones', [$controlador, 'verificarPrecondiciones']);
  $map('GET', '/inscripciones/estudiantes', [$controlador, 'listarEstudiantesElegibles']);
  $map('GET', '/inscripciones/aulas-disponibles', [$controlador, 'listarAulasDisponibles']);
  $map('GET', '/inscripciones/resumen', [$controlador, 'listarResumenInscripciones']);
  $map('GET', '/inscripciones/estudiantes/[i:id]/representantes', [$controlador, 'listarRepresentantesElegibles']);
  $map('POST', '/inscripciones', [$controlador, 'registrarInscripcion']);
  $map('PATCH', '/inscripciones/[i:id]/retiro', [$controlador, 'retirarInscripcion']);
}
