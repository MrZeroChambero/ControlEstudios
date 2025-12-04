<?php

namespace Micodigo\Competencias;

use RuntimeException;

trait CompetenciasRespuestaTrait
{
  protected function leerEntradaJson(): array
  {
    $contenido = file_get_contents('php://input');

    if ($contenido === false) {
      throw new RuntimeException('No fue posible leer la solicitud.');
    }

    $contenido = trim($contenido);
    if ($contenido === '') {
      return [];
    }

    $decodificado = json_decode($contenido, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
      throw new RuntimeException('JSON invalido: ' . json_last_error_msg());
    }

    return is_array($decodificado) ? $decodificado : [];
  }

  protected function enviarRespuestaJson(
    int $codigoHttp,
    bool $exito,
    string $mensaje,
    mixed $datos = null,
    ?array $errores = null
  ): void {
    http_response_code($codigoHttp);
    header('Content-Type: application/json; charset=utf-8');

    echo json_encode([
      'exito' => $exito,
      'mensaje' => $mensaje,
      'datos' => $datos,
      'errores' => $errores,
    ], JSON_UNESCAPED_UNICODE);
  }
}
