<?php

namespace Micodigo\Aula;

use RuntimeException;
use Valitron\Validator;

trait AulaAperturaValidacionesTrait
{
  /**
   * Valida y normaliza la configuracion de secciones solicitada por grado.
   *
   * @param array $entrada            Mapa grado => cantidad solicitada.
   * @param array $catalogoGrados     Catalogo de grados y sus secciones disponibles.
   *
   * @return array{valido:bool, datos?:array<string,int>, errores?:array<string,array<string>>}
   */
  protected function validarConfiguracionSecciones(array $entrada, array $catalogoGrados): array
  {
    if (empty($catalogoGrados)) {
      return [
        'valido' => false,
        'errores' => [
          'generales' => ['No existen grados registrados para aperturar aulas.'],
        ],
      ];
    }

    $errores = [];
    $resultado = [];

    $gradosEsperados = array_keys($catalogoGrados);
    sort($gradosEsperados, SORT_STRING);

    $normalizado = [];
    foreach ($entrada as $grado => $valor) {
      $clave = is_int($grado) ? (string) $grado : trim((string) $grado);
      $normalizado[$clave] = $valor;
    }

    foreach ($gradosEsperados as $grado) {
      $clave = (string) $grado;

      if (!array_key_exists($clave, $normalizado)) {
        $errores[$clave][] = 'Debe seleccionar la cantidad de secciones para este grado.';
        continue;
      }

      $valor = $normalizado[$clave];

      if ($valor === null || $valor === '') {
        $errores[$clave][] = 'Indique un numero de secciones valido.';
        continue;
      }

      if (!is_numeric($valor)) {
        $errores[$clave][] = 'La cantidad de secciones debe ser numerica.';
        continue;
      }

      $cantidad = (int) $valor;
      $maximo = count($catalogoGrados[$grado]);

      if ($cantidad < 1) {
        $errores[$clave][] = 'Debe habilitar al menos una seccion.';
        continue;
      }

      if ($cantidad > $maximo) {
        $errores[$clave][] = sprintf(
          'Solo estan disponibles %d secciones para este grado.',
          $maximo
        );
        continue;
      }

      $resultado[$clave] = $cantidad;
    }

    if (!empty($errores)) {
      return [
        'valido' => false,
        'errores' => $errores,
      ];
    }

    return [
      'valido' => true,
      'datos' => $resultado,
    ];
  }

  /**
   * Normaliza y valida el cupo solicitado para un aula.
   *
   * @param mixed $valor Valor recibido en la solicitud.
   *
   * @return array{valido:bool, valor?:int, errores?:array<string,array<string>>}
   */
  protected function validarCuposAula(mixed $valor): array
  {
    if ($valor === null || $valor === '') {
      return [
        'valido' => false,
        'errores' => [
          'cupos' => ['Debe indicar la cantidad de cupos solicitada.'],
        ],
      ];
    }

    if (!is_numeric($valor)) {
      return [
        'valido' => false,
        'errores' => [
          'cupos' => ['El cupo debe ser un numero entero.'],
        ],
      ];
    }

    $entero = (int) $valor;

    if ($entero < 18 || $entero > 37) {
      return [
        'valido' => false,
        'errores' => [
          'cupos' => ['El cupo debe estar entre 18 y 37 estudiantes.'],
        ],
      ];
    }

    return [
      'valido' => true,
      'valor' => $entero,
    ];
  }

  /**
   * Normaliza y valida el estado deseado para un aula.
   */
  protected function validarEstadoDeseado(?string $estado): array
  {
    if ($estado === null) {
      return [
        'valido' => false,
        'errores' => [
          'estado' => ['Debe indicar el estado que desea asignar.'],
        ],
      ];
    }

    $limpio = strtolower(trim($estado));
    $validos = ['activo', 'inactivo'];

    if (!in_array($limpio, $validos, true)) {
      return [
        'valido' => false,
        'errores' => [
          'estado' => ['El estado solicitado no es valido.'],
        ],
      ];
    }

    return [
      'valido' => true,
      'valor' => $limpio,
    ];
  }

  protected function asegurarAnioDisponible(?array $anio): void
  {
    if ($anio === null) {
      throw new RuntimeException('No hay un anio escolar activo o incompleto disponible para aperturar aulas.');
    }
  }

  protected function validarEntradaGeneral(array $entrada): void
  {
    $validator = new Validator($entrada);
    $validator->rule('array', 'configuracion');

    if (!$validator->validate()) {
      throw new RuntimeException('La solicitud enviada es invalida.');
    }
  }
}
