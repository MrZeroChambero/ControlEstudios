<?php

namespace Micodigo\ComponentesAprendizaje;

use Valitron\Validator;
use PDO;

trait ComponentesAprendizajeValidacionesTrait
{
  protected function validarDatos(PDO $conexion, array $datos, ?int $idIgnorar = null): array
  {
    Validator::lang('es');

    $datosDepurados = [
      'fk_area' => isset($datos['fk_area']) ? (int)$datos['fk_area'] : null,
      'nombre_componente' => $this->limpiarTexto($datos['nombre_componente'] ?? null),
      'especialista' => $this->normalizarTipoDocente($datos['especialista'] ?? null),
      'evalua' => $datos['evalua'] ?? 'no',
      'estado_componente' => $datos['estado_componente'] ?? 'activo',
      'grupo' => $datos['grupo'] ?? 'Completo',
    ];

    $validador = new Validator($datosDepurados);
    $validador->labels([
      'fk_area' => 'área de aprendizaje',
      'nombre_componente' => 'nombre del componente',
      'especialista' => 'tipo de docente responsable',
      'evalua' => 'indicador de evaluación',
      'estado_componente' => 'estado del componente',
      'grupo' => 'tipo de grupo',
    ]);

    $validador->rule('required', ['fk_area', 'nombre_componente', 'especialista', 'evalua']);
    $validador->rule('integer', 'fk_area');
    $validador->rule('min', 'fk_area', 1);
    $validador->rule('lengthBetween', 'nombre_componente', 3, 100);
    $validador->rule('in', 'evalua', ['si', 'no']);
    $validador->rule('in', 'estado_componente', ['activo', 'inactivo']);
    $validador->rule('in', 'grupo', ['Completo', 'Sub Grupo']);
    $validador->rule('in', 'especialista', self::TIPOS_DOCENTE_PERMITIDOS)
      ->message('debe ser Docente de aula, Docente especialista o Docente de cultura.');

    $this->agregarReglaTextoPermitido($validador, 'nombre_componente', 100);
    $this->agregarReglaAreaExistente($validador, $conexion);

    if (!$validador->validate()) {
      return $validador->errors();
    }

    $errores = [];

    if ($datosDepurados['fk_area'] !== null && $datosDepurados['nombre_componente'] !== null) {
      $sql = 'SELECT COUNT(*) FROM componentes_aprendizaje WHERE fk_area = ? AND LOWER(nombre_componente) = LOWER(?)';
      $parametros = [$datosDepurados['fk_area'], $datosDepurados['nombre_componente']];

      if ($idIgnorar !== null) {
        $sql .= ' AND id_componente <> ?';
        $parametros[] = $idIgnorar;
      }

      $total = (int)$this->ejecutarValor($conexion, $sql, $parametros);
      if ($total > 0) {
        $errores['nombre_componente'][] = 'Ya existe un componente con ese nombre para el área seleccionada.';
      }
    }

    return $errores;
  }

  private function agregarReglaTextoPermitido(Validator $validador, string $campo, int $maxLength): void
  {
    $validador->addRule('texto_permitido_' . $campo, function ($field, $value) use ($maxLength) {
      if ($value === null) {
        return true;
      }

      if (mb_strlen($value) > $maxLength) {
        return false;
      }

      return preg_match('/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ,.\-]+$/u', (string)$value) === 1;
    }, 'contiene caracteres no válidos.');

    $validador->rule('texto_permitido_' . $campo, $campo);
  }

  private function agregarReglaAreaExistente(Validator $validador, PDO $conexion): void
  {
    $validador->addRule('area_existente', function ($field, $value) use ($conexion) {
      if (!is_numeric($value)) {
        return false;
      }

      $sql = 'SELECT COUNT(*) FROM areas_aprendizaje WHERE id_area_aprendizaje = ?';
      $total = (int)$this->ejecutarValor($conexion, $sql, [(int)$value]);
      return $total > 0;
    }, 'no existe.');

    $validador->rule('area_existente', 'fk_area');
  }
}
