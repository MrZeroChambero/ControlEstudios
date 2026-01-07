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

  // Middleware de autenticación centralizado
  $authMiddleware = function () {
    // Añadimos cabeceras CORS aquí también para las respuestas de bloqueo
    $allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174'
    ];
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, $allowedOrigins, true)) {
      header("Access-Control-Allow-Origin: {$origin}");
      header('Access-Control-Allow-Credentials: true');
      header('Vary: Origin');
      header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
      header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    }

    header('Content-Type: application/json; charset=utf-8');

    // Permitir preflight sin validar sesión
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
      http_response_code(200);
      exit;
    }

    // Si no viene cookie, bloqueamos
    if (!isset($_COOKIE['session_token'])) {
      http_response_code(403);
      echo json_encode([
        'back' => false,
        'blocked' => true,
        'msg' => 'Acceso bloqueado: credenciales requeridas.'
      ], JSON_UNESCAPED_UNICODE);
      exit;
    }

    // Validar token en la base de datos (asume clase Login con obtenerUsuarioPorHash)
    try {
      $hash = $_COOKIE['session_token'];
      $pdo = \Micodigo\Config\Conexion::obtener();
      $login = new \Micodigo\Login\Login($pdo);
      $usuario = $login->obtenerUsuarioPorHash($hash);

      if (!$usuario) {
        // Cookie inválida o expirada -> bloquear y borrar cookie
        setcookie('session_token', '', time() - 3600, '/');
        http_response_code(403);
        echo json_encode([
          'back' => false,
          'blocked' => true,
          'msg' => 'Acceso bloqueado: sesión inválida o expirada.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
      }

      // Si llega aquí, la sesión es válida: continua ejecución
    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode([
        'back' => false,
        'blocked' => true,
        'msg' => 'Error del servidor al validar la sesión.'
      ], JSON_UNESCAPED_UNICODE);
      exit;
    }
  };

  // Wrapper para mapear rutas que requieren autenticación
  $mapAuthenticated = function (string $method, string $route, callable $target) use ($router, $authMiddleware) {
    $router->map($method, $route, function (...$params) use ($authMiddleware, $target) {
      // Ejecuta middleware que bloqueará si no está autorizado
      $authMiddleware();
      // Si no salió, llama al handler original con los parámetros de ruta
      call_user_func_array($target, $params);
    });
  };

  // Wrapper para mapear rutas que además requieran un rol/nivel de usuario específico.
  // Uso: $mapAuthenticatedRole('GET', '/ruta', $handler, ['Director', 'Admin']);
  $mapAuthenticatedRole = function (
    string $method,
    string $route,
    callable $target,
    array $allowedRoles = []
  ) use ($router, $authMiddleware) {
    $router->map($method, $route, function (...$params) use ($authMiddleware, $target, $allowedRoles) {
      // Valida sesión básica
      $authMiddleware();

      // Obtener usuario nuevamente para comprobar rol (evita depender de estado global)
      try {
        $hash = $_COOKIE['session_token'] ?? null;
        if (!$hash) {
          http_response_code(403);
          echo json_encode([
            'back' => false,
            'blocked' => true,
            'msg' => 'Acceso bloqueado: credenciales requeridas.'
          ], JSON_UNESCAPED_UNICODE);
          return;
        }

        $pdo = \Micodigo\Config\Conexion::obtener();
        $login = new \Micodigo\Login\Login($pdo);
        $usuario = $login->obtenerUsuarioPorHash($hash);

        $rolUsuario = null;
        if (is_array($usuario)) {
          // intentar varios campos posibles
          $rolUsuario = $usuario['rol'] ?? $usuario['nivel'] ?? $usuario['nivel_acceso'] ?? null;
        }

        if (!empty($allowedRoles) && !in_array($rolUsuario, $allowedRoles, true)) {
          http_response_code(403);
          echo json_encode([
            'back' => false,
            'blocked' => true,
            'msg' => 'Acceso bloqueado: nivel de usuario insuficiente.'
          ], JSON_UNESCAPED_UNICODE);
          return;
        }

        // Llamar handler original
        call_user_func_array($target, $params);
      } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
          'back' => false,
          'blocked' => true,
          'msg' => 'Error del servidor al validar el rol de usuario.'
        ], JSON_UNESCAPED_UNICODE);
        return;
      }
    });
  };

  // Incluye y registra las rutas de autenticación
  require_once __DIR__ . '/Login/RutasLogin.php';
  registrarRutasLogin($router);

  // Rutas publicas para recuperacion de contrasena mediante preguntas de seguridad
  require_once __DIR__ . '/PreguntasSeguridad/RutasPreguntasSeguridad.php';
  registrarRutasPreguntasSeguridad($router);

  // Incluye y registra las rutas de usuarios
  require_once __DIR__ . '/Usuarios/RutasUsuarios.php';
  registrarRutasUsuarios($router);

  // Incluye y registra las rutas de personas
  require_once __DIR__ . '/Persona/RutasPersona.php';
  registrarRutasPersona($router);

  // Registrar rutas de estudiantes (sin middleware en el archivo de rutas)
  require_once __DIR__ . '/Estudiante/RutasEstudiante.php';
  registrarRutasEstudiante($router, $mapAuthenticated);

  // Registrar rutas de consultas médicas (placeholder)
  require_once __DIR__ . '/ConsultasMedicas/RutasConsultasMedicas.php';
  registrarRutasConsultasMedicas($router, $mapAuthenticated);

  // Registrar rutas de documentos académicos
  require_once __DIR__ . '/DocumentosAcademicos/RutasDocumentosAcademicos.php';
  registrarRutasDocumentosAcademicos($router);

  // Registrar rutas de alergias
  require_once __DIR__ . '/Alergias/RutasAlergias.php';
  registrarRutasAlergias($router);

  // Registrar rutas de patologías / condiciones de salud
  require_once __DIR__ . '/Patologia/RutasPatologias.php';
  registrarRutasPatologias($router);

  // Registrar rutas de vacunas
  require_once __DIR__ . '/Vacuna/RutasVacunas.php';
  registrarRutasVacunas($router);

  // Incluye y registra las rutas de personal
  require_once __DIR__ . '/Personal/RutasPersonal.php';
  registrarRutasPersonal($router);

  // Incluye y registra las rutas de representantes
  require_once __DIR__ . '/Representate/RutasRepresentante.php';
  registrarRutasRepresentante($router);

  // Incluye y registra las rutas de habilidades
  require_once __DIR__ . '/Habilidades/RutasHabilidades.php';
  registrarRutasHabilidades($router);

  // Incluye y registra las rutas de cargos
  require_once __DIR__ . '/Cargo/RutasCargo.php';
  registrarRutasCargo($router);

  // Incluye y registra las rutas de función del personal
  require_once __DIR__ . '/FuncionPersonal/RutasFuncionPersonal.php';
  registrarRutasFuncionPersonal($router);
  // Incluye y registra las rutas de áreas de aprendizaje
  require_once __DIR__ . '/AreasAprendizaje/RutasAreasAprendizaje.php';
  registrarRutasAreasAprendizaje($router);

  // Incluye y registra las rutas de parentescos
  require_once __DIR__ . '/Parentesco/RutasParentesco.php';
  registrarRutasParentesco($router);

  // Incluye y registra las rutas de contenidos
  require_once __DIR__ . '/Contenidos/RutasContenidos.php';
  registrarRutasContenidos($router);
  // Incluye y registra las rutas de temas
  require_once __DIR__ . '/Temas/RutasTemas.php';
  registrarRutasTemas($router);

  // Incluye y registra las rutas de respaldos de base de datos
  require_once __DIR__ . '/Respaldo/RutasRespaldo.php';
  registrarRutasRespaldo($router, $mapAuthenticated);

  // require_once __DIR__ . '/mostrar.php';
  // rutasMostrar($router);
  // Incluye y registra las rutas de temas

  // Incluye y registra las rutas de componentes de aprendizaje
  require_once __DIR__ . '/ComponentesAprendizaje/RutasComponentesAprendizaje.php';
  registrarRutasComponentesAprendizaje($router);

  // Incluye y registra las rutas de aulas
  require_once __DIR__ . '/Aula/RutasAula.php';
  registrarRutasAula($router);

  // Incluye y registra las rutas de inscripciones
  require_once __DIR__ . '/Inscripcion/RutasInscripcion.php';
  registrarRutasInscripcion($router, $mapAuthenticated);

  // Incluye y registra las rutas de impartir
  require_once __DIR__ . '/Impartir/RutasImpartir.php';
  registrarRutasImpartir($router, $mapAuthenticated);

  // Incluye y registra las rutas de competencias
  require_once __DIR__ . '/Competencias/RutasCompetencias.php';
  registrarRutasCompetencias($router, $mapAuthenticated);

  // Incluye y registra las rutas de indicadores
  require_once __DIR__ . '/Indicadores/RutasIndicadores.php';
  registrarRutasIndicadores($router, $mapAuthenticated);



  // Incluye y registra las rutas de grados y secciones
  require_once __DIR__ . '/GradosSecciones/RutasGradosSecciones.php';
  registrarRutasGradosSecciones($router);

  // Incluye y registra las rutas de años escolares
  require_once __DIR__ . '/AnioEscolar/RutasAnioEscolar.php';
  registrarRutasAnioEscolar($router);

  // Incluye y registra las rutas de momentos académicos
  require_once __DIR__ . '/MomentoAcademico/RutasMomentoAcademico.php';
  registrarRutasMomentoAcademico($router);

  // Incluye y registra las rutas de horarios
  require_once __DIR__ . '/Horarios/RutasHorarios.php';
  registrarRutasHorarios($router, $mapAuthenticated);

  // Incluye y registra las rutas de planificación académica
  require_once __DIR__ . '/PlanificacionAcademica/RutasPlanificacionAcademica.php';
  registrarRutasPlanificacionAcademica($router, $mapAuthenticated);

  return $router;
}
