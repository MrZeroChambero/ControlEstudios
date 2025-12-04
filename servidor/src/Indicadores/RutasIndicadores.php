<?php

use Micodigo\Indicadores\Indicadores;

function registrarRutasIndicadores(AltoRouter $router, callable $mapAuthenticated)
{
  $controlador = new Indicadores();

  $mapAuthenticated('GET', '/competencias/[i:id]/indicadores', [$controlador, 'listarIndicadoresPorCompetencia']);
  $mapAuthenticated('POST', '/indicadores', [$controlador, 'crearIndicador']);
  $mapAuthenticated('PUT', '/indicadores/[i:id]', [$controlador, 'actualizarIndicador']);
  $mapAuthenticated('DELETE', '/indicadores/[i:id]', [$controlador, 'eliminarIndicador']);
  $mapAuthenticated('PATCH', '/indicadores/[i:id]/ocultar', [$controlador, 'cambiarOcultarIndicador']);
}
