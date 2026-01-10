<?php

use Micodigo\ComponentesAprendizaje\ControladoraComponentes;

function registrarRutasComponentesAprendizaje(
    AltoRouter $router,
    callable $mapAuthenticatedRole = null,
    array $rolesPermitidos = []
) {
    $controlador = new ControladoraComponentes();

    if ($mapAuthenticatedRole) {
        $map = function (string $method, string $route, callable $target) use ($mapAuthenticatedRole, $rolesPermitidos) {
            $mapAuthenticatedRole($method, $route, $target, $rolesPermitidos);
        };
    } else {
        $map = function (string $method, string $route, callable $target) use ($router) {
            $router->map($method, $route, $target);
        };
    }

    $map('GET', '/componentes_aprendizaje', [$controlador, 'listar']);
    $map('GET', '/componentes_aprendizaje/listar-select', [$controlador, 'listarSelect']);
    $map('POST', '/componentes_aprendizaje', [$controlador, 'crear']);
    $map('PUT', '/componentes_aprendizaje/[i:id]', function ($id) use ($controlador) {
        $controlador->actualizar($id);
    });
    $map('DELETE', '/componentes_aprendizaje/[i:id]', function ($id) use ($controlador) {
        $controlador->eliminar($id);
    });
    $map('PATCH', '/componentes_aprendizaje/[i:id]/estado', function ($id) use ($controlador) {
        $controlador->cambiarEstado($id);
    });
}
