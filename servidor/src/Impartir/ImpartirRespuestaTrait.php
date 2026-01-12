<?php

namespace Micodigo\Impartir;

use Micodigo\Utils\RespuestaJson;
use RuntimeException;

trait ImpartirRespuestaTrait
{
  protected function leerEntradaJson(): array
  {
    $contenido = file_get_contents('php://input');

    if ($contenido === false) {
      throw new RuntimeException('No se pudo leer la entrada de la solicitud.');
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
    if ($exito) {
      RespuestaJson::exito($datos, $mensaje, $codigoHttp);
      return;
    }

    RespuestaJson::error($mensaje, $codigoHttp, $errores);
  }
}
