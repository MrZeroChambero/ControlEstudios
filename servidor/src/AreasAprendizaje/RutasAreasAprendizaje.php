<?php

use Micodigo\AreasAprendizaje\ControladoraAreas;

function registrarRutasAreasAprendizaje(
  AltoRouter $router,
  callable $mapAuthenticatedRole = null,
  array $rolesPermitidos = []
) {
  $controlador = new ControladoraAreas();

  if ($mapAuthenticatedRole) {
    $map = function (string $method, string $route, callable $target) use ($mapAuthenticatedRole, $rolesPermitidos) {
      $mapAuthenticatedRole($method, $route, $target, $rolesPermitidos);
    };
  } else {
    $map = function (string $method, string $route, callable $target) use ($router) {
      $router->map($method, $route, $target);
    };
  }

  $map('GET', '/areas_aprendizaje', [$controlador, 'listar']);
  $map('GET', '/areas_aprendizaje/listar-select', [$controlador, 'listarSelect']);
  $map('POST', '/areas_aprendizaje', [$controlador, 'crear']);
  $map('PUT', '/areas_aprendizaje/[i:id]', function ($id) use ($controlador) {
    $controlador->actualizar($id);
  });
  $map('DELETE', '/areas_aprendizaje/[i:id]', function ($id) use ($controlador) {
    $controlador->eliminar($id);
  });
  $map('PATCH', '/areas_aprendizaje/[i:id]/estado', function ($id) use ($controlador) {
    $controlador->cambiarEstado($id);
  });
}
