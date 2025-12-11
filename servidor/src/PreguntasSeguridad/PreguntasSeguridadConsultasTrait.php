<?php

namespace Micodigo\PreguntasSeguridad;

use PDO;

trait PreguntasSeguridadConsultasTrait
{
  use OperacionesBDTrait;

  public function obtenerPreguntasPorUsuario(PDO $conexion, int $usuarioId): array
  {
    $sql = 'SELECT id_preguntas AS id, pregunta FROM preguntas WHERE fk_usuario = ? ORDER BY id_preguntas';
    return $this->ejecutarConsulta($conexion, $sql, [$usuarioId]);
  }

  protected function obtenerPreguntasConHash(PDO $conexion, int $usuarioId): array
  {
    $sql = 'SELECT id_preguntas AS id, pregunta, respuesta FROM preguntas WHERE fk_usuario = ? ORDER BY id_preguntas';
    return $this->ejecutarConsulta($conexion, $sql, [$usuarioId]);
  }

  protected function obtenerPreguntaConHash(PDO $conexion, int $usuarioId, int $preguntaId): ?array
  {
    $sql = 'SELECT id_preguntas AS id, pregunta, respuesta FROM preguntas WHERE fk_usuario = ? AND id_preguntas = ? LIMIT 1';
    return $this->ejecutarConsultaUnica($conexion, $sql, [$usuarioId, $preguntaId]);
  }

  protected function eliminarPreguntasPorUsuario(PDO $conexion, int $usuarioId): bool
  {
    $sql = 'DELETE FROM preguntas WHERE fk_usuario = ?';
    return $this->ejecutarAccion($conexion, $sql, [$usuarioId]);
  }

  protected function contarPreguntas(PDO $conexion, int $usuarioId): int
  {
    $sql = 'SELECT COUNT(*) FROM preguntas WHERE fk_usuario = ?';
    return (int) $this->ejecutarValor($conexion, $sql, [$usuarioId]);
  }

  protected function seleccionarPreguntaAleatoria(PDO $conexion, int $usuarioId): ?array
  {
    $sql = 'SELECT id_preguntas AS id, pregunta FROM preguntas WHERE fk_usuario = ? ORDER BY RAND() LIMIT 1';
    return $this->ejecutarConsultaUnica($conexion, $sql, [$usuarioId]);
  }
}
