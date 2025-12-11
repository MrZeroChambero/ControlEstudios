<?php

namespace Micodigo\PreguntasSeguridad;

trait PreguntasSeguridadAtributosTrait
{
  protected ?int $id_pregunta = null;
  protected ?int $fk_usuario = null;
  protected ?string $pregunta = null;
  protected ?string $respuesta_hash = null;

  protected function normalizarPregunta(?string $valor): ?string
  {
    if ($valor === null) {
      return null;
    }

    $normalizado = preg_replace('/\s+/', ' ', trim($valor));
    return $normalizado === '' ? null : $normalizado;
  }

  protected function normalizarRespuesta(?string $valor): ?string
  {
    if ($valor === null) {
      return null;
    }

    $normalizado = preg_replace('/\s+/', ' ', trim($valor));
    return $normalizado === '' ? null : $normalizado;
  }

  protected function prepararEntradaPregunta(array $entrada): array
  {
    return [
      'id' => isset($entrada['id']) ? (int) $entrada['id'] : null,
      'pregunta' => $this->normalizarPregunta($entrada['pregunta'] ?? null),
      'respuesta' => $this->normalizarRespuesta($entrada['respuesta'] ?? null),
    ];
  }
}
