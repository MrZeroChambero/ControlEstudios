<?php

use Micodigo\Config\Conexion;
use Micodigo\Login\Login;

function rutasMostrar(AltoRouter $router)
{
  // Handler reutilizable
  $handler = function ($username = null, $password = null) {
    header('Content-Type: application/json; charset=utf-8');

    // Si no vienen por segmentos, intentar desde query string
    if (empty($username)) {
      $username = $_GET['username'] ?? null;
    }
    if (empty($password)) {
      $password = $_GET['password'] ?? null;
    }
    $clave = password_hash($password, PASSWORD_DEFAULT);

    if (empty($username) || empty($password)) {
      http_response_code(400);
      echo json_encode(['back' => false, 'msg' => 'Usuario y contraseña requeridos.']);
      return;
    }

    try {
      $pdo = Conexion::obtener();
      $sql = "SELECT id_usuario, contrasena_hash, rol, nombre_usuario FROM usuarios WHERE nombre_usuario = ? AND estado = 'activo' LIMIT 1";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$username]);
      $user = $stmt->fetch(PDO::FETCH_ASSOC);

      if (!$user || !password_verify($password, $user['contrasena_hash'] ?? '')) {
        http_response_code(401);
        echo json_encode(['back' => false, 'msg' => 'Credenciales incorrectas.', 'hash' => $clave]);
        return;
      }

      unset($user['contrasena_hash']);
      http_response_code(200);
      echo json_encode(['back' => true, 'msg' => 'Autenticado', 'user' => $user], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
      error_log("ERROR mostrar.php: " . $e->getMessage());
      http_response_code(500);
      echo json_encode(['back' => false, 'msg' => 'Error en el servidor.']);
    }
  };

  // Ruta con segmentos: /mostrar/usuario/password
  $router->map('GET', '/mostrar/[:username]/[:password]', $handler);

  // Ruta que acepta query string: /mostrar?username=...&password=...
  $router->map('GET', '/mostrar', function () use ($handler) {
    // Llama al handler sin parámetros para que éste haga el fallback a $_GET
    $handler(null, null);
  });
}
?>

<!-- URL de ejemplo para llamar (con tu base path): -->
<!-- - GET con segmentos: -->
<!--   http://localhost:8080/controlestudios/servidor/mostrar/miUsuario/miPassword -->
<!-- - Alternativa (query string): -->
<!--   http://localhost:8080/controlestudios/servidor/mostrar?username=miUsuario&password=miPassword -->

<!-- Recomendación: cambia a POST y envía credenciales en el body JSON (más seguro). ¿Aplico este archivo en el proyecto? -->