<?php

namespace Micodigo\PreguntasSeguridad;

use Micodigo\Config\Conexion;
use Micodigo\Bloqueos\Bloqueos;
use Exception;

class ControladoraPreguntasSeguridad
{
  public function iniciarRecuperacion(): void
  {
    try {
      $payload = json_decode(file_get_contents('php://input'), true) ?? [];
      $nombreUsuario = trim((string) ($payload['nombre_usuario'] ?? ''));
      $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

      $pdo = Conexion::obtener();
      $bloqueos = new Bloqueos();

      if ($nombreUsuario === '') {
        $registroIp = $bloqueos->registrarIntentoFallidoIp($pdo, $ip, Bloqueos::TIPO_PREGUNTAS, 10);
        if (!empty($registroIp['bloqueado'])) {
          http_response_code(423);
          header('Content-Type: application/json');
          echo json_encode([
            'back' => false,
            'message' => 'Demasiados intentos fallidos desde esta direccion IP. Intenta nuevamente en ' . Bloqueos::formatearMinutos(max(1, (int) ($registroIp['duracion_minutos'] ?? 1))) . '.',
            'bloqueo' => $registroIp,
          ]);
          return;
        }

        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Debes indicar el nombre de usuario.',
          'intentos' => $registroIp,
        ]);
        return;
      }

