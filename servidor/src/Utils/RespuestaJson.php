<?php

namespace Micodigo\Utils;

use Exception;

class RespuestaJson
{
  private static bool $bufferActivo = false;

  public static function exito(
    $data = null,
    $message = 'Operacion exitosa.',
    $status = 200,
    array $extra = []
  ): void {
    self::enviar(true, $message, $status, $data, null, null, $extra);
  }

  public static function error(
    $message,
    $status = 500,
    $errors = null,
    $errorDetails = null,
    array $extra = []
  ): void {
    $detalle = $errorDetails instanceof Exception ? $errorDetails->getMessage() : $errorDetails;
    self::enviar(false, $message, $status, null, $errors, $detalle, $extra);
  }

  public static function enviar(
    $back,
    $message,
    $status = 200,
    $data = null,
    $errors = null,
    $errorDetails = null,
    array $extra = []
  ): void {
    http_response_code($status);
    header('Content-Type: application/json');

    $payload = [
      'back' => (bool) $back,
      'data' => $data,
      'message' => $message,
    ];

    if ($errors !== null) {
      $payload['errors'] = $errors;
    }

    if ($errorDetails !== null) {
      $payload['error_details'] = $errorDetails;
    }

    foreach ($extra as $clave => $valor) {
      $payload[$clave] = $valor;
    }

    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
  }

  public static function habilitarBuffer(): void
  {
    if (self::$bufferActivo) {
      return;
    }
    ob_start([self::class, 'normalizarBuffer']);
    self::$bufferActivo = true;
  }

  public static function normalizarBuffer(string $salida): string
  {
    $contenido = trim($salida);
    if ($contenido === '') {
      return $salida;
    }

    $decodificado = json_decode($contenido, true);
    if (!is_array($decodificado)) {
      return $salida;
    }

    $normalizado = self::normalizarArreglo($decodificado);
    return json_encode($normalizado, JSON_UNESCAPED_UNICODE);
  }

  public static function normalizarArreglo(array $payload): array
  {
    $back = null;
    if (array_key_exists('back', $payload)) {
      $back = (bool) $payload['back'];
    } elseif (array_key_exists('success', $payload)) {
      $back = (bool) $payload['success'];
    } elseif (array_key_exists('exito', $payload)) {
      $back = (bool) $payload['exito'];
    } elseif (array_key_exists('estado', $payload)) {
      $back = in_array($payload['estado'], ['exito', 'success', 'ok'], true);
    } elseif (array_key_exists('status', $payload)) {
      $back = in_array($payload['status'], ['success', 'ok'], true);
    }

    $mensaje = $payload['message']
      ?? $payload['msg']
      ?? $payload['mensaje']
      ?? ($back ? 'Operacion completada.' : 'Operacion procesada con incidencias.');

    $data = $payload['data']
      ?? $payload['datos']
      ?? null;

    $errors = $payload['errors']
      ?? $payload['errores']
      ?? null;

    $errorDetails = $payload['error_details']
      ?? $payload['detalle']
      ?? $payload['details']
      ?? $payload['error']
      ?? null;

    if ($back === null) {
      $back = $errorDetails === null && $errors === null;
    }

    $normalizado = [
      'back' => (bool) $back,
      'data' => $data,
      'message' => $mensaje,
    ];

    if ($errors !== null) {
      $normalizado['errors'] = $errors;
    }

    if ($errorDetails !== null) {
      $normalizado['error_details'] = $errorDetails;
    }

    $clavesIgnoradas = [
      'back',
      'data',
      'datos',
      'message',
      'mensaje',
      'errors',
      'errores',
      'error_details',
      'detalle',
    ];

    foreach ($payload as $clave => $valor) {
      if (in_array($clave, $clavesIgnoradas, true)) {
        continue;
      }
      $normalizado[$clave] = $valor;
    }

    return $normalizado;
  }
}
