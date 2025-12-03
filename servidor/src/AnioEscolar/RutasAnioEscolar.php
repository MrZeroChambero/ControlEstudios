<?php

use Micodigo\AnioEscolar\ControladoraAnioEscolar;

function registrarRutasAnioEscolar(AltoRouter $router): void
{
  $controladora = new ControladoraAnioEscolar();

  $router->map('GET', '/anios_escolares', [$controladora, 'listar']);
  $router->map('GET', '/anios_escolares/[i:id]', function (int $id) use ($controladora) {
    $controladora->obtener($id);
  });
  $router->map('POST', '/anios_escolares', [$controladora, 'crear']);
  $router->map('PUT', '/anios_escolares/[i:id]', function (int $id) use ($controladora) {
    $controladora->actualizar($id);
  });
  $router->map('DELETE', '/anios_escolares/[i:id]', function (int $id) use ($controladora) {
    $controladora->eliminar($id);
  });
  $router->map('PATCH', '/anios_escolares/[i:id]/estado', function (int $id) use ($controladora) {
    $controladora->cambiarEstado($id);
  });
}
