<?php

use Micodigo\FuncionPersonal\ControladoraFuncionPersonal;

function registrarRutasFuncionPersonal(AltoRouter $router)
{
  $controlador = new ControladoraFuncionPersonal();

  $router->map('GET', '/funcion_personal', [$controlador, 'listar']);
  $router->map('GET', '/funcion_personal/listar-select', [$controlador, 'listarSelect']);
}
