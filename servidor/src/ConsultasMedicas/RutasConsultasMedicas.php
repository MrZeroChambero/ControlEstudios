<?php

use Micodigo\ConsultasMedicas\ConsultasMedicas;

// Versión limpia: utiliza el wrapper $mapAuthenticated proporcionado por AdminRutas
function registrarRutasConsultasMedicas(AltoRouter $router, callable $mapAuthenticated)
{
  $controlador = new ConsultasMedicas();

  // Endpoints placeholder (implementación real pendiente)
  $mapAuthenticated('GET', '/consultas-medicas', [$controlador, 'listarTodas']);
  $mapAuthenticated('GET', '/consultas-medicas/estudiante/[i:id]', [$controlador, 'listarPorEstudiante']);
  $mapAuthenticated('POST', '/consultas-medicas', [$controlador, 'crear']);
  $mapAuthenticated('PUT', '/consultas-medicas/[i:id]', [$controlador, 'actualizar']);
  $mapAuthenticated('DELETE', '/consultas-medicas/[i:id]', [$controlador, 'eliminar']);
}
