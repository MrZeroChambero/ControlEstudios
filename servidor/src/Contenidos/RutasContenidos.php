<?php

use Micodigo\Contenidos\ControladoraContenidos;

function registrarRutasContenidos(AltoRouter $router)
{
  $controlador = new ControladoraContenidos();

  $router->map('GET', '/contenidos', [$controlador, 'listar']);
  $router->map('POST', '/contenidos', [$controlador, 'crear']);
  $router->map('PUT', '/contenidos/[i:id_contenido]', function ($id_contenido) use ($controlador) {
    $controlador->actualizar($id_contenido);
  });
  $router->map('DELETE', '/contenidos/[i:id_contenido]', function ($id_contenido) use ($controlador) {
    $controlador->eliminar($id_contenido);
  });
  $router->map('PATCH', '/contenidos/[i:id_contenido]/estado', function ($id_contenido) use ($controlador) {
    $controlador->cambiarEstado($id_contenido);
  });
  $router->map('GET', '/contenidos/listar-select', [$controlador, 'listarSelect']);
}
