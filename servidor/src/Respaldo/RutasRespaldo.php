<?php

use Micodigo\Respaldo\ControladoraRespaldo;

function registrarRutasRespaldo(AltoRouter $router, callable $mapAuthenticated): void
{
  $controlador = new ControladoraRespaldo();

  $mapAuthenticated('GET', '/respaldos', [$controlador, 'listar']);
  $mapAuthenticated('POST', '/respaldos/crear', [$controlador, 'crear']);
  $mapAuthenticated('POST', '/respaldos/restaurar', [$controlador, 'restaurar']);
  $mapAuthenticated('GET', '/respaldos/descargar/[*:nombre]', function (string $nombre) use ($controlador) {
    $controlador->descargar($nombre);
  });
}
