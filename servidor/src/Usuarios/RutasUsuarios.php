<?php

use Micodigo\Usuarios\ControladoraUsuarios;

function registrarRutasUsuarios(AltoRouter $router)
{
  $controlador = new ControladoraUsuarios();

  $router->map('GET', '/usuarios', [$controlador, 'listar']);
  $router->map('GET', '/usuarios/personal-select', [$controlador, 'listarPersonalParaSelect']);
  $router->map('GET', '/usuarios/[i:id]/completo', function ($id) use ($controlador) {
    $controlador->obtenerCompleto($id);
  });
  $router->map('GET', '/usuarios/[i:id]/preguntas', function ($id) use ($controlador) {
    $controlador->obtenerPreguntas($id);
  });
  $router->map('POST', '/usuarios', [$controlador, 'crear']);
  $router->map('PUT', '/usuarios/[i:id]', function ($id) use ($controlador) {
    $controlador->actualizar($id);
  });
  $router->map('DELETE', '/usuarios/[i:id]', function ($id) use ($controlador) {
    $controlador->eliminar($id);
  });
  $router->map('PATCH', '/usuarios/[i:id]/estado', function ($id) use ($controlador) {
    $controlador->cambiarEstado($id);
  });
}
