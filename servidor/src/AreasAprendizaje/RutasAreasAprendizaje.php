<?php

use Micodigo\AreasAprendizaje\ControladoraAreas;

function registrarRutasAreasAprendizaje(AltoRouter $router)
{
  $controlador = new ControladoraAreas();

  $router->map('GET', '/areas_aprendizaje', [$controlador, 'listar']);
  $router->map('POST', '/areas_aprendizaje', [$controlador, 'crear']);
  $router->map('PUT', '/areas_aprendizaje/[i:id]', function ($id) use ($controlador) {
    $controlador->actualizar($id);
  });
  $router->map('DELETE', '/areas_aprendizaje/[i:id]', function ($id) use ($controlador) {
    $controlador->eliminar($id);
  });
  $router->map('PATCH', '/areas_aprendizaje/[i:id]/estado', function ($id) use ($controlador) {
    $controlador->cambiarEstado($id);
  });
  $router->map('GET', '/areas_aprendizaje/listar-select', [$controlador, 'listarSelect']);
}
