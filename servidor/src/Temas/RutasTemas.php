<?php

use Micodigo\Temas\ControladoraTemas;

function registrarRutasTemas(AltoRouter $router)
{
  $controlador = new ControladoraTemas();

  $router->map('GET', '/temas/contenido/[i:id_contenido]', function ($id_contenido) use ($controlador) {
    $controlador->listarPorContenido($id_contenido);
  });

  $router->map('GET', '/temas/listar-select[/]?', function () use ($controlador) {
    $id_contenido = isset($_GET['id_contenido']) ? (int)$_GET['id_contenido'] : null;
    $controlador->listarSelect($id_contenido);
  });

  $router->map('POST', '/temas', [$controlador, 'crear']);

  $router->map('PUT', '/temas/[i:id]', function ($id) use ($controlador) {
    $controlador->actualizar($id);
  });

  $router->map('DELETE', '/temas/[i:id]', function ($id) use ($controlador) {
    $controlador->eliminar($id);
  });

  $router->map('PATCH', '/temas/[i:id]/estado', function ($id) use ($controlador) {
    $controlador->cambiarEstado($id);
  });
}
