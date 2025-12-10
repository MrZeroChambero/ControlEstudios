<?php

use Micodigo\Inscripcion\Inscripcion;

function registrarRutasInscripcion(AltoRouter $router, callable $mapAuthenticated): void
{
  $controlador = new Inscripcion();

  $mapAuthenticated('GET', '/inscripciones/precondiciones', [$controlador, 'verificarPrecondiciones']);
  $mapAuthenticated('GET', '/inscripciones/estudiantes', [$controlador, 'listarEstudiantesElegibles']);
  $mapAuthenticated('GET', '/inscripciones/aulas-disponibles', [$controlador, 'listarAulasDisponibles']);
  $mapAuthenticated('GET', '/inscripciones/estudiantes/[i:id]/representantes', [$controlador, 'listarRepresentantesElegibles']);
  $mapAuthenticated('POST', '/inscripciones', [$controlador, 'registrarInscripcion']);
}
