<?php

namespace Micodigo\Horarios\Config;

const BLOQUES_HORARIO = [
  [
    'codigo' => '01',
    'inicio' => '07:00',
    'fin' => '07:20',
    'tipo' => 'repetitivo',
    'etiqueta' => 'Acto Cívico',
    'duracion' => 20,
    'actividad' => 'Acto Cívico',
  ],
  [
    'codigo' => '02',
    'inicio' => '07:20',
    'fin' => '07:40',
    'tipo' => 'repetitivo',
    'etiqueta' => 'Desayuno',
    'duracion' => 20,
    'actividad' => 'Desayuno',
  ],
  [
    'codigo' => '03',
    'inicio' => '07:40',
    'fin' => '08:20',
    'tipo' => 'clase',
    'etiqueta' => 'Bloque académico 03',
    'duracion' => 40,
  ],
  [
    'codigo' => '04',
    'inicio' => '08:20',
    'fin' => '09:00',
    'tipo' => 'clase',
    'etiqueta' => 'Bloque académico 04',
    'duracion' => 40,
  ],
  [
    'codigo' => '05',
    'inicio' => '09:00',
    'fin' => '09:40',
    'tipo' => 'clase',
    'etiqueta' => 'Bloque académico 05',
    'duracion' => 40,
  ],
  [
    'codigo' => '06',
    'inicio' => '09:40',
    'fin' => '10:00',
    'tipo' => 'repetitivo',
    'etiqueta' => 'Recreo',
    'duracion' => 20,
    'actividad' => 'Recreo',
  ],
  [
    'codigo' => '07',
    'inicio' => '10:00',
    'fin' => '10:40',
    'tipo' => 'clase',
    'etiqueta' => 'Bloque académico 07',
    'duracion' => 40,
  ],
  [
    'codigo' => '08',
    'inicio' => '10:40',
    'fin' => '11:20',
    'tipo' => 'clase',
    'etiqueta' => 'Bloque académico 08',
    'duracion' => 40,
  ],
  [
    'codigo' => '09',
    'inicio' => '11:20',
    'fin' => '12:00',
    'tipo' => 'clase',
    'etiqueta' => 'Bloque académico 09',
    'duracion' => 40,
  ],
  [
    'codigo' => '11',
    'inicio' => '12:00',
    'fin' => '12:00',
    'tipo' => 'repetitivo',
    'etiqueta' => 'Salida',
    'duracion' => 0,
    'actividad' => 'Salida',
  ],
];

const BLOQUES_CLASE = ['03', '04', '05', '07', '08', '09'];

const BLOQUES_DEPENDENCIAS = [];

function obtenerBloquePorCodigo(string $codigo): ?array
{
  static $mapa = null;
  if ($mapa === null) {
    $mapa = [];
    foreach (BLOQUES_HORARIO as $bloque) {
      $mapa[$bloque['codigo']] = $bloque;
    }
  }

  $clave = str_pad($codigo, 2, '0', STR_PAD_LEFT);
  return $mapa[$clave] ?? null;
}

function esBloqueClase(string $codigo): bool
{
  return in_array(str_pad($codigo, 2, '0', STR_PAD_LEFT), BLOQUES_CLASE, true);
}

function obtenerBloquesClase(): array
{
  return array_values(array_filter(BLOQUES_HORARIO, static fn($bloque) => $bloque['tipo'] === 'clase'));
}
