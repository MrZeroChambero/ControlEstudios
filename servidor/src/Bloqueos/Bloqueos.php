<?php

namespace Micodigo\Bloqueos;

use PDO;
use DateTimeImmutable;
use Exception;

class Bloqueos
{
  public const TIPO_LOGIN = 'inicio_de_sesion';
  public const TIPO_PREGUNTAS = 'preguntas_de_seguridad';
  public const TIPO_DDOS = 'DDOS';

  private const DURACIONES_MINUTOS = [5, 30, 60, 180];

  public function verificarBloqueo(PDO $conexion, int $usuarioId, string $tipo): ?array
  {
    $registro = $this->obtenerRegistro($conexion, $usuarioId, $tipo);
    if (!$registro) {
      return null;
    }

    $ahora = new DateTimeImmutable('now');
    $fechaDesbloqueo = $this->obtenerFechaSegura($registro['fecha_desbloqueo'] ?? null, $ahora);
    $fechaUltimo = $this->obtenerFechaSegura($registro['fecha_ultimo_bloqueo'] ?? null, $ahora);
    $bloqueoActivo = $fechaDesbloqueo > $ahora;

    if (!$bloqueoActivo) {
      if ($fechaDesbloqueo > $fechaUltimo) {
        $this->reiniciarIntentos($conexion, $usuarioId, $tipo);
      }
      return null;
    }

    $segundosRestantes = max(0, $fechaDesbloqueo->getTimestamp() - $ahora->getTimestamp());

    return [
      'bloqueado' => true,
      'fecha_desbloqueo' => $fechaDesbloqueo->format('Y-m-d H:i:s'),
      'segundos_restantes' => $segundosRestantes,
      'bloqueos_seguidos' => (int) $registro['bloqueos_seguidos'],
      'duracion_minutos' => (int) max(1, ceil($segundosRestantes / 60)),
    ];
  }

  public function registrarIntentoFallido(PDO $conexion, int $usuarioId, string $tipo, int $limite = 5): array
  {
    $registro = $this->asegurarRegistro($conexion, $usuarioId, $tipo);
    $ahora = new DateTimeImmutable('now');
    $fechaDesbloqueo = new DateTimeImmutable($registro['fecha_desbloqueo']);

    if ($fechaDesbloqueo > $ahora) {
      $segundosRestantes = max(0, $fechaDesbloqueo->getTimestamp() - $ahora->getTimestamp());
      return [
        'bloqueado' => true,
        'fecha_desbloqueo' => $fechaDesbloqueo->format('Y-m-d H:i:s'),
        'segundos_restantes' => $segundosRestantes,
        'bloqueos_seguidos' => (int) $registro['bloqueos_seguidos'],
        'duracion_minutos' => (int) max(1, ceil($segundosRestantes / 60)),
      ];
    }

    $intentos = (int) $registro['intentos'] + 1;

    if ($intentos >= $limite) {
      $bloqueosSeguidos = (int) $registro['bloqueos_seguidos'] + 1;
      $duracion = $this->determinarDuracion($bloqueosSeguidos);
      $nuevaFechaDesbloqueo = $ahora->modify('+' . $duracion . ' minutes');

      $sql = 'UPDATE bloqueos SET intentos = 0, bloqueos_seguidos = ?, fecha_desbloqueo = ?, fecha_ultimo_bloqueo = ? WHERE fk_usuario = ? AND tipo_bloqueo = ?';
      $stmt = $conexion->prepare($sql);
      if (!$stmt->execute([$bloqueosSeguidos, $nuevaFechaDesbloqueo->format('Y-m-d H:i:s'), $ahora->format('Y-m-d H:i:s'), $usuarioId, $tipo])) {
        throw new Exception('No se pudo actualizar el estado de bloqueo.');
      }

      return [
        'bloqueado' => true,
        'fecha_desbloqueo' => $nuevaFechaDesbloqueo->format('Y-m-d H:i:s'),
        'segundos_restantes' => $duracion * 60,
        'bloqueos_seguidos' => $bloqueosSeguidos,
        'duracion_minutos' => $duracion,
      ];
    }

    $sql = 'UPDATE bloqueos SET intentos = ?, fecha_ultimo_bloqueo = ? WHERE fk_usuario = ? AND tipo_bloqueo = ?';
    $stmt = $conexion->prepare($sql);
    if (!$stmt->execute([$intentos, $ahora->format('Y-m-d H:i:s'), $usuarioId, $tipo])) {
      throw new Exception('No se pudo registrar el intento fallido.');
    }

    return [
      'bloqueado' => false,
      'intentos_restantes' => max(0, $limite - $intentos),
      'intentos_actuales' => $intentos,
    ];
  }

