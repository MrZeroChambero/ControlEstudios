<?php

use Micodigo\Temas\ControladoraTemas;

function registrarRutasTemas(
  AltoRouter $router,
  callable $mapAuthenticatedRole = null,
  array $rolesPermitidos = []
) {
  $controlador = new ControladoraTemas();

  if ($mapAuthenticatedRole) {
    $map = function (string $method, string $route, callable $target) use ($mapAuthenticatedRole, $rolesPermitidos) {
      $mapAuthenticatedRole($method, $route, $target, $rolesPermitidos);
    };
  } else {
    $map = function (string $method, string $route, callable $target) use ($router) {
      $router->map($method, $route, $target);
    };
  }

  $map('GET', '/temas/contenido/[i:id_contenido]', function ($id_contenido) use ($controlador) {
    $controlador->listarPorContenido($id_contenido);
  });

  $map('GET', '/temas/listar-select[/]?', function () use ($controlador) {
    $id_contenido = isset($_GET['id_contenido']) ? (int)$_GET['id_contenido'] : null;
    $controlador->listarSelect($id_contenido);
  });

  $map('POST', '/temas', [$controlador, 'crear']);

  $map('PUT', '/temas/[i:id]', function ($id) use ($controlador) {
    $controlador->actualizar($id);
  });

  $map('DELETE', '/temas/[i:id]', function ($id) use ($controlador) {
    $controlador->eliminar($id);
  });

  $map('PATCH', '/temas/[i:id]/estado', function ($id) use ($controlador) {
    $controlador->cambiarEstado($id);
  });
}
