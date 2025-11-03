<?php

use Micodigo\Config\Conexion;
use Micodigo\Personal\PlantelPersonal;

function registrarRutasPlantelPersonal(AltoRouter $router)
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

    // POST /plantel_personal - Crear una nueva asignación de personal a plantel
    $mapAuthenticated('POST', '/plantel_personal', function () {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Datos JSON inválidos o vacíos.', 'back' => true], JSON_UNESCAPED_UNICODE);
            return;
        }

        $plantelPersonal = new PlantelPersonal($data);
        try {
            $pdo = Conexion::obtener();
            $resultado = $plantelPersonal->crear($pdo);

            if (is_numeric($resultado)) {
                http_response_code(201);
                echo json_encode(['status' => 'success', 'message' => 'Asignación de personal a plantel creada exitosamente.', 'data' => $plantelPersonal, 'back' => true], JSON_UNESCAPED_UNICODE);
            } elseif (is_array($resultado)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Error de validación.', 'errors' => $resultado, 'back' => true], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'No se pudo crear la asignación de personal a plantel.', 'back' => true], JSON_UNESCAPED_UNICODE);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage(), 'back' => true], JSON_UNESCAPED_UNICODE);
        }
    });

    // PUT /plantel_personal/[i:id] - Actualizar una asignación de personal a plantel
    $mapAuthenticated('PUT', '/plantel_personal/[i:id]', function ($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Datos JSON inválidos.', 'back' => true], JSON_UNESCAPED_UNICODE);
            return;
        }

        try {
            $pdo = Conexion::obtener();
            $plantelPersonal = new PlantelPersonal($data);
            $plantelPersonal->id_plantel_personal = $id;
            $resultado = $plantelPersonal->actualizar($pdo);

            if ($resultado === true) {
                http_response_code(200);
                echo json_encode(['status' => 'success', 'message' => 'Asignación de personal a plantel actualizada exitosamente.', 'back' => true], JSON_UNESCAPED_UNICODE);
            } elseif (is_array($resultado)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Error de validación.', 'errors' => $resultado, 'back' => true], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'No se pudo actualizar la asignación de personal a plantel.', 'back' => true], JSON_UNESCAPED_UNICODE);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage(), 'back' => true], JSON_UNESCAPED_UNICODE);
        }
    });

    // GET /plantel_personal/personal/[i:fk_personal] - Obtener asignaciones de plantel por ID de personal
    $mapAuthenticated('GET', '/plantel_personal/personal/[i:fk_personal]', function ($fk_personal) {
        try {
            $pdo = Conexion::obtener();
            $asignaciones = PlantelPersonal::consultarPorPersonal($pdo, $fk_personal);

            http_response_code(200);
            echo json_encode(['status' => 'success', 'data' => $asignaciones, 'back' => true], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Error del servidor al obtener asignaciones de plantel.', 'back' => true], JSON_UNESCAPED_UNICODE);
        }
    });
}
