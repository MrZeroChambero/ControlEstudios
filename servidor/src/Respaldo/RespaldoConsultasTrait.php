<?php

namespace Micodigo\Respaldo;

use DirectoryIterator;

trait RespaldoConsultasTrait
{
  public function listarRespaldos(?int $usuarioId = null): array
  {
    $this->asegurarDirectorio();

    $registrosBD = [];
    try {
      $registrosBD = $this->obtenerRegistrosBD();
    } catch (\Throwable $excepcion) {
      error_log('[Respaldo] No se pudo consultar la tabla de respaldos: ' . $excepcion->getMessage());
      $registrosBD = [];
    }

    $mapaRegistros = [];
    foreach ($registrosBD as $registro) {
      if (!isset($registro['direccion'])) {
        continue;
      }
      $mapaRegistros[$registro['direccion']] = $registro;
    }

    $listado = [];
    $archivosProcesados = [];
    foreach (new DirectoryIterator($this->directorioRespaldos) as $elemento) {
      if ($elemento->isDot() || !$elemento->isFile()) {
        continue;
      }

      if (strtolower($elemento->getExtension()) !== 'sql') {
        continue;
      }

      $nombre = $elemento->getFilename();
      $ruta = $elemento->getPathname();
      $timestamp = $elemento->getMTime();
      $tamano = $elemento->getSize();

      if (!isset($mapaRegistros[$nombre]) && $usuarioId !== null) {
        try {
          $mapaRegistros[$nombre] = $this->registrarRespaldoBD($nombre, $usuarioId, $timestamp);
        } catch (\Throwable $registroError) {
          error_log('[Respaldo] No se pudo registrar el respaldo en BD: ' . $registroError->getMessage());
        }
      }

      $registroBD = $mapaRegistros[$nombre] ?? null;
      $creadorNombre = $registroBD['nombre_usuario'] ?? null;
      if ($registroBD && $creadorNombre === null) {
        $creadorNombre = 'Usuario eliminado';
      }

      $fechaRegistro = $registroBD['fecha'] ?? $this->formatearFechaParaBD($timestamp);

      $listado[] = [
        'nombre' => $nombre,
        'ruta' => $ruta,
        'tamano_bytes' => $tamano,
        'tamano_legible' => $this->formatearTamano($tamano),
        'timestamp' => $timestamp,
        'fecha' => $this->formatearFechaHumana($timestamp),
        'creador_id' => $registroBD['fk_usuario'] ?? null,
        'creador' => $creadorNombre ?? 'Sistema',
        'fecha_registro' => $fechaRegistro,
        'disponible' => true,
      ];

      $archivosProcesados[$nombre] = true;
    }

    foreach ($mapaRegistros as $nombre => $registroBD) {
      if (isset($archivosProcesados[$nombre])) {
        continue;
      }

      $creadorNombre = $registroBD['nombre_usuario'] ?? 'Usuario eliminado';
      $timestampRegistro = null;
      if (!empty($registroBD['fecha'])) {
        $tmp = strtotime($registroBD['fecha'] . ' 00:00:00');
        if ($tmp !== false) {
          $timestampRegistro = $tmp;
        }
      }

      $listado[] = [
        'nombre' => $nombre,
        'ruta' => $this->obtenerRutaArchivo($nombre),
        'tamano_bytes' => 0,
        'tamano_legible' => '0 B',
        'timestamp' => $timestampRegistro,
        'fecha' => $timestampRegistro ? $this->formatearFechaHumana($timestampRegistro) : null,
        'creador_id' => $registroBD['fk_usuario'] ?? null,
        'creador' => $creadorNombre,
        'fecha_registro' => $registroBD['fecha'] ?? null,
        'disponible' => false,
      ];
    }

    usort($listado, static function (array $a, array $b) {
      $tsA = $a['timestamp'] ?? 0;
      $tsB = $b['timestamp'] ?? 0;
      if ($tsA === $tsB) {
        return strcmp($b['nombre'] ?? '', $a['nombre'] ?? '');
      }
      return $tsB <=> $tsA;
    });

    return $listado;
  }
}
