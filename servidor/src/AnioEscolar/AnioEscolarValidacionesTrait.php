<?php

namespace Micodigo\AnioEscolar;

use DateInterval;
use DateTime;
use PDO;
use Valitron\Validator;

trait AnioEscolarValidacionesTrait
{
  protected function normalizarFecha(?string $valor): ?string
  {
    if ($valor === null || $valor === '') {
      return null;
    }

    $formatos = ['Y-m-d', 'd/m/Y'];
    foreach ($formatos as $formato) {
      $fecha = DateTime::createFromFormat($formato, $valor);
      if ($fecha instanceof DateTime) {
        return $fecha->format('Y-m-d');
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

  protected function validarDatosAnio(PDO $conexion, array $entrada, bool $esActualizacion = false, ?int $anioId = null): array
  {
    Validator::lang('es');

    $datos = [
      'fecha_inicio' => $this->normalizarFecha($entrada['fecha_inicio'] ?? null),
      'fecha_fin' => $this->normalizarFecha($entrada['fecha_fin'] ?? null),
      'fecha_limite_inscripcion' => $this->normalizarFecha($entrada['fecha_limite_inscripcion'] ?? $entrada['limite_inscripcion'] ?? null),
      'estado' => $this->normalizarEstado($entrada['estado'] ?? ($esActualizacion ? 'incompleto' : 'incompleto')),
    ];

    $validador = new Validator($datos);
    $validador->labels([
      'fecha_inicio' => 'fecha de inicio',
      'fecha_fin' => 'fecha de finalización',
      'fecha_limite_inscripcion' => 'fecha límite de inscripción',
      'estado' => 'estado del año escolar',
    ]);

    $validador->rule('required', ['fecha_inicio', 'fecha_fin']);
    $validador->rule('date', ['fecha_inicio', 'fecha_fin']);
    $validador->rule('in', 'estado', self::ESTADOS_VALIDOS);

    $errores = [];
    if (!$validador->validate()) {
      $errores = array_merge($errores, $validador->errors());
    }

    if ($datos['fecha_inicio'] === null || $datos['fecha_fin'] === null) {
      return [
        'valido' => false,
        'errores' => $errores ?: ['fechas' => ['Las fechas indicadas no son válidas.']],
        'datos' => $datos,
        'predeterminadas' => null,
      ];
    }

    $inicio = new DateTime($datos['fecha_inicio']);
    $fin = new DateTime($datos['fecha_fin']);

    if ($inicio > $fin) {
      $errores['rango'][] = 'La fecha de inicio debe ser anterior a la fecha de finalización.';
    }

    $anioBase = (int) $inicio->format('Y');
    $predeterminadas = $this->obtenerFechasPredeterminadas($anioBase);
    $maximoDesviacion = 7;

    if ($this->diferenciaDias($inicio, $predeterminadas['inicio']) > $maximoDesviacion) {
      $errores['fecha_inicio'][] = 'La fecha de inicio solo puede ajustarse ±7 días de la fecha sugerida (01/09).';
    }

    if ($this->diferenciaDias($fin, $predeterminadas['fin']) > $maximoDesviacion) {
      $errores['fecha_fin'][] = 'La fecha de finalización solo puede ajustarse ±7 días de la fecha sugerida (20/07).';
    }

    if ($datos['fecha_limite_inscripcion'] !== null) {
      $limite = new DateTime($datos['fecha_limite_inscripcion']);
      if ($limite > $inicio) {
        $errores['fecha_limite_inscripcion'][] = 'La fecha límite de inscripción debe ser menor o igual a la fecha de inicio.';
      }

      $limiteMinimo = (clone $predeterminadas['inicio'])->sub(new DateInterval('P7D'));
      if ($limite < $limiteMinimo) {
        $errores['fecha_limite_inscripcion'][] = 'La fecha límite de inscripción no puede ajustarse más de 7 días antes de la fecha sugerida.';
      }
    }

    if ($this->verificarSolapamientoAnios($conexion, $inicio->format('Y-m-d'), $fin->format('Y-m-d'), $anioId)) {
      $errores['solapamiento'][] = 'Las fechas se superponen con otro año escolar registrado.';
    }

    $fechaLimite = $datos['fecha_limite_inscripcion'] ?? $inicio->format('Y-m-d');

    return [
      'valido' => empty($errores),
      'errores' => $errores,
      'datos' => [
        'fecha_inicio' => $inicio->format('Y-m-d'),
        'fecha_fin' => $fin->format('Y-m-d'),
        'fecha_limite_inscripcion' => $fechaLimite,
        'estado' => $datos['estado'],
        'anio_base' => $anioBase,
      ],
      'predeterminadas' => [
        'inicio' => $predeterminadas['inicio']->format('Y-m-d'),
        'fin' => $predeterminadas['fin']->format('Y-m-d'),
        'limite' => $predeterminadas['limite']->format('Y-m-d'),
      ],
    ];
  }

  protected function verificarSolapamientoAnios(PDO $conexion, string $inicio, string $fin, ?int $ignorarId = null): bool
  {
    $sql = 'SELECT COUNT(*) FROM anios_escolares WHERE NOT (fecha_fin < :inicio OR fecha_inicio > :fin)';
    $parametros = [
      ':inicio' => $inicio,
      ':fin' => $fin,
    ];

    if ($ignorarId !== null) {
      $sql .= ' AND id_anio_escolar <> :id';
      $parametros[':id'] = $ignorarId;
    }

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute($parametros);
    return (int) $sentencia->fetchColumn() > 0;
  }

  protected function calcularSemanaSanta(int $anio): DateTime
  {
    $a = $anio % 19;
    $b = intdiv($anio, 100);
    $c = $anio % 100;
    $d = intdiv($b, 4);
    $e = $b % 4;
    $f = intdiv($b + 8, 25);
    $g = intdiv($b - $f + 1, 3);
    $h = (19 * $a + $b - $d - $g + 15) % 30;
    $i = intdiv($c, 4);
    $k = $c % 4;
    $l = (32 + 2 * $e + 2 * $i - $h - $k) % 7;
    $m = intdiv($a + 11 * $h + 22 * $l, 451);
    $mes = intdiv($h + $l - 7 * $m + 114, 31);
    $dia = (($h + $l - 7 * $m + 114) % 31) + 1;

    return new DateTime(sprintf('%04d-%02d-%02d', $anio, $mes, $dia));
  }
}
