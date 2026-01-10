<?php

use Micodigo\DocumentosAcademicos\DocumentosAcademicos;
use Micodigo\Config\Conexion;
use Micodigo\Login\Login;

function registrarRutasDocumentosAcademicos(
  AltoRouter $router,
  callable $mapAuthenticatedRole = null,
  array $rolesPermitidos = []
) {
  $ctrl = new DocumentosAcademicos([]);

  if ($mapAuthenticatedRole) {
    $map = function (string $m, string $r, callable $t) use ($mapAuthenticatedRole, $rolesPermitidos) {
      $mapAuthenticatedRole($m, $r, $t, $rolesPermitidos);
    };
  } else {
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
  }

  // Documentos académicos por estudiante
  $map('GET', '/estudiantes/[i:id]/documentos-academicos', [$ctrl, 'listarDocumentosEstudiante']);
  $map('POST', '/estudiantes/documentos-academicos', [$ctrl, 'crearDocumentoAcademico']);
  $map('PUT', '/estudiantes/documentos-academicos/[i:id]', [$ctrl, 'actualizarDocumentoAcademico']);
  $map('DELETE', '/estudiantes/documentos-academicos/[i:id]', [$ctrl, 'eliminarDocumentoAcademico']);

  // Alias compatibles con frontend actual
  $map('GET', '/documentos-academicos/estudiante/[i:id]', [$ctrl, 'listarDocumentosEstudiante']);
  $map('POST', '/documentos-academicos', [$ctrl, 'crearDocumentoAcademico']);
  $map('PUT', '/documentos-academicos/[i:id]', [$ctrl, 'actualizarDocumentoAcademico']);
  $map('DELETE', '/documentos-academicos/[i:id]', [$ctrl, 'eliminarDocumentoAcademico']);
}
