<?php

use Micodigo\ComponentesAprendizaje\ControladoraComponentes;

function registrarRutasComponentesAprendizaje(AltoRouter $router)
{
    $controlador = new ControladoraComponentes();
    $router->map('GET', '/componentes_aprendizaje', [$controlador, 'listar']);
    $router->map('GET', '/componentes_aprendizaje/listar-select', [$controlador, 'listarSelect']);
    $router->map('POST', '/componentes_aprendizaje', [$controlador, 'crear']);
    $router->map('PUT', '/componentes_aprendizaje/[i:id]', function ($id) use ($controlador) {
        $controlador->actualizar($id);
    });
    $router->map('DELETE', '/componentes_aprendizaje/[i:id]', function ($id) use ($controlador) {
        $controlador->eliminar($id);
    });
    $router->map('PATCH', '/componentes_aprendizaje/[i:id]/estado', function ($id) use ($controlador) {
        $controlador->cambiarEstado($id);
    });
}
