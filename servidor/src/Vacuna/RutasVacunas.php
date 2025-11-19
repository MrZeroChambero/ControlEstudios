<?php

use Micodigo\Vacuna\Vacuna;
use Micodigo\Vacuna\VacunasEstudiante\VacunasEstudiante;
use Micodigo\Config\Conexion;
use Micodigo\Login\Login;

function registrarRutasVacunas(AltoRouter $router)
{
  $ctrlVacuna = new Vacuna([]);
  $ctrlVacunasEst = new VacunasEstudiante([]);

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

  // Vacunas catálogo
  $map('GET', '/vacunas', [$ctrlVacuna, 'listarVacunas']);
  $map('POST', '/vacunas', [$ctrlVacuna, 'crearVacuna']);
  $map('PUT', '/vacunas/[i:id]', [$ctrlVacuna, 'actualizarVacuna']);
  $map('DELETE', '/vacunas/[i:id]', [$ctrlVacuna, 'eliminarVacuna']);

  // Vacunas por estudiante
  $map('GET', '/estudiantes/[i:id]/vacunas', [$ctrlVacunasEst, 'listarVacunasEstudiante']);
  $map('POST', '/estudiantes/vacunas', [$ctrlVacunasEst, 'asignarVacuna']);
  $map('PUT', '/estudiantes/vacunas/[i:id]', [$ctrlVacunasEst, 'actualizarVacunaEstudiante']);
  $map('DELETE', '/estudiantes/vacunas/[i:id]', [$ctrlVacunasEst, 'eliminarVacunaEstudiante']);
}
