<?php

use Micodigo\PreguntasSeguridad\ControladoraPreguntasSeguridad;

function registrarRutasPreguntasSeguridad(AltoRouter $router)
{
  $controlador = new ControladoraPreguntasSeguridad();

  $router->map('POST', '/preguntas-seguridad/iniciar-recuperacion', [$controlador, 'iniciarRecuperacion']);
  $router->map('POST', '/preguntas-seguridad/restablecer', [$controlador, 'restablecer']);
}
