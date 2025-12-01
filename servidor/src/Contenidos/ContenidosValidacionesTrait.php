<?php

namespace Micodigo\Contenidos;

use PDO;
use Valitron\Validator;

trait ContenidosValidacionesTrait
{
  protected function validarDatos(PDO $conexion, array $datos, ?int $idIgnorar = null): array
  {
    Validator::lang('es');

    $datosDepurados = [
      'fk_componente' => isset($datos['fk_componente']) ? (int)$datos['fk_componente'] : null,
      'nombre_contenido' => $this->limpiarTexto($datos['nombre_contenido'] ?? null),
      'grado' => $this->normalizarGrado($datos['grado'] ?? null),
      'descripcion' => $this->limpiarTexto($datos['descripcion'] ?? null),
      'estado' => $datos['estado'] ?? 'activo',
    ];

    $validador = new Validator($datosDepurados);
    $validador->labels([
      'fk_componente' => 'componente de aprendizaje',
      'nombre_contenido' => 'nombre del contenido',
      'grado' => 'grado',
      'descripcion' => 'descripción',
      'estado' => 'estado del contenido',
    ]);

    $validador->rule('required', ['fk_componente', 'nombre_contenido', 'grado']);
    $validador->rule('integer', 'fk_componente');
    $validador->rule('min', 'fk_componente', 1);
    $validador->rule('lengthBetween', 'nombre_contenido', 3, 255);
    $validador->rule('lengthMax', 'descripcion', 255);
    $validador->rule('in', 'grado', self::GRADOS_VALIDOS);
    $validador->rule('in', 'estado', ['activo', 'inactivo']);

    $this->agregarReglaTextoPermitido($validador, 'nombre_contenido', 255);
    $this->agregarReglaTextoPermitido($validador, 'descripcion', 255, false);
    $this->agregarReglaComponenteExistente($validador, $conexion);
    $this->agregarReglaComponenteActivo($validador, $conexion);

    if (!$validador->validate()) {
      return $validador->errors();
    }

    $errores = $this->validarUnicidad($conexion, $datosDepurados, $idIgnorar);
    return $errores;
  }

  private function agregarReglaTextoPermitido(Validator $validador, string $campo, int $maxLength, bool $obligatorio = true): void
  {
    $nombreRegla = 'texto_permitido_' . $campo;

    $validador->addRule($nombreRegla, function ($field, $value) use ($maxLength, $obligatorio) {
      if ($value === null) {
        return !$obligatorio;
      }

      if (mb_strlen($value) > $maxLength) {
        return false;
      }

      return preg_match('/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ,."()\-]+$/u', (string)$value) === 1;
    }, 'contiene caracteres no válidos.');

    $validador->rule($nombreRegla, $campo);
  }

  private function agregarReglaComponenteExistente(Validator $validador, PDO $conexion): void
  {
    $validador->addRule('componente_existente', function ($field, $value) use ($conexion) {
      if (!is_numeric($value)) {
        return false;
      }

      return $this->componenteExiste($conexion, (int)$value);
    }, 'no existe.');

    $validador->rule('componente_existente', 'fk_componente');
  }

  private function agregarReglaComponenteActivo(Validator $validador, PDO $conexion): void
  {
    $validador->addRule('componente_activo', function ($field, $value) use ($conexion) {
      if (!is_numeric($value)) {
        return false;
      }

      return $this->componenteActivo($conexion, (int)$value);
    }, 'debe estar en estado activo.');

    $validador->rule('componente_activo', 'fk_componente');
  }

  private function validarUnicidad(PDO $conexion, array $datos, ?int $idIgnorar = null): array
  {
    $errores = [];

    if ($datos['fk_componente'] === null || $datos['nombre_contenido'] === null || $datos['grado'] === null) {
      return $errores;
    }

    $sql = 'SELECT COUNT(*) FROM contenidos WHERE fk_componente = ? AND LOWER(nombre_contenido) = LOWER(?) AND grado = ?';
    $parametros = [$datos['fk_componente'], $datos['nombre_contenido'], $datos['grado']];

    if ($idIgnorar !== null) {
      $sql .= ' AND id_contenido <> ?';
      $parametros[] = $idIgnorar;
    }

    $total = (int)$this->ejecutarValor($conexion, $sql, $parametros);
    if ($total > 0) {
      $errores['nombre_contenido'][] = 'Ya existe un contenido con ese nombre para el componente y grado seleccionados.';
    }

    return $errores;
  }
}
