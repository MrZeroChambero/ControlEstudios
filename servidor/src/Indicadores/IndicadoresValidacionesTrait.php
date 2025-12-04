<?php

namespace Micodigo\Indicadores;

use PDO;
use Valitron\Validator;

trait IndicadoresValidacionesTrait
{
  protected function validarDatosIndicador(PDO $conexion, array $entrada, ?int $idIndicador = null): array
  {
    Validator::lang('es');

    $datos = [
      'fk_competencia' => $this->normalizarEntero($entrada['fk_competencia'] ?? null),
      'nombre_indicador' => $this->normalizarTexto($entrada['nombre_indicador'] ?? null, 255),
      'aspecto' => strtolower((string) ($entrada['aspecto'] ?? 'ser')),
      'orden' => $this->normalizarEntero($entrada['orden'] ?? null),
      'ocultar' => strtolower((string) ($entrada['ocultar'] ?? 'no')),
    ];

    if (!in_array($datos['aspecto'], ['ser', 'hacer', 'conocer', 'convivir'], true)) {
      $datos['aspecto'] = 'ser';
    }

    if (!in_array($datos['ocultar'], ['si', 'no'], true)) {
      $datos['ocultar'] = 'no';
    }

    $validador = new Validator($datos);
    $validador->labels([
      'fk_competencia' => 'competencia',
      'nombre_indicador' => 'nombre del indicador',
      'aspecto' => 'aspecto',
      'orden' => 'orden',
      'ocultar' => 'ocultar',
    ]);

    $validador->rule('required', ['fk_competencia', 'nombre_indicador', 'aspecto']);
    $validador->rule('integer', ['fk_competencia', 'orden']);
    $validador->rule('min', 'fk_competencia', 1);
    $validador->rule('min', 'orden', 1);
    $validador->rule('lengthBetween', 'nombre_indicador', 3, 255);
    $validador->rule('in', 'aspecto', ['ser', 'hacer', 'conocer', 'convivir']);
    $validador->rule('in', 'ocultar', ['si', 'no']);

    $errores = [];
    if (!$validador->validate()) {
      $errores = $validador->errors();
    }

    $competencia = null;
    if ($datos['fk_competencia'] === null) {
      $errores['fk_competencia'][] = 'Debe seleccionar una competencia valida.';
    } else {
      $competencia = $this->obtenerCompetenciaContexto($conexion, $datos['fk_competencia']);
      if ($competencia === null) {
        $errores['fk_competencia'][] = 'La competencia indicada no existe.';
      } else {
        if (($competencia['estado_componente'] ?? '') !== 'activo') {
          $errores['fk_competencia'][] = 'El componente asociado a la competencia esta inactivo.';
        }
        if (($competencia['estado_area'] ?? '') !== 'activo') {
          $errores['fk_competencia'][] = 'El area asociada a la competencia esta inactiva.';
        }
      }
    }

    if ($datos['fk_competencia'] !== null && $datos['orden'] !== null) {
      if ($this->existeIndicadorConOrden($conexion, $datos['fk_competencia'], $datos['orden'], $idIndicador)) {
        $errores['orden'][] = 'Ya existe un indicador con ese orden en la competencia seleccionada.';
      }
    }

    if ($datos['fk_competencia'] !== null && $datos['nombre_indicador'] !== null) {
      if ($this->existeIndicadorConNombre($conexion, $datos['fk_competencia'], $datos['nombre_indicador'], $idIndicador)) {
        $errores['nombre_indicador'][] = 'Ya existe un indicador con ese nombre en la competencia seleccionada.';
      }
    }

    if ($datos['orden'] === null) {
      // Si no se proporciono, asignar orden consecutivo
      $sql = 'SELECT COALESCE(MAX(orden), 0) + 1 FROM indicadores WHERE fk_competencia = ?';
      if ($datos['fk_competencia'] !== null) {
        $sentencia = $conexion->prepare($sql);
        $sentencia->execute([$datos['fk_competencia']]);
        $datos['orden'] = (int) $sentencia->fetchColumn();
      } else {
        $datos['orden'] = 1;
      }
    }

    return [
      'datos' => $datos,
      'errores' => $errores,
      'competencia' => $competencia,
    ];
  }
}
