<?php

use Micodigo\Impartir\Impartir;

function registrarRutasImpartir(AltoRouter $router, callable $mapAuthenticated): void
{
  $controlador = new Impartir();

  $mapAuthenticated('GET', '/aulas/gestion-docentes', [$controlador, 'obtenerGestionDocentes']);
  $mapAuthenticated('POST', '/aulas/[i:id]/docente', [$controlador, 'asignarDocenteTitular']);
  $mapAuthenticated('DELETE', '/aulas/[i:id]/docente', [$controlador, 'eliminarDocenteTitular']);
  $mapAuthenticated('POST', '/aulas/[i:id]/especialistas', [$controlador, 'asignarEspecialista']);
  $mapAuthenticated('DELETE', '/aulas/[i:id]/especialistas/[i:componenteId]', [$controlador, 'eliminarEspecialista']);
}
