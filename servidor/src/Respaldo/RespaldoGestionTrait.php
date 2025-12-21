<?php

namespace Micodigo\Respaldo;

use Exception;

trait RespaldoGestionTrait
{
  public function crearRespaldo(int $usuarioId): array
  {
    $this->asegurarDirectorio();
    @set_time_limit(300);

    $nombre = $this->generarNombreArchivo();
    $rutaSalida = $this->obtenerRutaArchivo($nombre);

    $binario = $this->resolverBinario('mysqldump');

    $partes = [
      $this->envolverRutaParaShell($binario),
      '--host=' . $this->host,
      '--user=' . $this->usuario,
      $this->contrasena !== '' ? '--password=' . $this->contrasena : null,
      '--routines',
      '--events',
      '--single-transaction',
      '--quick',
      '--skip-lock-tables',
      '--result-file=' . $this->envolverRutaParaShell($rutaSalida),
      '--databases',
      $this->baseDatos,
      '--ignore-table=' . $this->baseDatos . '.respaldos',
    ];

    $comando = implode(' ', array_filter($partes));
    [$codigo, $salida] = $this->ejecutarComando($comando);

    if ($codigo !== 0 || !is_file($rutaSalida)) {
      @unlink($rutaSalida);
      $mensaje = implode(' ', $salida) ?: 'mysqldump no devolvió información adicional.';
      $detalle = sprintf(
        'Código: %d. Comando: %s',
        $codigo,
        $this->enmascararCredenciales($comando)
      );
      error_log('[Respaldo] Falló mysqldump: ' . $this->enmascararCredenciales($comando) . ' · Salida: ' . $mensaje);
      throw new Exception('No se pudo generar el respaldo: ' . trim($mensaje . ' ' . $detalle));
    }

    $tamano = filesize($rutaSalida) ?: 0;
    $timestamp = filemtime($rutaSalida) ?: time();

    $registroBD = null;
    try {
      $registroBD = $this->registrarRespaldoBD($nombre, $usuarioId, $timestamp);
    } catch (\Throwable $registroError) {
      error_log('[Respaldo] No se pudo registrar el respaldo generado en la base de datos: ' . $registroError->getMessage());
    }

    $creadorNombre = $registroBD['nombre_usuario'] ?? null;
    if ($registroBD && $creadorNombre === null) {
      $creadorNombre = 'Usuario eliminado';
    }

    return [
      'nombre' => $nombre,
      'ruta' => $rutaSalida,
      'tamano_bytes' => $tamano,
      'tamano_legible' => $this->formatearTamano($tamano),
      'timestamp' => $timestamp,
      'fecha' => $this->formatearFechaHumana($timestamp),
      'creador_id' => $registroBD['fk_usuario'] ?? $usuarioId,
      'creador' => $creadorNombre ?? 'Sistema',
      'fecha_registro' => $registroBD['fecha'] ?? $this->formatearFechaParaBD($timestamp),
      'disponible' => true,
    ];
  }

  public function restaurarDesdeNombre(string $nombre): array
  {
    $this->validarNombreArchivo($nombre);
    $ruta = $this->obtenerRutaArchivo($nombre);

    if (!is_file($ruta)) {
      throw new Exception('El respaldo solicitado no existe en el servidor.');
    }

    $this->restaurarDesdeRuta($ruta);

    $tamano = filesize($ruta) ?: 0;
    $timestamp = filemtime($ruta) ?: time();

    return [
      'nombre' => $nombre,
      'tamano_bytes' => $tamano,
      'tamano_legible' => $this->formatearTamano($tamano),
      'timestamp' => $timestamp,
      'fecha' => $this->formatearFechaHumana($timestamp),
    ];
  }

  public function restaurarDesdeCarga(array $archivo): array
  {
    $this->validarCarga($archivo);
    $this->asegurarDirectorio();
    @set_time_limit(300);

    $nombreDestino = $this->generarNombreArchivo();
    $rutaDestino = $this->obtenerRutaArchivo($nombreDestino);

    $indice = 1;
    while (is_file($rutaDestino)) {
      $nombreDestino = $this->ajustarNombreUnico($nombreDestino, $indice++);
      $rutaDestino = $this->obtenerRutaArchivo($nombreDestino);
    }

    if (!move_uploaded_file($archivo['tmp_name'], $rutaDestino)) {
      throw new Exception('No se pudo guardar el archivo subido.');
    }

    try {
      $this->restaurarDesdeRuta($rutaDestino);
    } catch (Exception $ex) {
      @unlink($rutaDestino);
      throw $ex;
    }

    $tamano = filesize($rutaDestino) ?: 0;
    $timestamp = filemtime($rutaDestino) ?: time();

    return [
      'nombre' => $nombreDestino,
      'tamano_bytes' => $tamano,
      'tamano_legible' => $this->formatearTamano($tamano),
      'timestamp' => $timestamp,
      'fecha' => $this->formatearFechaHumana($timestamp),
    ];
  }

  protected function restaurarDesdeRuta(string $ruta): void
  {
    if (!is_file($ruta)) {
      throw new Exception('El archivo de respaldo indicado no existe.');
    }

    $binario = $this->resolverBinario('mysql');

    $partes = [
      $this->envolverRutaParaShell($binario),
      '--host=' . $this->host,
      '--user=' . $this->usuario,
      $this->contrasena !== '' ? '--password=' . $this->contrasena : null,
      '--database=' . $this->baseDatos,
    ];

    $comando = implode(' ', array_filter($partes)) . ' < ' . $this->envolverRutaParaShell($ruta);
    [$codigo, $salida] = $this->ejecutarComando($comando);

    if ($codigo !== 0) {
      $mensaje = implode(' ', $salida) ?: 'mysql no devolvió información adicional.';
      $detalle = sprintf(
        'Código: %d. Comando: %s',
        $codigo,
        $this->enmascararCredenciales($comando)
      );
      error_log('[Respaldo] Falló mysql: ' . $this->enmascararCredenciales($comando) . ' · Salida: ' . $mensaje);
      throw new Exception('No se pudo restaurar la base de datos: ' . trim($mensaje . ' ' . $detalle));
    }
  }

  protected function ajustarNombreUnico(string $nombreBase, int $indice): string
  {
    $sinExtension = preg_replace('/\.sql$/i', '', $nombreBase);
    return sprintf('%s-%d.sql', $sinExtension, $indice);
  }

  public function rutaRespaldo(string $nombre): string
  {
    $this->validarNombreArchivo($nombre);
    return $this->obtenerRutaArchivo($nombre);
  }
}
