<?php

namespace Micodigo\Temas;

use PDO;
use Valitron\Validator;

trait TemasValidacionesTrait
{
  protected function validarDatos(PDO $conexion, array $datos, ?int $idIgnorar = null): array
  {
    Validator::lang('es');

    $datosDepurados = [
      'fk_contenido' => isset($datos['fk_contenido']) ? (int)$datos['fk_contenido'] : null,
      'nombre_tema' => $this->limpiarTexto($datos['nombre_tema'] ?? null),
      'estado' => $datos['estado'] ?? 'activo',
    ];

    $validador = new Validator($datosDepurados);
    $validador->labels([
      'fk_contenido' => 'contenido',
      'nombre_tema' => 'nombre del tema',
      'estado' => 'estado del tema',
    ]);

    $validador->rule('required', ['fk_contenido', 'nombre_tema']);
    $validador->rule('integer', 'fk_contenido');
    $validador->rule('min', 'fk_contenido', 1);
    $validador->rule('lengthBetween', 'nombre_tema', 3, 150);
    $validador->rule('in', 'estado', ['activo', 'inactivo']);

    $this->agregarReglaTextoPermitido($validador, 'nombre_tema', 150);
    $this->agregarReglaContenidoExistente($validador, $conexion);
    $this->agregarReglaContenidoActivo($validador, $conexion);

    if (!$validador->validate()) {
      return $validador->errors();
    }

    $errores = [];
    if ($datosDepurados['fk_contenido'] !== null && $datosDepurados['nombre_tema'] !== null) {
      if ($this->nombreDuplicado($conexion, $datosDepurados['fk_contenido'], $datosDepurados['nombre_tema'], $idIgnorar)) {
        $errores['nombre_tema'][] = 'Ya existe un tema con ese nombre para el contenido seleccionado.';
      }
    }

    return $errores;
  }

  private function agregarReglaTextoPermitido(Validator $validador, string $campo, int $maxLength): void
  {
    $nombreRegla = 'texto_permitido_' . $campo;

    $validador->addRule($nombreRegla, function ($field, $value) use ($maxLength) {
      if ($value === null) {
        return false;
      }

      if (mb_strlen($value) > $maxLength) {
        return false;
      }

      return preg_match('/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ,.\-]+$/u', (string)$value) === 1;
    }, 'contiene caracteres no válidos.');

    $validador->rule($nombreRegla, $campo);
  }

  private function agregarReglaContenidoExistente(Validator $validador, PDO $conexion): void
  {
    $validador->addRule('contenido_existente', function ($field, $value) use ($conexion) {
      if (!is_numeric($value)) {
        return false;
      }

      return $this->contenidoExiste($conexion, (int)$value);
    }, 'no existe.');

    $validador->rule('contenido_existente', 'fk_contenido');
  }

  private function agregarReglaContenidoActivo(Validator $validador, PDO $conexion): void
  {
    $validador->addRule('contenido_activo', function ($field, $value) use ($conexion) {
      if (!is_numeric($value)) {
        return false;
      }

      return $this->contenidoActivo($conexion, (int)$value);
    }, 'debe estar en estado activo.');

    $validador->rule('contenido_activo', 'fk_contenido');
  }
}
