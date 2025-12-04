<?php

use Micodigo\Competencias\Competencias;

function registrarRutasCompetencias(AltoRouter $router, callable $mapAuthenticated)
{
  $controlador = new Competencias();

  $mapAuthenticated('GET', '/competencias', [$controlador, 'listarCompetencias']);
  $mapAuthenticated('GET', '/competencias/[i:id]', [$controlador, 'obtenerCompetencia']);
  $mapAuthenticated('POST', '/competencias', [$controlador, 'crearCompetencia']);
  $mapAuthenticated('PUT', '/competencias/[i:id]', [$controlador, 'actualizarCompetencia']);
  $mapAuthenticated('DELETE', '/competencias/[i:id]', [$controlador, 'eliminarCompetencia']);
}
