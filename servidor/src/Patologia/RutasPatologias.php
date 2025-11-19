<?php

use Micodigo\Patologia\Patologia;
use Micodigo\CondicionesSalud\CondicionesSalud;
use Micodigo\Config\Conexion;
use Micodigo\Login\Login;

function registrarRutasPatologias(AltoRouter $router)
{
  $ctrlPatologia = new Patologia([]);
  $ctrlCondicion = new CondicionesSalud([]);

  $auth = function () {
    header('Content-Type: text/html; charset=utf-8');
    if (!isset($_COOKIE['session_token'])) {
      http_response_code(401);
      echo json_encode(['status' => 'error', 'message' => 'Acceso no autorizado', 'back' => true], JSON_UNESCAPED_UNICODE);
      exit();
    }
    $pdo = Conexion::obtener();
    $login = new Login($pdo);
    if (!$login->obtenerUsuarioPorHash($_COOKIE['session_token'])) {
      http_response_code(401);
      echo json_encode(['status' => 'error', 'message' => 'Sesión inválida o expirada', 'back' => true], JSON_UNESCAPED_UNICODE);
      exit();
    }
  };
  $map = function (string $m, string $r, callable $t) use ($router, $auth) {
    $router->map($m, $r, function (...$p) use ($auth, $t) {
      $auth();
      call_user_func_array($t, $p);
    });
  };

  // Patologías catálogo
  $map('GET', '/patologias', [$ctrlPatologia, 'listarPatologias']);
  $map('POST', '/patologias', [$ctrlPatologia, 'crearPatologia']);
  $map('PUT', '/patologias/[i:id]', [$ctrlPatologia, 'actualizarPatologia']);
  $map('DELETE', '/patologias/[i:id]', [$ctrlPatologia, 'eliminarPatologia']);

  // Condiciones de salud por estudiante
  $map('GET', '/estudiantes/[i:id]/condiciones-salud', [$ctrlCondicion, 'listarCondicionesEstudiante']);
  $map('POST', '/estudiantes/condiciones-salud', [$ctrlCondicion, 'crearCondicion']);
  $map('PUT', '/estudiantes/condiciones-salud/[i:id]', [$ctrlCondicion, 'actualizarCondicion']);
  $map('DELETE', '/estudiantes/condiciones-salud/[i:id]', [$ctrlCondicion, 'eliminarCondicion']);
}
