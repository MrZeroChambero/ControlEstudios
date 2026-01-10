<?php

use Micodigo\Estudiante\Estudiante;

/**
 * Registro de rutas del módulo Estudiantes usando wrapper de autenticación provisto.
 */
function registrarRutasEstudiante(
  AltoRouter $router,
  callable $mapAuthenticatedRole,
  array $rolesPermitidos
) {
  $controlador = new Estudiante();

  // Rutas según frontend actual
  $mapAuthenticatedRole('GET', '/estudiantes', [$controlador, 'listarEstudiantes'], $rolesPermitidos);
  $mapAuthenticatedRole('GET', '/estudiantes/personas-candidatas', [$controlador, 'listarCandidatos'], $rolesPermitidos);
  $mapAuthenticatedRole('POST', '/estudiantes/persona', [$controlador, 'crearCandidato'], $rolesPermitidos);
  $mapAuthenticatedRole('POST', '/estudiantes/persona/[i:id]/registrar', [$controlador, 'registrarEstudianteEndpoint'], $rolesPermitidos);
  $mapAuthenticatedRole('GET', '/estudiantes/[i:id]', [$controlador, 'obtenerEstudiante'], $rolesPermitidos);
  $mapAuthenticatedRole('PUT', '/estudiantes/[i:id]', [$controlador, 'actualizarEstudianteEndpoint'], $rolesPermitidos);
  $mapAuthenticatedRole('PATCH', '/estudiantes/[i:id]/estado', [$controlador, 'cambiarEstadoEstudianteEndpoint'], $rolesPermitidos);

  // Rutas antiguas (compatibilidad)
  $mapAuthenticatedRole('GET', '/estudiantes/candidatos', [$controlador, 'listarCandidatos'], $rolesPermitidos);
  $mapAuthenticatedRole('POST', '/estudiantes/candidatos', [$controlador, 'crearCandidato'], $rolesPermitidos);
  $mapAuthenticatedRole('POST', '/estudiantes/registrar/[i:id_persona]', [$controlador, 'registrarEstudianteEndpoint'], $rolesPermitidos);
}
