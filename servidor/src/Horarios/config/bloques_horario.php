<?php

namespace Micodigo\Horarios\Config;

const BLOQUES_HORARIO = [
  [
    'codigo' => '01',
    'inicio' => '07:00',
    'fin' => '07:25',
    'tipo' => 'repetitivo',
    'etiqueta' => 'Acto Cívico',
    'duracion' => 25,
    'actividad' => 'Acto Cívico',
  ],
  [
    'codigo' => '02',
    'inicio' => '07:25',
    'fin' => '07:45',
    'tipo' => 'repetitivo',
    'etiqueta' => 'Desayuno',
    'duracion' => 20,
    'actividad' => 'Desayuno',
  ],
  [
    'codigo' => '03',
    'inicio' => '07:45',
    'fin' => '08:25',
    'tipo' => 'clase',
    'etiqueta' => 'Bloque académico 03',
    'duracion' => 40,
  ],
  [
    'codigo' => '04',
    'inicio' => '08:25',
    'fin' => '09:05',
    'tipo' => 'clase',
    'etiqueta' => 'Bloque académico 04',
    'duracion' => 40,
  ],
  [
    'codigo' => '05',
    'inicio' => '09:10',
    'fin' => '09:50',
    'tipo' => 'clase',
    'etiqueta' => 'Bloque académico 05',
    'duracion' => 40,
  ],
  [
    'codigo' => '06',
    'inicio' => '09:50',
    'fin' => '10:10',
    'tipo' => 'clase',
    'etiqueta' => 'Extensión bloque 05',
    'duracion' => 20,
    'extensionDe' => '05',
  ],
  [
    'codigo' => '07',
    'inicio' => '10:10',
    'fin' => '10:35',
    'tipo' => 'repetitivo',
    'etiqueta' => 'RECESO',
    'duracion' => 25,
    'actividad' => 'RECESO',
  ],
  [
    'codigo' => '08',
    'inicio' => '10:35',
    'fin' => '11:15',
    'tipo' => 'clase',
    'etiqueta' => 'Bloque académico 08',
    'duracion' => 40,
  ],
  [
    'codigo' => '09',
    'inicio' => '11:15',
    'fin' => '11:55',
    'tipo' => 'clase',
    'etiqueta' => 'Bloque académico 09',
    'duracion' => 40,
  ],
  [
    'codigo' => '10',
    'inicio' => '11:55',
    'fin' => '12:00',
    'tipo' => 'repetitivo',
    'etiqueta' => 'Salida',
    'duracion' => 5,
    'actividad' => 'Salida',
  ],
];

const BLOQUES_CLASE = ['03', '04', '05', '06', '08', '09'];

const BLOQUES_DEPENDENCIAS = [
  '05' => ['06'],
];

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
