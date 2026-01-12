<?php

namespace Micodigo\PreguntasSeguridad;

use Micodigo\Config\Conexion;
use Micodigo\Bloqueos\Bloqueos;
use Micodigo\Utils\RespuestaJson;
use Exception;
use RuntimeException;

class ControladoraPreguntasSeguridad
{
  public function iniciarRecuperacion(): void
  {
    try {
      $payload = $this->leerEntradaJson();
      $nombreUsuario = trim((string) ($payload['nombre_usuario'] ?? ''));
      $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

      $pdo = Conexion::obtener();
      $bloqueos = new Bloqueos();

      if ($nombreUsuario === '') {
        $registroIp = $bloqueos->registrarIntentoFallidoIp($pdo, $ip, Bloqueos::TIPO_PREGUNTAS, 10);
        if (!empty($registroIp['bloqueado'])) {
          RespuestaJson::error(
            'Demasiados intentos fallidos desde esta direccion IP. Intenta nuevamente en ' . Bloqueos::formatearMinutos(max(1, (int) ($registroIp['duracion_minutos'] ?? 1))) . '.',
            423,
            null,
            null,
            ['bloqueo' => $registroIp]
          );
          return;
        }

        RespuestaJson::error('Debes indicar el nombre de usuario.', 400, null, null, [
          'intentos' => $registroIp,
        ]);
        return;
      }

      $estadoBloqueoIp = $bloqueos->verificarBloqueoIp($pdo, $ip, Bloqueos::TIPO_PREGUNTAS);
      if ($estadoBloqueoIp) {
        RespuestaJson::error(
          'Demasiados intentos fallidos desde esta direccion IP. Intenta nuevamente en ' . Bloqueos::formatearMinutos(max(1, (int) $estadoBloqueoIp['duracion_minutos'])) . '.',
          423,
          null,
          null,
          ['bloqueo' => $estadoBloqueoIp]
        );
        return;
      }
      $servicio = new PreguntasSeguridad();
      $resultado = $servicio->obtenerPorNombreUsuario($pdo, $nombreUsuario);

      if (!$resultado) {
        $registroIp = $bloqueos->registrarIntentoFallidoIp($pdo, $ip, Bloqueos::TIPO_PREGUNTAS, 10);
        if (!empty($registroIp['bloqueado'])) {
          RespuestaJson::error(
            'Demasiados intentos fallidos desde esta direccion IP. Intenta nuevamente en ' . Bloqueos::formatearMinutos(max(1, (int) ($registroIp['duracion_minutos'] ?? 1))) . '.',
            423,
            null,
            null,
            ['bloqueo' => $registroIp]
          );
          return;
        }

        RespuestaJson::error('Usuario no encontrado o sin preguntas registradas.', 404, null, null, [
          'intentos' => $registroIp,
        ]);
        return;
      }

      $usuarioId = (int) $resultado['usuario']['id_usuario'];
      $estadoBloqueo = $bloqueos->verificarBloqueo($pdo, $usuarioId, Bloqueos::TIPO_PREGUNTAS);
      if ($estadoBloqueo) {
        RespuestaJson::error(
          'Demasiados intentos fallidos. Intenta nuevamente en ' . Bloqueos::formatearMinutos(max(1, (int) $estadoBloqueo['duracion_minutos'])) . '.',
          423,
          null,
          null,
          ['bloqueo' => $estadoBloqueo]
        );
        return;
      }

      $preguntaAleatoria = $servicio->obtenerPreguntaAleatoria($pdo, $usuarioId);
      if (!$preguntaAleatoria) {
        RespuestaJson::error('No fue posible seleccionar una pregunta de seguridad.', 500);
        return;
      }

      $bloqueos->limpiarIp($pdo, $ip, Bloqueos::TIPO_PREGUNTAS);

      RespuestaJson::exito([
        'usuario' => [
          'id_usuario' => $usuarioId,
          'nombre_usuario' => $resultado['usuario']['nombre_usuario'],
        ],
        'pregunta' => $preguntaAleatoria,
        'total_preguntas' => count($resultado['preguntas']),
      ], 'Preguntas de seguridad disponibles.');
    } catch (RuntimeException $e) {
      RespuestaJson::error($e->getMessage(), 400);
    } catch (Exception $e) {
      RespuestaJson::error('Error al iniciar la recuperacion.', 500, null, $e);
    }
  }

