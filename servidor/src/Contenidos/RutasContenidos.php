<?php

use Micodigo\Contenidos\ControladoraContenidos;

function registrarRutasContenidos(
  AltoRouter $router,
  callable $mapAuthenticatedRole = null,
  array $rolesPermitidos = []
) {
  $controlador = new ControladoraContenidos();

  if ($mapAuthenticatedRole) {
    $map = function (string $method, string $route, callable $target) use ($mapAuthenticatedRole, $rolesPermitidos) {
      $mapAuthenticatedRole($method, $route, $target, $rolesPermitidos);
    };
  } else {
    $map = function (string $method, string $route, callable $target) use ($router) {
      $router->map($method, $route, $target);
    };
  }

  $map('GET', '/contenidos', [$controlador, 'listar']);
  $map('POST', '/contenidos', [$controlador, 'crear']);
  $map('PUT', '/contenidos/[i:id_contenido]', function ($id_contenido) use ($controlador) {
    $controlador->actualizar($id_contenido);
  });
  $map('DELETE', '/contenidos/[i:id_contenido]', function ($id_contenido) use ($controlador) {
    $controlador->eliminar($id_contenido);
  });
  $map('PATCH', '/contenidos/[i:id_contenido]/estado', function ($id_contenido) use ($controlador) {
    $controlador->cambiarEstado($id_contenido);
  });
  $map('GET', '/contenidos/listar-select', [$controlador, 'listarSelect']);
}
