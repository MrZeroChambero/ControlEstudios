<?php

use Micodigo\ConsultasMedicas\ConsultasMedicas;
use Micodigo\Config\Conexion;
use Micodigo\Login\Login;

function registrarRutasConsultasMedicas(AltoRouter $router)
{
  $ctrl = new ConsultasMedicas([]);

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

  // Consultas médicas por estudiante
  $map('GET', '/estudiantes/[i:id]/consultas-medicas', [$ctrl, 'listarConsultasMedicasEstudiante']);
  $map('POST', '/estudiantes/consultas-medicas', [$ctrl, 'crearConsultaMedica']);
  $map('PUT', '/estudiantes/consultas-medicas/[i:id]', [$ctrl, 'actualizarConsultaMedica']);
  $map('DELETE', '/estudiantes/consultas-medicas/[i:id]', [$ctrl, 'eliminarConsultaMedica']);
}
