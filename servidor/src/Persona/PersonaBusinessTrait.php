<?php

namespace Micodigo\Persona;

use DateTime;
use DateTimeInterface;
use PDO;

trait PersonaBusinessTrait
{
  /**
   * Calcular edad en años completos a partir de fecha de nacimiento (Y-m-d).
   */
  public function calcularEdad(?string $fecha_nacimiento, ?DateTimeInterface $referencia = null): ?int
  {
    if (empty($fecha_nacimiento)) return null;
    $dt = DateTime::createFromFormat('Y-m-d', $fecha_nacimiento);
    if (!$dt) return null;
    $referencia = $referencia ?? new DateTime();
    return (int) $dt->diff($referencia)->y;
  }

  /**
   * Validar edad según grado.
   * Reglas:
   *  - 1er grado: 5–6 años
   *  - Cada grado siguiente: edad mínima = anterior +1, edad máxima = anterior +2 (hasta 6to grado)
   * Devuelve true si válido o array ['edad' => ['Mensaje...']] si inválido.
   */
  public function validarEdadPorGrado(?string $fecha_nacimiento, int $grado, ?DateTimeInterface $referencia = null)
  {
    if ($grado < 1 || $grado > 6) {
      return ['grado' => ['Grado fuera de rango válido (1 a 6).']];
    }
    $edad = $this->calcularEdad($fecha_nacimiento, $referencia);
    if ($edad === null) {
      return ['fecha_nacimiento' => ['Fecha de nacimiento inválida.']];
    }

    $minimo = 5 + ($grado - 1);
    $recomendado = 6 + ($grado - 1);
    $maximo = 7 + ($grado - 1);

    if ($edad < $minimo || $edad > $maximo) {
      return ['edad' => [
        sprintf(
          'Edad (%d) fuera del rango permitido para %d° grado. Permitido: %d a %d años (recomendado %d).',
          $edad,
          $grado,
          $minimo,
          $maximo,
          $recomendado
        ),
      ]];
    }
    return true;
  }

  /**
   * Cambiar estado de persona validando lista permitida.
   * Retorna true si éxito o array ['estado' => ['Mensaje']] si inválido.
   */
  public static function cambiarEstado(PDO $pdo, int $id_persona, string $estado)
  {
    $permitidos = ['activo', 'inactivo', 'incompleto'];
    if (!in_array($estado, $permitidos, true)) {
      return ['estado' => ['Estado no permitido.']];
    }
    $stmt = $pdo->prepare('UPDATE personas SET estado = ? WHERE id_persona = ?');
    $ok = $stmt->execute([$estado, $id_persona]);
    return $ok ? true : ['estado' => ['No se pudo actualizar el estado.']];
  }
}
