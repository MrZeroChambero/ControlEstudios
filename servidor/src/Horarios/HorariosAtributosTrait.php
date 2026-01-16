<?php

namespace Micodigo\Horarios;

trait HorariosAtributosTrait
{
  protected ?int $id_horario = null;
  protected ?int $fk_aula = null;
  protected ?int $fk_momento = null;
  protected ?int $fk_componente = null;
  protected ?int $fk_personal = null;
  protected string $grupo = 'completo';
  protected ?string $dia_semana = null;
  protected ?float $hora_inicio = null;
  protected ?float $hora_fin = null;
  protected array $estudiantes = [];
  protected ?string $tipo_docente = null;
  protected ?string $codigo_bloque = null;
  protected array $errores = [];

  protected const GRUPOS_VALIDOS = ['completo', 'subgrupo'];
  protected const DIAS_VALIDOS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

  protected function asignarDatos(array $datos): void
  {
    if (array_key_exists('id_horario', $datos)) {
      $this->id_horario = $this->normalizarEntero($datos['id_horario']);
    }

    if (array_key_exists('fk_aula', $datos)) {
      $this->fk_aula = $this->normalizarEntero($datos['fk_aula']);
    }

    if (array_key_exists('fk_momento', $datos)) {
      $this->fk_momento = $this->normalizarEntero($datos['fk_momento']);
    }

    if (array_key_exists('fk_componente', $datos)) {
      $this->fk_componente = $this->normalizarEntero($datos['fk_componente']);
    }

    if (array_key_exists('fk_personal', $datos)) {
      $this->fk_personal = $this->normalizarEntero($datos['fk_personal']);
    }

    if (array_key_exists('grupo', $datos)) {
      $valorGrupo = strtolower(trim((string) $datos['grupo']));
      if (in_array($valorGrupo, self::GRUPOS_VALIDOS, true)) {
        $this->grupo = $valorGrupo;
      }
    }

    if (array_key_exists('dia_semana', $datos)) {
      $dia = strtolower(trim((string) $datos['dia_semana']));
      $this->dia_semana = in_array($dia, self::DIAS_VALIDOS, true) ? $dia : null;
    }

    if (array_key_exists('hora_inicio', $datos)) {
      $this->hora_inicio = $this->normalizarHoraDecimal($datos['hora_inicio']);
    }

    if (array_key_exists('hora_fin', $datos)) {
      $this->hora_fin = $this->normalizarHoraDecimal($datos['hora_fin']);
    }

    if (array_key_exists('estudiantes', $datos)) {
      $this->estudiantes = $this->normalizarArregloEnteros($datos['estudiantes']);
    }

    if (array_key_exists('tipo_docente', $datos)) {
      $tipo = strtolower(trim((string) $datos['tipo_docente']));
      $this->tipo_docente = $tipo !== '' ? $tipo : null;
    }
  }

  protected function normalizarEntero(mixed $valor): ?int
  {
    if ($valor === null || $valor === '') {
      return null;
    }

    if (is_numeric($valor)) {
      $entero = (int) $valor;
      return $entero > 0 ? $entero : null;
    }

    return null;
  }

  protected function normalizarHoraDecimal(mixed $valor): ?float
  {
    if ($valor === null || $valor === '') {
      return null;
    }

    if (is_numeric($valor)) {
      return round((float) $valor, 2);
    }

    if (is_string($valor)) {
      $valor = trim($valor);
      if ($valor === '') {
        return null;
      }

      if (preg_match('/^(\d{1,2}):(\d{2})$/', $valor, $coincidencias)) {
        $horas = (int) $coincidencias[1];
        $minutos = (int) $coincidencias[2];
        if ($minutos >= 0 && $minutos < 60) {
          return $horas + ($minutos / 60);
        }
      }
    }

    return null;
  }

  protected function normalizarArregloEnteros(mixed $valor): array
  {
    if (!is_array($valor)) {
      return [];
    }

    $resultado = [];
    foreach ($valor as $item) {
      $entero = $this->normalizarEntero($item);
      if ($entero !== null) {
        $resultado[$entero] = $entero;
      }
    }

    return array_values($resultado);
  }

  protected function establecerTipoDocente(?string $tipo): void
  {
    if ($tipo === null) {
      $this->tipo_docente = null;
      return;
    }

    $tipo = strtolower(trim($tipo));
    $this->tipo_docente = $tipo !== '' ? $tipo : null;
  }

  protected function obtenerDatosHorario(): array
  {
    return [
      'id_horario' => $this->id_horario,
      'fk_aula' => $this->fk_aula,
      'fk_momento' => $this->fk_momento,
      'fk_componente' => $this->fk_componente,
      'fk_personal' => $this->fk_personal,
      'grupo' => $this->grupo,
      'dia_semana' => $this->dia_semana,
      'hora_inicio' => $this->hora_inicio,
      'hora_fin' => $this->hora_fin,
      'estudiantes' => $this->estudiantes,
      'tipo_docente' => $this->tipo_docente,
      'codigo_bloque' => $this->codigo_bloque,
    ];
  }
}
