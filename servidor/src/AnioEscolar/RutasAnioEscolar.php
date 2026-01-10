<?php

use Micodigo\AnioEscolar\ControladoraAnioEscolar;

function registrarRutasAnioEscolar(
  AltoRouter $router,
  callable $mapAuthenticatedRole = null,
  array $rolesPermitidos = []
): void {
  $controladora = new ControladoraAnioEscolar();

  $map = function (string $method, string $route, callable $target) use ($router) {
    $router->map($method, $route, $target);
  };

  if ($mapAuthenticatedRole) {
    $map = function (string $method, string $route, callable $target) use ($mapAuthenticatedRole, $rolesPermitidos) {
      $mapAuthenticatedRole($method, $route, $target, $rolesPermitidos);
    };
  }

  $map('GET', '/anios_escolares', [$controladora, 'listar']);
  $map('GET', '/anios_escolares/[i:id]', function (int $id) use ($controladora) {
    $controladora->obtener($id);
  });
  $map('POST', '/anios_escolares', [$controladora, 'crear']);
  $map('PUT', '/anios_escolares/[i:id]', function (int $id) use ($controladora) {
    $controladora->actualizar($id);
  });
  $map('DELETE', '/anios_escolares/[i:id]', function (int $id) use ($controladora) {
    $controladora->eliminar($id);
  });
  $map('PATCH', '/anios_escolares/[i:id]/estado', function (int $id) use ($controladora) {
    $controladora->cambiarEstado($id);
  });
}
