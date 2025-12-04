<?php

namespace Micodigo\Competencias;

use PDO;
use Valitron\Validator;

trait CompetenciasValidacionesTrait
{
  protected function validarDatosCompetencia(PDO $conexion, array $entrada, ?int $idCompetencia = null): array
  {
    Validator::lang('es');

    $datos = [
      'fk_componente' => $this->normalizarEntero($entrada['fk_componente'] ?? null),
      'nombre_competencia' => $this->normalizarTexto($entrada['nombre_competencia'] ?? null, 150),
      'descripcion_competencia' => $this->normalizarTexto($entrada['descripcion_competencia'] ?? null, 255),
      'reutilizable' => strtolower((string) ($entrada['reutilizable'] ?? 'si')),
    ];

    if (!in_array($datos['reutilizable'], ['si', 'no'], true)) {
      $datos['reutilizable'] = 'si';
    }

    $validador = new Validator($datos);
    $validador->labels([
      'fk_componente' => 'componente',
      'nombre_competencia' => 'nombre de la competencia',
      'descripcion_competencia' => 'descripcion de la competencia',
      'reutilizable' => 'reutilizable',
    ]);

    $validador->rule('required', ['fk_componente', 'nombre_competencia', 'descripcion_competencia']);
    $validador->rule('integer', 'fk_componente');
    $validador->rule('min', 'fk_componente', 1);
    $validador->rule('lengthBetween', 'nombre_competencia', 3, 150);
    $validador->rule('lengthBetween', 'descripcion_competencia', 3, 255);
    $validador->rule('in', 'reutilizable', ['si', 'no']);

    $errores = [];
    if (!$validador->validate()) {
      $errores = $validador->errors();
    }

    $componente = null;
    if ($datos['fk_componente'] === null) {
      $errores['fk_componente'][] = 'Debe seleccionar un componente valido.';
    } else {
      $componente = $this->obtenerComponenteConArea($conexion, $datos['fk_componente']);
      if ($componente === null) {
        $errores['fk_componente'][] = 'El componente seleccionado no existe.';
      } else {
        if (($componente['estado_componente'] ?? '') !== 'activo') {
          $errores['fk_componente'][] = 'El componente seleccionado esta inactivo.';
        }
        if (($componente['estado_area'] ?? '') !== 'activo') {
          $errores['fk_componente'][] = 'El area asociada al componente esta inactiva.';
        }
      }
    }

    if (empty($errores['nombre_competencia']) && $datos['fk_componente'] !== null && $datos['nombre_competencia'] !== null) {
      if ($this->existeCompetenciaConNombre($conexion, $datos['fk_componente'], $datos['nombre_competencia'], $idCompetencia)) {
        $errores['nombre_competencia'][] = 'Ya existe una competencia con ese nombre para el componente seleccionado.';
      }
    }

    return [
      'datos' => $datos,
      'errores' => $errores,
      'componente' => $componente,
    ];
  }
}