  public function restablecer(): void
  {
    $pdo = null;
    try {
      $payload = $this->leerEntradaJson();
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
        RespuestaJson::error('No se pudo restablecer la contrasena.', 400, ['general' => $errores]);
        return;
      }

      $pdo = Conexion::obtener();
      $servicio = new PreguntasSeguridad();
      $bloqueos = new Bloqueos();

      $estadoBloqueoIp = $bloqueos->verificarBloqueoIp($pdo, $ip, Bloqueos::TIPO_PREGUNTAS);
      if ($estadoBloqueoIp) {
        RespuestaJson::error(
          'Demasiados intentos fallidos desde esta direccion IP. Intenta nuevamente en ' . Bloqueos::formatearMinutos(max(1, (int) $estadoBloqueoIp['duracion_minutos'])) . '.',
          423,
          null,
          null,
          ['bloqueo' => $estadoBloqueoIp]
        );
        return;
      }

      $datosUsuario = $servicio->obtenerPorNombreUsuario($pdo, $nombreUsuario);

      if (!$datosUsuario) {
        $registroIp = $bloqueos->registrarIntentoFallidoIp($pdo, $ip, Bloqueos::TIPO_PREGUNTAS, 5);
        if (!empty($registroIp['bloqueado'])) {
          RespuestaJson::error(
            'Demasiados intentos fallidos desde esta direccion IP. Intenta nuevamente en ' . Bloqueos::formatearMinutos(max(1, (int) ($registroIp['duracion_minutos'] ?? 1))) . '.',
            423,
            null,
            null,
            ['bloqueo' => $registroIp]
          );
          return;
        }

        RespuestaJson::error('Usuario no encontrado o sin preguntas registradas.', 404, null, null, [
          'intentos' => $registroIp,
        ]);
        return;
      }

      $usuarioId = (int) $datosUsuario['usuario']['id_usuario'];
      $estadoBloqueo = $bloqueos->verificarBloqueo($pdo, $usuarioId, Bloqueos::TIPO_PREGUNTAS);
      if ($estadoBloqueo) {
        RespuestaJson::error(
          'Demasiados intentos fallidos. Intenta nuevamente en ' . Bloqueos::formatearMinutos(max(1, (int) $estadoBloqueo['duracion_minutos'])) . '.',
          423,
          null,
          null,
          ['bloqueo' => $estadoBloqueo]
        );
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

          RespuestaJson::error(
            'Has agotado los intentos. Intenta nuevamente en ' . Bloqueos::formatearMinutos(max(1, $duracion)) . '.',
            423,
            null,
            null,
            [
              'reason' => $motivo,
              'bloqueo' => !empty($resultadoIp['bloqueado'] ?? false) ? $resultadoIp : $resultadoUsuario,
            ]
          );
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

        RespuestaJson::error($mensajeIntentos, 403, null, null, [
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

      RespuestaJson::exito(null, 'Contrasena restablecida correctamente. Inicia sesion con tu nueva clave.');
    } catch (RuntimeException $e) {
      if ($pdo instanceof \PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
      }

      RespuestaJson::error($e->getMessage(), 400);
    } catch (Exception $e) {
      if ($pdo instanceof \PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
      }

      RespuestaJson::error('Error al restablecer la contrasena.', 500, null, $e);
    }
  }

  private function leerEntradaJson(): array
  {
    $contenido = file_get_contents('php://input');
    if ($contenido === false) {
      throw new RuntimeException('No se pudo leer el cuerpo de la solicitud.');
    }

    $contenido = trim($contenido);
    if ($contenido === '') {
      return [];
    }

    $datos = json_decode($contenido, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($datos)) {
      throw new RuntimeException('El cuerpo de la solicitud debe contener JSON válido: ' . json_last_error_msg());
    }

    return $datos;
  }
}
