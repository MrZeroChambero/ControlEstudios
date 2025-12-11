<?php

namespace Micodigo\PreguntasSeguridad;

use PDO;

class PreguntasSeguridad
{
  use PreguntasSeguridadAtributosTrait;
  use PreguntasSeguridadValidacionesTrait;
  use PreguntasSeguridadConsultasTrait;
  use PreguntasSeguridadGestionTrait;

  public function validarPreguntas(array $preguntas): array
  {
    return $this->validarColeccionPreguntas($preguntas);
  }

  public function listarPorUsuario(PDO $conexion, int $usuarioId): array
  {
    return $this->obtenerPreguntasPorUsuario($conexion, $usuarioId);
  }

  public function reemplazarParaUsuario(PDO $conexion, int $usuarioId, array $preguntas): array
  {
    return $this->reemplazarPreguntas($conexion, $usuarioId, $preguntas);
  }

  public function tieneMinimoPreguntas(PDO $conexion, int $usuarioId, int $minimo = 3): bool
  {
    return $this->contarPreguntas($conexion, $usuarioId) >= $minimo;
  }

  public function obtenerPorNombreUsuario(PDO $conexion, string $nombreUsuario): ?array
  {
    $sql = "SELECT id_usuario, nombre_usuario, rol FROM usuarios WHERE nombre_usuario = ? AND estado = 'activo' LIMIT 1";
    $usuario = $this->ejecutarConsultaUnica($conexion, $sql, [$nombreUsuario]);
    if (!$usuario) {
      return null;
    }

    $preguntas = $this->obtenerPreguntasPorUsuario($conexion, (int) $usuario['id_usuario']);
    if (count($preguntas) < 3) {
      return null;
    }

    return [
      'usuario' => $usuario,
      'preguntas' => $preguntas,
    ];
  }

  public function obtenerPreguntaAleatoria(PDO $conexion, int $usuarioId): ?array
  {
    return $this->seleccionarPreguntaAleatoria($conexion, $usuarioId);
  }

  public function validarRespuesta(PDO $conexion, int $usuarioId, int $preguntaId, string $respuesta): bool
  {
    return $this->verificarRespuesta($conexion, $usuarioId, $preguntaId, $respuesta);
  }
}
