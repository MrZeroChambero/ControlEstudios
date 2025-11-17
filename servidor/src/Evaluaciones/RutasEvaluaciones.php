<?php

use Micodigo\Evaluaciones\ControladoraEvaluaciones;

function registrarRutasEvaluaciones(AltoRouter $router)
{
  $controlador = new ControladoraEvaluaciones();

  $router->map('GET', '/evaluaciones', [$controlador, 'listar']);
  $router->map('POST', '/evaluaciones', [$controlador, 'crear']);
  $router->map('PUT', '/evaluaciones/[i:id]', function ($id) use ($controlador) {
    $controlador->actualizar($id);
  });
  $router->map('DELETE', '/evaluaciones/[i:id]', function ($id) use ($controlador) {
    $controlador->eliminar($id);
  });
  $router->map('PATCH', '/evaluaciones/[i:id]/estado', function ($id) use ($controlador) {
    $controlador->cambiarEstado($id);
  });
  $router->map('GET', '/evaluaciones/listar-select', [$controlador, 'listarSelect']);
}
