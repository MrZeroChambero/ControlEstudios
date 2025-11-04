<?php

use Micodigo\Contenidos\ControladoraContenidos;

function registrarRutasContenidos(AltoRouter $router)
{
  $controlador = new ControladoraContenidos();

  $router->map('GET', '/contenidos', [$controlador, 'listar']);
  $router->map('POST', '/contenidos', [$controlador, 'crear']);
  $router->map('PUT', '/contenidos/[i:id]', function ($id) use ($controlador) {
    $controlador->actualizar($id);
  });
  $router->map('DELETE', '/contenidos/[i:id]', function ($id) use ($controlador) {
    $controlador->eliminar($id);
  });
  $router->map('PATCH', '/contenidos/[i:id]/estado', function ($id) use ($controlador) {
    $controlador->cambiarEstado($id);
  });
  $router->map('GET', '/contenidos/listar-select', [$controlador, 'listarSelect']);
}
