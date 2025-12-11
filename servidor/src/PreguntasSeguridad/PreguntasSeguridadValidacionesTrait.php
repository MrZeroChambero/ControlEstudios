<?php

namespace Micodigo\PreguntasSeguridad;

use Valitron\Validator;

trait PreguntasSeguridadValidacionesTrait
{
  protected function validarColeccionPreguntas(array $preguntas): array
  {
    if (!is_array($preguntas)) {
      return ['general' => ['Las preguntas de seguridad deben enviarse como una lista.']];
    }

    Validator::lang('es');
    $errores = [];
    $normalizadas = [];

    foreach ($preguntas as $indice => $entrada) {
      $datos = $this->prepararEntradaPregunta((array) $entrada);
      $normalizadas[$indice] = $datos;

      $validator = new Validator($datos);
      $validator->labels([
        'pregunta' => 'Pregunta de seguridad',
        'respuesta' => 'Respuesta de seguridad',
      ]);

      $validator->rule('required', ['pregunta', 'respuesta']);
      $validator->rule('lengthBetween', 'pregunta', 10, 150);
      $validator->rule('lengthMin', 'respuesta', 4);
      $validator->rule('lengthMax', 'respuesta', 255);

      if (!$validator->validate()) {
        $numeroHumano = $indice + 1;
        foreach ($validator->errors() as $mensajes) {
          foreach ($mensajes as $mensaje) {
            $errores["pregunta_{$numeroHumano}"][] = "Pregunta {$numeroHumano}: {$mensaje}";
          }
        }
      }
    }

    $preguntasValidas = array_filter($normalizadas, function ($datos) {
      return !empty($datos['pregunta']) && !empty($datos['respuesta']);
    });

    if (count($preguntasValidas) < 3) {
      $errores['general'][] = 'Debes registrar al menos 3 preguntas de seguridad.';
    }

    $vistos = [];
    foreach ($preguntasValidas as $index => $datos) {
      $clave = mb_strtolower($datos['pregunta']);
      if (isset($vistos[$clave])) {
        $primero = $vistos[$clave] + 1;
        $segundo = $index + 1;
        $errores['general'][] = "Las preguntas {$primero} y {$segundo} son duplicadas. Usa textos distintos.";
      } else {
        $vistos[$clave] = $index;
      }
    }

    return $errores;
  }
}