      $estadoBloqueoIp = $bloqueos->verificarBloqueoIp($pdo, $ip, Bloqueos::TIPO_PREGUNTAS);
      if ($estadoBloqueoIp) {
        http_response_code(423);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Demasiados intentos fallidos desde esta direccion IP. Intenta nuevamente en ' . Bloqueos::formatearMinutos(max(1, (int) $estadoBloqueoIp['duracion_minutos'])) . '.',
          'bloqueo' => $estadoBloqueoIp,
        ]);
        return;
      }
      $servicio = new PreguntasSeguridad();
      $resultado = $servicio->obtenerPorNombreUsuario($pdo, $nombreUsuario);

      if (!$resultado) {
        $registroIp = $bloqueos->registrarIntentoFallidoIp($pdo, $ip, Bloqueos::TIPO_PREGUNTAS, 10);
        if (!empty($registroIp['bloqueado'])) {
          http_response_code(423);
          header('Content-Type: application/json');
          echo json_encode([
            'back' => false,
            'message' => 'Demasiados intentos fallidos desde esta direccion IP. Intenta nuevamente en ' . Bloqueos::formatearMinutos(max(1, (int) ($registroIp['duracion_minutos'] ?? 1))) . '.',
            'bloqueo' => $registroIp,
          ]);
          return;
        }

        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Usuario no encontrado o sin preguntas registradas.',
          'intentos' => $registroIp,
        ]);
        return;
      }

      $estadoBloqueo = $bloqueos->verificarBloqueo($pdo, (int) $resultado['usuario']['id_usuario'], Bloqueos::TIPO_PREGUNTAS);
      if ($estadoBloqueo) {
        http_response_code(423);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Demasiados intentos fallidos. Intenta nuevamente en ' . Bloqueos::formatearMinutos(max(1, (int) $estadoBloqueo['duracion_minutos'])) . '.',
          'bloqueo' => $estadoBloqueo,
        ]);
        return;
      }

      $bloqueos->limpiarIp($pdo, $ip, Bloqueos::TIPO_PREGUNTAS);

      header('Content-Type: application/json');
      echo json_encode([
        'back' => true,
        'data' => [
          'usuario' => [
            'id_usuario' => (int) $resultado['usuario']['id_usuario'],
            'nombre_usuario' => $resultado['usuario']['nombre_usuario'],
          ],
          'preguntas' => $resultado['preguntas'],
        ],
        'message' => 'Preguntas de seguridad disponibles.'
      ]);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error al iniciar la recuperacion.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  public function restablecer(): void
  {
    $pdo = null;
    try {
      $payload = json_decode(file_get_contents('php://input'), true) ?? [];
      $nombreUsuario = trim((string) ($payload['nombre_usuario'] ?? ''));
      $preguntaId = (int) ($payload['id_pregunta'] ?? 0);
      $respuesta = trim((string) ($payload['respuesta'] ?? ''));
      $nuevaContrasena = (string) ($payload['nueva_contrasena'] ?? '');
      $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

      $errores = [];
      if ($nombreUsuario === '') {
        $errores[] = 'El nombre de usuario es obligatorio.';
      }
      if ($preguntaId <= 0) {
        $errores[] = 'Selecciona una pregunta valida.';
      }
      if ($respuesta === '') {
        $errores[] = 'Debes responder la pregunta de seguridad.';
      }
      if (strlen($nuevaContrasena) < 8) {
        $errores[] = 'La nueva contrasena debe tener al menos 8 caracteres.';
      }

      if (!empty($errores)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'No se pudo restablecer la contrasena.',
          'errors' => $errores,
        ]);
        return;
      }

      $pdo = Conexion::obtener();
      $servicio = new PreguntasSeguridad();
      $bloqueos = new Bloqueos();

      $estadoBloqueoIp = $bloqueos->verificarBloqueoIp($pdo, $ip, Bloqueos::TIPO_PREGUNTAS);
      if ($estadoBloqueoIp) {
        http_response_code(423);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Demasiados intentos fallidos desde esta direccion IP. Intenta nuevamente en ' . Bloqueos::formatearMinutos(max(1, (int) $estadoBloqueoIp['duracion_minutos'])) . '.',
          'bloqueo' => $estadoBloqueoIp,
        ]);
        return;
      }

      $datosUsuario = $servicio->obtenerPorNombreUsuario($pdo, $nombreUsuario);

      if (!$datosUsuario) {
        $registroIp = $bloqueos->registrarIntentoFallidoIp($pdo, $ip, Bloqueos::TIPO_PREGUNTAS, 5);
        if (!empty($registroIp['bloqueado'])) {
          http_response_code(423);
          header('Content-Type: application/json');
          echo json_encode([
            'back' => false,
            'message' => 'Demasiados intentos fallidos desde esta direccion IP. Intenta nuevamente en ' . Bloqueos::formatearMinutos(max(1, (int) ($registroIp['duracion_minutos'] ?? 1))) . '.',
            'bloqueo' => $registroIp,
          ]);
          return;
        }

        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Usuario no encontrado o sin preguntas registradas.',
          'intentos' => $registroIp,
        ]);
        return;
      }

      $usuarioId = (int) $datosUsuario['usuario']['id_usuario'];
      $estadoBloqueo = $bloqueos->verificarBloqueo($pdo, $usuarioId, Bloqueos::TIPO_PREGUNTAS);
      if ($estadoBloqueo) {
        http_response_code(423);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Demasiados intentos fallidos. Intenta nuevamente en ' . Bloqueos::formatearMinutos(max(1, (int) $estadoBloqueo['duracion_minutos'])) . '.',
          'bloqueo' => $estadoBloqueo,
        ]);
        return;
      }

      if (!$servicio->validarRespuesta($pdo, $usuarioId, $preguntaId, $respuesta)) {
        $resultadoUsuario = $bloqueos->registrarIntentoFallido($pdo, $usuarioId, Bloqueos::TIPO_PREGUNTAS);
        $resultadoIp = $bloqueos->registrarIntentoFallidoIp($pdo, $ip, Bloqueos::TIPO_PREGUNTAS, 5);

        if (!empty($resultadoUsuario['bloqueado']) || (!empty($resultadoIp['bloqueado'] ?? false))) {
          $duracion = !empty($resultadoUsuario['bloqueado'])
            ? (int) ($resultadoUsuario['duracion_minutos'] ?? 1)
            : (int) ($resultadoIp['duracion_minutos'] ?? 1);
          $motivo = !empty($resultadoIp['bloqueado'] ?? false) ? 'ip_bloqueada' : 'bloqueado';

          http_response_code(423);
          header('Content-Type: application/json');
          echo json_encode([
            'back' => false,
            'reason' => $motivo,
            'message' => 'Has agotado los intentos. Intenta nuevamente en ' . Bloqueos::formatearMinutos(max(1, $duracion)) . '.',
            'bloqueo' => !empty($resultadoIp['bloqueado'] ?? false) ? $resultadoIp : $resultadoUsuario,
          ]);
          return;
        }

        $restantesUsuario = (int) ($resultadoUsuario['intentos_restantes'] ?? 0);
        $restantesIp = (int) ($resultadoIp['intentos_restantes'] ?? 0);
        $restantes = $restantesUsuario;
        if ($restantes === 0 || ($restantesIp > 0 && ($restantes === 0 || $restantesIp < $restantes))) {
          $restantes = $restantesIp;
        }

        $mensajeIntentos = $restantes > 0
          ? 'La respuesta proporcionada no es valida. Te quedan ' . $restantes . ' intentos antes del bloqueo.'
          : 'La respuesta proporcionada no es valida.';

        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => $mensajeIntentos,
          'intentos' => [
            'usuario' => $resultadoUsuario,
            'ip' => $resultadoIp,
          ],
        ]);
        return;
      }

      $pdo->beginTransaction();

      $stmt = $pdo->prepare('UPDATE usuarios SET contrasena_hash = ? WHERE id_usuario = ?');
      $stmt->execute([password_hash($nuevaContrasena, PASSWORD_DEFAULT), $usuarioId]);

      $stmtSesiones = $pdo->prepare('DELETE FROM sesiones_usuario WHERE fk_usuario = ?');
      $stmtSesiones->execute([$usuarioId]);

      $pdo->commit();

      $bloqueos->limpiar($pdo, $usuarioId, Bloqueos::TIPO_PREGUNTAS);
      $bloqueos->limpiarIp($pdo, $ip, Bloqueos::TIPO_PREGUNTAS);

      header('Content-Type: application/json');
      echo json_encode([
        'back' => true,
        'message' => 'Contrasena restablecida correctamente. Inicia sesion con tu nueva clave.'
      ]);
    } catch (Exception $e) {
      if ($pdo instanceof \PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
      }

      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error al restablecer la contrasena.',
        'error_details' => $e->getMessage()
      ]);
    }
  }
}
