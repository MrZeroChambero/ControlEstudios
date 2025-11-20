<?php

use Micodigo\Alergias\Alergias;
use Micodigo\Alergias\ListaAlergias\ListaAlergias;
use Micodigo\Config\Conexion;
use Micodigo\Login\Login;

function registrarRutasAlergias(AltoRouter $router)
{
  $ctrlAlergia = new Alergias([]);
  $ctrlLista = new ListaAlergias([]);

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

  // Alergias base
  $map('GET', '/alergias', [$ctrlAlergia, 'listarAlergias']);
  $map('POST', '/alergias', [$ctrlAlergia, 'crearAlergia']);
  $map('PUT', '/alergias/[i:id]', [$ctrlAlergia, 'actualizarAlergia']);
  $map('DELETE', '/alergias/[i:id]', [$ctrlAlergia, 'eliminarAlergia']);

  // Alergias de estudiante
  $map('GET', '/estudiantes/[i:id]/alergias', [$ctrlLista, 'listarAlergiasEstudiante']);
  $map('POST', '/estudiantes/alergias', [$ctrlLista, 'asignarAlergia']);
  $map('DELETE', '/estudiantes/alergias/[i:id]', [$ctrlLista, 'eliminarAlergiaAsignada']);

  // Alias lista-alergias (frontend)
  $map('GET', '/lista-alergias/estudiante/[i:id]', [$ctrlLista, 'listarAlergiasEstudiante']);
  $map('POST', '/lista-alergias', [$ctrlLista, 'asignarAlergia']);
  $map('DELETE', '/lista-alergias/[i:id]', [$ctrlLista, 'eliminarAlergiaAsignada']);
}
