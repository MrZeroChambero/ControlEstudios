<?php

use Micodigo\Estudiante\Estudiante;

/**
 * Registro de rutas del módulo Estudiantes usando wrapper de autenticación provisto.
 */
function registrarRutasEstudiante(AltoRouter $router, callable $mapAuthenticated)
{
  $controlador = new Estudiante();

  // Rutas según frontend actual
  $mapAuthenticated('GET', '/estudiantes', [$controlador, 'listarEstudiantes']);
  $mapAuthenticated('GET', '/estudiantes/personas-candidatas', [$controlador, 'listarCandidatos']);
  $mapAuthenticated('POST', '/estudiantes/persona', [$controlador, 'crearCandidato']);
  $mapAuthenticated('POST', '/estudiantes/persona/[i:id]/registrar', [$controlador, 'registrarEstudianteEndpoint']);
  $mapAuthenticated('GET', '/estudiantes/[i:id]', [$controlador, 'obtenerEstudiante']);
  $mapAuthenticated('PUT', '/estudiantes/[i:id]', [$controlador, 'actualizarEstudianteEndpoint']);
  $mapAuthenticated('PATCH', '/estudiantes/[i:id]/estado', [$controlador, 'cambiarEstadoEstudianteEndpoint']);

  // Rutas antiguas (compatibilidad)
  $mapAuthenticated('GET', '/estudiantes/candidatos', [$controlador, 'listarCandidatos']);
  $mapAuthenticated('POST', '/estudiantes/candidatos', [$controlador, 'crearCandidato']);
  $mapAuthenticated('POST', '/estudiantes/registrar/[i:id_persona]', [$controlador, 'registrarEstudianteEndpoint']);
}