  public function limpiar(PDO $conexion, int $usuarioId, string $tipo): void
  {
    $sql = 'DELETE FROM bloqueos WHERE fk_usuario = ? AND tipo_bloqueo = ?';
    $stmt = $conexion->prepare($sql);
    $stmt->execute([$usuarioId, $tipo]);
  }

  public function verificarBloqueoIp(PDO $conexion, string $ip, string $tipo): ?array
  {
    $this->crearTablaIpSiNoExiste($conexion);
    $registro = $this->obtenerRegistroIp($conexion, $ip, $tipo);
    if (!$registro) {
      return null;
    }

    $ahora = new DateTimeImmutable('now');
    $fechaDesbloqueo = $this->obtenerFechaSegura($registro['fecha_desbloqueo'] ?? null, $ahora);
    $fechaUltimo = $this->obtenerFechaSegura($registro['fecha_ultimo_bloqueo'] ?? null, $ahora);
    $bloqueoActivo = $fechaDesbloqueo > $ahora;

    if (!$bloqueoActivo) {
      if ($fechaDesbloqueo > $fechaUltimo) {
        $this->reiniciarIntentosIp($conexion, $ip, $tipo);
      }
      return null;
    }

    $segundosRestantes = max(0, $fechaDesbloqueo->getTimestamp() - $ahora->getTimestamp());

    return [
      'bloqueado' => true,
      'fecha_desbloqueo' => $fechaDesbloqueo->format('Y-m-d H:i:s'),
      'segundos_restantes' => $segundosRestantes,
      'bloqueos_seguidos' => (int) $registro['bloqueos_seguidos'],
      'duracion_minutos' => (int) max(1, ceil($segundosRestantes / 60)),
    ];
  }

  public function registrarIntentoFallidoIp(PDO $conexion, string $ip, string $tipo, int $limite = 5): array
  {
    $this->crearTablaIpSiNoExiste($conexion);
    $registro = $this->asegurarRegistroIp($conexion, $ip, $tipo);
    $ahora = new DateTimeImmutable('now');
    $fechaDesbloqueo = new DateTimeImmutable($registro['fecha_desbloqueo']);

    if ($fechaDesbloqueo > $ahora) {
      $segundosRestantes = max(0, $fechaDesbloqueo->getTimestamp() - $ahora->getTimestamp());
      return [
        'bloqueado' => true,
        'fecha_desbloqueo' => $fechaDesbloqueo->format('Y-m-d H:i:s'),
        'segundos_restantes' => $segundosRestantes,
        'bloqueos_seguidos' => (int) $registro['bloqueos_seguidos'],
        'duracion_minutos' => (int) max(1, ceil($segundosRestantes / 60)),
      ];
    }

    $intentos = (int) $registro['intentos'] + 1;

    if ($intentos >= $limite) {
      $bloqueosSeguidos = (int) $registro['bloqueos_seguidos'] + 1;
      $duracion = $this->determinarDuracion($bloqueosSeguidos);
      $nuevaFechaDesbloqueo = $ahora->modify('+' . $duracion . ' minutes');

      $sql = 'UPDATE bloqueos_ip SET intentos = 0, bloqueos_seguidos = ?, fecha_desbloqueo = ?, fecha_ultimo_bloqueo = ? WHERE ip_hash = ? AND tipo_bloqueo = ?';
      $stmt = $conexion->prepare($sql);
      if (!$stmt->execute([$bloqueosSeguidos, $nuevaFechaDesbloqueo->format('Y-m-d H:i:s'), $ahora->format('Y-m-d H:i:s'), $this->obtenerHashIp($ip), $tipo])) {
        throw new Exception('No se pudo actualizar el estado de bloqueo por IP.');
      }

      return [
        'bloqueado' => true,
        'fecha_desbloqueo' => $nuevaFechaDesbloqueo->format('Y-m-d H:i:s'),
        'segundos_restantes' => $duracion * 60,
        'bloqueos_seguidos' => $bloqueosSeguidos,
        'duracion_minutos' => $duracion,
      ];
    }

    $sql = 'UPDATE bloqueos_ip SET intentos = ?, fecha_ultimo_bloqueo = ? WHERE ip_hash = ? AND tipo_bloqueo = ?';
    $stmt = $conexion->prepare($sql);
    if (!$stmt->execute([$intentos, $ahora->format('Y-m-d H:i:s'), $this->obtenerHashIp($ip), $tipo])) {
      throw new Exception('No se pudo registrar el intento fallido por IP.');
    }

    return [
      'bloqueado' => false,
      'intentos_restantes' => max(0, $limite - $intentos),
      'intentos_actuales' => $intentos,
    ];
  }

  public function limpiarIp(PDO $conexion, string $ip, string $tipo): void
  {
    $this->crearTablaIpSiNoExiste($conexion);
    $sql = 'DELETE FROM bloqueos_ip WHERE ip_hash = ? AND tipo_bloqueo = ?';
    $stmt = $conexion->prepare($sql);
    $stmt->execute([$this->obtenerHashIp($ip), $tipo]);
  }

