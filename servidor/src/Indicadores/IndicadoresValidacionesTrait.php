<?php

namespace Micodigo\Indicadores;

use PDO;
use Valitron\Validator;

trait IndicadoresValidacionesTrait
{
  protected function validarDatosIndicador(PDO $conexion, array $entrada, ?int $idIndicador = null): array
  {
    Validator::lang('es');

    $ordenNormalizado = $this->normalizarEntero($entrada['orden'] ?? null);
    if ($ordenNormalizado !== null && $ordenNormalizado <= 0) {
      $ordenNormalizado = null;
    }

    $datos = [
      'fk_competencia' => $this->normalizarEntero($entrada['fk_competencia'] ?? null),
      'nombre_indicador' => $this->normalizarTexto($entrada['nombre_indicador'] ?? null, 255),
      'aspecto' => strtolower((string) ($entrada['aspecto'] ?? 'ser')),
      'orden' => $ordenNormalizado,
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
    $validador->rule('integer', 'fk_competencia');
    if ($datos['orden'] !== null) {
      $validador->rule('integer', 'orden');
      $validador->rule('min', 'orden', 1);
      $validador->rule('max', 'orden', 999);
    }
    $validador->rule('min', 'fk_competencia', 1);
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

    if ($datos['fk_competencia'] !== null) {
      if ($datos['orden'] === null) {
        $sql = 'SELECT COALESCE(MAX(orden), 0) + 1 FROM indicadores WHERE fk_competencia = ?';
        $sentencia = $conexion->prepare($sql);
        $sentencia->execute([$datos['fk_competencia']]);
        $datos['orden'] = (int) $sentencia->fetchColumn();
      }

      if ($datos['orden'] < 1 || $datos['orden'] > 999) {
        $errores['orden'][] = 'El orden debe estar entre 1 y 999.';
      } elseif ($this->existeIndicadorConOrden($conexion, $datos['fk_competencia'], $datos['orden'], $idIndicador)) {
        $errores['orden'][] = 'Ya existe un indicador con ese orden en la competencia seleccionada.';
      }

      if ($datos['nombre_indicador'] !== null) {
        if ($this->existeIndicadorConNombre($conexion, $datos['fk_competencia'], $datos['nombre_indicador'], $idIndicador)) {
          $errores['nombre_indicador'][] = 'Ya existe un indicador con ese nombre en la competencia seleccionada.';
        }
      }
    }

    return [
      'datos' => $datos,
      'errores' => $errores,
      'competencia' => $competencia,
    ];
  }
}
