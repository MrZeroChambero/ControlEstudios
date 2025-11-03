<?php

use Micodigo\Config\Conexion;
use Micodigo\Personal\Plantel;

function registrarRutasPlantel(AltoRouter $router)
{
    $mapAuthenticated = function ($method, $path, $target) use ($router) {
        $router->map($method, $path, function () use ($target) {
            header('Content-Type: text/html; charset=utf-8');
            if (!isset($_COOKIE['session_token'])) {
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'Acceso no autorizado. Por favor, inicie sesión.', 'back' => true], JSON_UNESCAPED_UNICODE);
                exit();
            }
            $pdo = Conexion::obtener();
            $login = new \Micodigo\Login\Login($pdo);
            if (!$login->obtenerUsuarioPorHash($_COOKIE['session_token'])) {
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'Sesión inválida.'], JSON_UNESCAPED_UNICODE);
                exit();
            }
            call_user_func_array($target, func_get_args());
        });
    };

    $mapAuthenticated('GET', '/planteles', function () {
        try {
            $pdo = Conexion::obtener();
            $planteles = Plantel::consultarTodos($pdo);
            http_response_code(200);
            echo json_encode(['status' => 'success', 'data' => $planteles, 'back' => true], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Error al obtener planteles.', 'back' => true], JSON_UNESCAPED_UNICODE);
        }
    });
}