  public static function formatearMinutos(int $minutos): string
  {
    if ($minutos >= 60) {
      $horas = intdiv($minutos, 60);
      $resto = $minutos % 60;

      if ($resto === 0) {
        return $horas === 1 ? '1 hora' : $horas . ' horas';
      }

      $parteHoras = $horas === 1 ? '1 hora' : $horas . ' horas';
      $parteMinutos = $resto === 1 ? '1 minuto' : $resto . ' minutos';
      return $parteHoras . ' y ' . $parteMinutos;
    }

    return $minutos === 1 ? '1 minuto' : $minutos . ' minutos';
  }

  private function determinarDuracion(int $bloqueosSeguidos): int
  {
    $index = max(1, min($bloqueosSeguidos, count(self::DURACIONES_MINUTOS)));
    return self::DURACIONES_MINUTOS[$index - 1];
  }

  private function asegurarRegistro(PDO $conexion, int $usuarioId, string $tipo): array
  {
    $tipo = $this->normalizarTipo($tipo);
    $registro = $this->obtenerRegistro($conexion, $usuarioId, $tipo);

    if ($registro) {
      return $registro;
    }

    $sql = 'INSERT INTO bloqueos (fk_usuario, intentos, fecha_desbloqueo, bloqueos_seguidos, fecha_ultimo_bloqueo, tipo_bloqueo) VALUES (?, 0, ?, 0, ?, ?)';
    $ahora = new DateTimeImmutable('now');
    $stmt = $conexion->prepare($sql);
    if (!$stmt->execute([$usuarioId, $ahora->format('Y-m-d H:i:s'), $ahora->format('Y-m-d H:i:s'), $tipo])) {
      throw new Exception('No se pudo crear el registro de bloqueo.');
    }

    return $this->obtenerRegistro($conexion, $usuarioId, $tipo);
  }

  private function reiniciarIntentos(PDO $conexion, int $usuarioId, string $tipo): void
  {
    $ahora = new DateTimeImmutable('now');
    $marca = $ahora->format('Y-m-d H:i:s');
    $sql = 'UPDATE bloqueos SET intentos = 0, fecha_desbloqueo = ?, fecha_ultimo_bloqueo = ? WHERE fk_usuario = ? AND tipo_bloqueo = ?';
    $stmt = $conexion->prepare($sql);
    $stmt->execute([$marca, $marca, $usuarioId, $tipo]);
  }

  private function obtenerRegistro(PDO $conexion, int $usuarioId, string $tipo): ?array
  {
    $tipo = $this->normalizarTipo($tipo);
    $sql = 'SELECT id_bloqueo, fk_usuario, intentos, fecha_desbloqueo, bloqueos_seguidos, fecha_ultimo_bloqueo, tipo_bloqueo FROM bloqueos WHERE fk_usuario = ? AND tipo_bloqueo = ? LIMIT 1';
    $stmt = $conexion->prepare($sql);
    $stmt->execute([$usuarioId, $tipo]);
    $registro = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$registro) {
      return null;
    }

