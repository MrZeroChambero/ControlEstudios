<?php

namespace Micodigo\Respaldo;

use Exception;

trait RespaldoUtilidadesTrait
{
  protected function asegurarDirectorio(): void
  {
    if (!is_dir($this->directorioRespaldos)) {
      if (!mkdir($concurrentDirectory = $this->directorioRespaldos, 0775, true) && !is_dir($concurrentDirectory)) {
        throw new Exception('No se pudo crear el directorio de respaldos.');
      }
    }
  }

  protected function obtenerRutaArchivo(string $nombre): string
  {
    $nombreSeguro = basename($nombre);
    return $this->directorioRespaldos . DIRECTORY_SEPARATOR . $nombreSeguro;
  }

  protected function generarNombreArchivo(?int $timestamp = null): string
  {
    $timestamp = $timestamp ?? time();
    $fecha = gmdate('d-m-Y_H-i-s', $timestamp + $this->obtenerOffsetHorario());
    return $fecha . '.sql';
  }

  protected function obtenerOffsetHorario(): int
  {
    $zona = new \DateTimeZone(date_default_timezone_get());
    $ahora = new \DateTime('now', $zona);
    return $zona->getOffset($ahora);
  }

  protected function formatearFechaHumana(int $timestamp): string
  {
    $mapaMeses = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];

    $fechaLocal = $timestamp + $this->obtenerOffsetHorario();
    $dia = (int) gmdate('d', $fechaLocal);
    $mes = (int) gmdate('n', $fechaLocal);
    $anio = (int) gmdate('Y', $fechaLocal);
    $hora = gmdate('H:i:s', $fechaLocal);

    $nombreMes = $mapaMeses[$mes - 1] ?? 'mes';

    return sprintf('%02d de %s de %d · %s', $dia, $nombreMes, $anio, $hora);
  }

  protected function formatearTamano(int $bytes): string
  {
    if ($bytes <= 0) {
      return '0 B';
    }

    $unidades = ['B', 'KB', 'MB', 'GB', 'TB'];
    $exp = (int) floor(log($bytes, 1024));
    $exp = min($exp, count($unidades) - 1);
    $valor = $bytes / (1024 ** $exp);

    return sprintf('%.2f %s', $valor, $unidades[$exp]);
  }

  protected function envolverRutaParaShell(string $ruta): string
  {
    $normalizada = $ruta;
    if (PHP_OS_FAMILY === 'Windows') {
      $normalizada = str_replace('/', DIRECTORY_SEPARATOR, $normalizada);
    }

    return '"' . str_replace('"', '\"', $normalizada) . '"';
  }

  protected function resolverBinario(string $nombre): string
  {
    $ext = PHP_OS_FAMILY === 'Windows' ? '.exe' : '';
    $binariosPosibles = [];

    $binDesdeEnv = getenv('MYSQL_BIN_PATH');
    if ($binDesdeEnv) {
      $binariosPosibles[] = rtrim($binDesdeEnv, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $nombre . $ext;
    }

    if (PHP_OS_FAMILY === 'Windows') {
      $binariosPosibles[] = 'C:\\xampp\\mysql\\bin\\' . $nombre . $ext;
      $binariosPosibles[] = 'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\' . $nombre . $ext;
    }

    $binariosPosibles[] = $nombre . $ext;

    foreach ($binariosPosibles as $ruta) {
      if (@is_file($ruta)) {
        return $ruta;
      }
    }

    $comandoBusqueda = PHP_OS_FAMILY === 'Windows' ? 'where' : 'command -v';
    $salida = [];
    $estado = 1;
    @exec($comandoBusqueda . ' ' . escapeshellarg($nombre), $salida, $estado);
    if ($estado === 0 && isset($salida[0]) && $salida[0] !== '') {
      return trim($salida[0]);
    }

    throw new Exception("No se encontró el binario requerido: {$nombre}");
  }

  protected function ejecutarComando(string $command): array
  {
    $salida = [];
    $codigo = 0;
    exec($command . ' 2>&1', $salida, $codigo);
    return [$codigo, $salida];
  }

  protected function asegurarExtensionSql(string $nombre): void
  {
    if (strtolower(pathinfo($nombre, PATHINFO_EXTENSION)) !== 'sql') {
      throw new Exception('El archivo debe tener extensión .sql.');
    }
  }

  protected function enmascararCredenciales(string $comando): string
  {
    return preg_replace('/--password=\S+/i', '--password=***', $comando);
  }
}
