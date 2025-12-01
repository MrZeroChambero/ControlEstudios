<?php

namespace Micodigo\AreasAprendizaje;

use Valitron\Validator;
use PDO;

trait AreasAprendizajeValidacionesTrait
{
  protected function validarDatos(PDO $conexion, array $datos, ?int $idIgnorar = null): array
  {
    Validator::lang('es');

    $datosDepurados = [
      'nombre_area' => $this->limpiarNombre($datos['nombre_area'] ?? null),
      'estado_area' => $datos['estado_area'] ?? 'activo'
    ];

    $validador = new Validator($datosDepurados);
    $validador->labels([
      'nombre_area' => 'nombre del área',
      'estado_area' => 'estado del área'
    ]);

    $this->agregarReglaTextoEspanol($validador);
    $this->agregarReglaUnicidad($validador, $conexion, $datosDepurados['nombre_area'], $idIgnorar);

    $validador->rule('required', 'nombre_area')->message('El nombre del área es obligatorio.');
    $validador->rule('lengthMax', 'nombre_area', 100)->message('El nombre del área no puede superar 100 caracteres.');
    $validador->rule('texto_espanol', 'nombre_area')->message('El nombre del área solo puede contener letras, números, espacios y símbolos permitidos.');
    $validador->rule('in', 'estado_area', ['activo', 'inactivo'])->message('El estado del área es inválido.');

    if (!$validador->validate()) {
      return $validador->errors();
    }

    return [];
  }

  private function agregarReglaTextoEspanol(Validator $validador): void
  {
    $validador->addRule('texto_espanol', function ($campo, $valor) {
      if ($valor === null || $valor === '') {
        return true;
      }
      return preg_match('/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ,.\-]+$/u', (string)$valor) === 1;
    }, 'contiene caracteres no válidos.');
  }

  private function agregarReglaUnicidad(Validator $validador, PDO $conexion, ?string $nombre, ?int $idIgnorar): void
  {
    $validador->addRule('nombre_area_unico', function ($campo, $valor) use ($conexion, $idIgnorar) {
      if ($valor === null) {
        return true;
      }

      $sql = 'SELECT COUNT(*) FROM areas_aprendizaje WHERE LOWER(nombre_area) = LOWER(?)';
      $parametros = [$valor];

      if ($idIgnorar !== null) {
        $sql .= ' AND id_area_aprendizaje <> ?';
        $parametros[] = $idIgnorar;
      }

      $total = (int)$this->ejecutarValor($conexion, $sql, $parametros);
      return $total === 0;
    }, 'ya se encuentra registrado.');

    $validador->rule('nombre_area_unico', 'nombre_area')->message('El nombre del área ya se encuentra registrado.');
  }
}
