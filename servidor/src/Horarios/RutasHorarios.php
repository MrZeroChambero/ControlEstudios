<?php

use Micodigo\Horarios\ControladoraHorarios;

function registrarRutasHorarios(AltoRouter $router, callable $mapAuthenticated = null): void
{
  $controlador = new ControladoraHorarios();

  $map = $mapAuthenticated ?? function (string $method, string $route, callable|array $target) use ($router) {
    $router->map($method, $route, $target);
  };

  $map('GET', '/horarios', [$controlador, 'listar']);
  $map('GET', '/horarios/catalogos', [$controlador, 'catalogos']);
  $map('POST', '/horarios', [$controlador, 'crear']);

  $map('PUT', '/horarios/[i:id_horario]', function (int $id_horario) use ($controlador) {
    $controlador->actualizar($id_horario);
  });

  $map('DELETE', '/horarios/[i:id_horario]', function (int $id_horario) use ($controlador) {
    $controlador->eliminar($id_horario);
  });

  $map('PATCH', '/horarios/[i:id_horario]/subgrupo', function (int $id_horario) use ($controlador) {
    $controlador->sincronizarSubgrupo($id_horario);
  });
}