    return $this->reiniciarSiCambioDiaUsuario($conexion, $registro);
  }

  private function asegurarRegistroIp(PDO $conexion, string $ip, string $tipo): array
  {
    $tipo = $this->normalizarTipo($tipo);
    $hash = $this->obtenerHashIp($ip);
    $registro = $this->obtenerRegistroIp($conexion, $ip, $tipo);

    if ($registro) {
      return $registro;
    }

    $sql = 'INSERT INTO bloqueos_ip (ip_hash, intentos, fecha_desbloqueo, bloqueos_seguidos, fecha_ultimo_bloqueo, tipo_bloqueo) VALUES (?, 0, ?, 0, ?, ?)';
    $ahora = new DateTimeImmutable('now');
    $stmt = $conexion->prepare($sql);
    if (!$stmt->execute([$hash, $ahora->format('Y-m-d H:i:s'), $ahora->format('Y-m-d H:i:s'), $tipo])) {
      throw new Exception('No se pudo crear el registro de bloqueo por IP.');
    }

    return $this->obtenerRegistroIp($conexion, $ip, $tipo);
  }

  private function obtenerRegistroIp(PDO $conexion, string $ip, string $tipo): ?array
  {
    $tipo = $this->normalizarTipo($tipo);
    $hash = $this->obtenerHashIp($ip);
    $sql = 'SELECT id_bloqueo_ip, ip_hash, intentos, fecha_desbloqueo, bloqueos_seguidos, fecha_ultimo_bloqueo, tipo_bloqueo FROM bloqueos_ip WHERE ip_hash = ? AND tipo_bloqueo = ? LIMIT 1';
    $stmt = $conexion->prepare($sql);
    $stmt->execute([$hash, $tipo]);
    $registro = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$registro) {
      return null;
    }

    return $this->reiniciarSiCambioDiaIp($conexion, $registro);
  }

  private function reiniciarIntentosIp(PDO $conexion, string $ip, string $tipo): void
  {
    $ahora = new DateTimeImmutable('now');
    $marca = $ahora->format('Y-m-d H:i:s');
    $sql = 'UPDATE bloqueos_ip SET intentos = 0, fecha_desbloqueo = ?, fecha_ultimo_bloqueo = ? WHERE ip_hash = ? AND tipo_bloqueo = ?';
    $stmt = $conexion->prepare($sql);
    $stmt->execute([$marca, $marca, $this->obtenerHashIp($ip), $tipo]);
  }

  private function crearTablaIpSiNoExiste(PDO $conexion): void
  {
    $sql = 'CREATE TABLE IF NOT EXISTS bloqueos_ip (
      id_bloqueo_ip INT(11) NOT NULL AUTO_INCREMENT,
      ip_hash CHAR(64) NOT NULL,
      intentos INT(3) NOT NULL,
      fecha_desbloqueo DATETIME NOT NULL,
      bloqueos_seguidos INT(3) NOT NULL,
      fecha_ultimo_bloqueo DATETIME NOT NULL,
      tipo_bloqueo ENUM("inicio_de_sesion","preguntas_de_seguridad","DDOS") NOT NULL,
      PRIMARY KEY (id_bloqueo_ip),
      UNIQUE KEY idx_bloqueos_ip_hash_tipo (ip_hash, tipo_bloqueo)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;';

    $conexion->exec($sql);
  }

  private function obtenerHashIp(string $ip): string
  {
    return hash('sha256', $ip);
  }

  private function normalizarTipo(string $tipo): string
  {
    $permitidos = [self::TIPO_LOGIN, self::TIPO_PREGUNTAS, self::TIPO_DDOS];
    if (!in_array($tipo, $permitidos, true)) {
      throw new Exception('Tipo de bloqueo no permitido.');
    }
    return $tipo;
  }

  private function reiniciarSiCambioDiaUsuario(PDO $conexion, array $registro): array
  {
    $ahora = new DateTimeImmutable('now');
    $ultimo = $this->obtenerFechaSegura($registro['fecha_ultimo_bloqueo'] ?? null, $ahora);

    if ($ultimo->format('Y-m-d') === $ahora->format('Y-m-d')) {
      return $registro;
    }

    $nuevaFecha = $ahora->format('Y-m-d H:i:s');
    $sql = 'UPDATE bloqueos SET intentos = 0, bloqueos_seguidos = 0, fecha_desbloqueo = ?, fecha_ultimo_bloqueo = ? WHERE id_bloqueo = ?';
    $stmt = $conexion->prepare($sql);
    $stmt->execute([$nuevaFecha, $nuevaFecha, $registro['id_bloqueo']]);

    $registro['intentos'] = 0;
    $registro['bloqueos_seguidos'] = 0;
    $registro['fecha_desbloqueo'] = $nuevaFecha;
    $registro['fecha_ultimo_bloqueo'] = $nuevaFecha;

    return $registro;
  }

  private function reiniciarSiCambioDiaIp(PDO $conexion, array $registro): array
  {
    $ahora = new DateTimeImmutable('now');
    $ultimo = $this->obtenerFechaSegura($registro['fecha_ultimo_bloqueo'] ?? null, $ahora);

    if ($ultimo->format('Y-m-d') === $ahora->format('Y-m-d')) {
      return $registro;
    }

    $nuevaFecha = $ahora->format('Y-m-d H:i:s');
    $sql = 'UPDATE bloqueos_ip SET intentos = 0, bloqueos_seguidos = 0, fecha_desbloqueo = ?, fecha_ultimo_bloqueo = ? WHERE id_bloqueo_ip = ?';
    $stmt = $conexion->prepare($sql);
    $stmt->execute([$nuevaFecha, $nuevaFecha, $registro['id_bloqueo_ip']]);

    $registro['intentos'] = 0;
    $registro['bloqueos_seguidos'] = 0;
    $registro['fecha_desbloqueo'] = $nuevaFecha;
    $registro['fecha_ultimo_bloqueo'] = $nuevaFecha;

    return $registro;
  }

  private function obtenerFechaSegura(?string $fecha, DateTimeImmutable $ahora): DateTimeImmutable
  {
    if (!$fecha) {
      return $ahora->modify('-1 day');
    }

    try {
      return new DateTimeImmutable($fecha);
    } catch (Exception $e) {
      return $ahora->modify('-1 day');
    }
  }
}
