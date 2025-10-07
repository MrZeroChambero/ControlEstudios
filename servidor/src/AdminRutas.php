<?php

use AltoRouter as Router;

/**
 * Centraliza la creación del enrutador y el registro de todas las rutas de la aplicación.
 *
 * @return Router La instancia del enrutador con todas las rutas mapeadas.
 */
function registrarTodasLasRutas(): Router
{
  // --- Enrutamiento ---
  $router = new Router();

  // Establece la base de la URL si tu proyecto no está en la raíz del dominio
  // Ejemplo: si tu API está en /controlestudios/servidor/, la base es /controlestudios/servidor
  $router->setBasePath('/controlestudios/servidor');

  // Incluye y registra las rutas de autenticación
  require_once __DIR__ . '/Login/RutasLogin.php';
  registrarRutasLogin($router);

  // Incluye y registra las rutas de usuarios
  require_once __DIR__ . '/Usuario/RutasUsuario.php';
  registrarRutasUsuario($router);

  // Incluye y registra las rutas de personas
  require_once __DIR__ . '/Persona/RutasPersona.php';
  registrarRutasPersona($router);

  // Incluye y registra las rutas de personal
  require_once __DIR__ . '/Personal/RutasPersonal.php';
  registrarRutasPersonal($router);


  return $router;
}
