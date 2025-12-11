<?php

namespace Micodigo\PreguntasSeguridad;

use PDO;
use Exception;

trait PreguntasSeguridadGestionTrait
{
  public function reemplazarPreguntas(PDO $conexion, int $usuarioId, array $preguntas): array
  {
    $errores = $this->validarColeccionPreguntas($preguntas);
    if (!empty($errores)) {
      throw new Exception(json_encode(['type' => 'validacion', 'errors' => $errores], JSON_UNESCAPED_UNICODE));
    }

    $manejaTransaccion = false;
    if (!$conexion->inTransaction()) {
      $conexion->beginTransaction();
      $manejaTransaccion = true;
    }
    try {
      $conexion->prepare('DELETE FROM preguntas WHERE fk_usuario = ?')->execute([$usuarioId]);

      $insertSql = 'INSERT INTO preguntas (fk_usuario, pregunta, respuesta) VALUES (?, ?, ?)';
      $insertStmt = $conexion->prepare($insertSql);

      foreach ($preguntas as $entrada) {
        $datos = $this->prepararEntradaPregunta((array) $entrada);
        $respuestaHash = password_hash((string) $datos['respuesta'], PASSWORD_DEFAULT);
        $insertStmt->execute([$usuarioId, $datos['pregunta'], $respuestaHash]);
      }

      if ($manejaTransaccion) {
        $conexion->commit();
      }
      return $this->obtenerPreguntasPorUsuario($conexion, $usuarioId);
    } catch (Exception $e) {
      if ($manejaTransaccion && $conexion->inTransaction()) {
        $conexion->rollBack();
      }
      throw new Exception('Error al guardar las preguntas de seguridad: ' . $e->getMessage(), 0, $e);
    }
  }

  public function verificarRespuesta(PDO $conexion, int $usuarioId, int $preguntaId, string $respuesta): bool
  {
    $registro = $this->obtenerPreguntaConHash($conexion, $usuarioId, $preguntaId);
    if (!$registro) {
      return false;
    }

    return password_verify($respuesta, $registro['respuesta']);
  }
}
