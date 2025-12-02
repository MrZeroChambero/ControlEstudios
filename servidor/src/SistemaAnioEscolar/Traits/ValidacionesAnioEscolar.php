<?php

namespace Micodigo\SistemaAnioEscolar\Traits;

use DateInterval;
use DateTime;
use Exception;
use PDO;
use Valitron\Validator;

trait ValidacionesAnioEscolar
{
  protected function normalizarFecha(?string $valor): ?string
  {
    if ($valor === null || $valor === '') {
      return null;
    }

    $formatos = ['Y-m-d', 'd/m/Y'];
    foreach ($formatos as $formato) {
      $dt = DateTime::createFromFormat($formato, $valor);
      if ($dt instanceof DateTime) {
        return $dt->format('Y-m-d');
      }
    }

    return null;
  }

  protected function obtenerFechasPredeterminadas(int $anioBase): array
  {
    $inicio = new DateTime(sprintf('%04d-09-01', $anioBase));
    $fin = new DateTime(sprintf('%04d-07-20', $anioBase + 1));
    $limite = clone $inicio;

    return [
      'inicio' => $inicio,
      'fin' => $fin,
      'limite' => $limite,
    ];
  }

  protected function diferenciaDias(DateTime $a, DateTime $b): int
  {
    return (int) $a->diff($b)->days;
  }

  protected function validarDatosAnio(array $input, bool $esActualizacion = false, ?int $anioId = null): array
  {
    Validator::lang('es');

    $datos = [
      'fecha_inicio' => $this->normalizarFecha($input['fecha_inicio'] ?? null),
      'fecha_final' => $this->normalizarFecha($input['fecha_final'] ?? null),
      'fecha_limite_inscripcion' => $this->normalizarFecha($input['fecha_limite_inscripcion'] ?? null),
      'estado' => $input['estado'] ?? ($esActualizacion ? null : 'incompleto'),
    ];

    $validator = new Validator($datos);
    $validator->rule('required', ['fecha_inicio', 'fecha_final', 'fecha_limite_inscripcion']);
    $validator->rule('date', ['fecha_inicio', 'fecha_final', 'fecha_limite_inscripcion']);

    $errores = [];
    if (!$validator->validate()) {
      $errores = array_merge($errores, $validator->errors());
    }

    if ($datos['fecha_inicio'] === null || $datos['fecha_final'] === null) {
      return [
        'valido' => false,
        'errores' => $errores ?: ['fechas' => ['Fechas inválidas.']],
        'datos' => $datos,
        'predeterminadas' => null,
      ];
    }

    $inicio = new DateTime($datos['fecha_inicio']);
    $fin = new DateTime($datos['fecha_final']);

    if ($inicio > $fin) {
      $errores['rango'][] = 'La fecha de inicio debe ser anterior a la fecha final.';
    }

    $anioBase = (int) $inicio->format('Y');
    $predeterminadas = $this->obtenerFechasPredeterminadas($anioBase);
    $maxDesviacion = 7;

    if ($this->diferenciaDias($inicio, $predeterminadas['inicio']) > $maxDesviacion) {
      $errores['fecha_inicio'][] = 'La fecha de inicio solo puede ajustarse ±7 días de la predeterminada (01/09).';
    }

    if ($this->diferenciaDias($fin, $predeterminadas['fin']) > $maxDesviacion) {
      $errores['fecha_final'][] = 'La fecha de finalización solo puede ajustarse ±7 días de la predeterminada (20/07).';
    }

    if ($datos['fecha_limite_inscripcion'] !== null) {
      $limite = new DateTime($datos['fecha_limite_inscripcion']);
      if ($limite > $inicio) {
        $errores['fecha_limite_inscripcion'][] = 'La fecha límite de inscripción debe ser menor o igual a la fecha de inicio.';
      }

      $limiteMinimo = (clone $predeterminadas['inicio'])->sub(new DateInterval('P7D'));
      if ($limite < $limiteMinimo) {
        $errores['fecha_limite_inscripcion'][] = 'La fecha límite de inscripción no puede ajustarse más de 7 días antes de la fecha de inicio predeterminada.';
      }
    }

    if ($this->verificarSolapamientoAnios($inicio->format('Y-m-d'), $fin->format('Y-m-d'), $anioId)) {
      $errores['solapamiento'][] = 'Las fechas se superponen con otro año escolar registrado.';
    }

    return [
      'valido' => empty($errores),
      'errores' => $errores,
      'datos' => [
        'fecha_inicio' => $inicio->format('Y-m-d'),
        'fecha_final' => $fin->format('Y-m-d'),
        'fecha_limite_inscripcion' => $datos['fecha_limite_inscripcion'] ?? $inicio->format('Y-m-d'),
        'estado' => $datos['estado'] ?? 'incompleto',
        'anio_base' => $anioBase,
      ],
      'predeterminadas' => [
        'inicio' => $predeterminadas['inicio']->format('Y-m-d'),
        'fin' => $predeterminadas['fin']->format('Y-m-d'),
        'limite' => $predeterminadas['limite']->format('Y-m-d'),
      ],
    ];
  }

  protected function verificarSolapamientoAnios(string $inicio, string $fin, ?int $ignorarId = null): bool
  {
    $sql = 'SELECT COUNT(*) FROM anios_escolares WHERE NOT (fecha_fin < :inicio OR fecha_inicio > :fin)';
    $params = [
      ':inicio' => $inicio,
      ':fin' => $fin,
    ];

    if ($ignorarId !== null) {
      $sql .= ' AND id_anio_escolar <> :id';
      $params[':id'] = $ignorarId;
    }

    $stmt = $this->pdo->prepare($sql);
    $stmt->execute($params);
    return (int) $stmt->fetchColumn() > 0;
  }
}
