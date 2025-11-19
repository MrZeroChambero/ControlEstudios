<?php

namespace Micodigo\Personal;

use Micodigo\Config\Conexion;
use Exception;
use DateTime;

class ControladoraPersonal
{
  /**
   * Función auxiliar para parsear y validar JSON input
   */
  private function parseJsonInput()
  {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
      throw new Exception('JSON inválido: ' . json_last_error_msg());
    }

    return $data;
  }

  /**
   * Función auxiliar para enviar respuestas JSON estandarizadas
   */
  private function sendJsonResponse($statusCode, $status, $message, $data = null, $errors = null)
  {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');

    $response = [
      'status' => $status,
      'message' => $message,
      'back' => $status === 'success'
    ];

    if ($data !== null) {
      $response['data'] = $data;
    }

    if ($errors !== null) {
      $response['errors'] = $errors;
    }

    echo json_encode($response, JSON_UNESCAPED_UNICODE);
  }

  /**
   * Limpiar texto de entrada
   */
  private function limpiarTexto($texto)
  {
    if ($texto === null) return null;
    $texto = trim($texto);
    $texto = preg_replace('/\s+/', ' ', $texto);
    return $texto === '' ? null : $texto;
  }

  /**
   * Validar texto en español
   */
  private function validarTextoEspanol($campo, $valor, $obligatorio = false)
  {
    if ($valor === null || $valor === '') {
      if ($obligatorio) {
        return "El campo {$campo} es requerido";
      }
      return null;
    }

    if (!preg_match('/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/', $valor)) {
      return "El campo {$campo} solo puede contener letras y espacios";
    }

    if (strlen(trim($valor)) === 0) {
      return "El campo {$campo} no puede contener solo espacios";
    }

    if ($obligatorio && strlen(trim($valor)) < 2) {
      return "El campo {$campo} debe tener al menos 2 caracteres";
    }

    return null;
  }

  /**
   * Validar edad mínima (18 años)
   */
  private function validarEdad($fechaNacimiento)
  {
    $hoy = new DateTime();
    $nacimiento = DateTime::createFromFormat('Y-m-d', $fechaNacimiento);

    if (!$nacimiento) {
      return "Fecha de nacimiento inválida";
    }

    $edad = $hoy->diff($nacimiento)->y;

    if ($edad < 18) {
      return "La persona debe ser mayor de 18 años";
    }

    if ($edad > 100) {
      return "La edad no puede ser mayor a 100 años";
    }

    return null;
  }

  /**
   * Validar datos básicos de persona
   */
  private function validarDatosPersona($data)
  {
    $errores = [];

    // Limpiar textos
    $data['primer_nombre'] = $this->limpiarTexto($data['primer_nombre'] ?? '');
    $data['segundo_nombre'] = $this->limpiarTexto($data['segundo_nombre'] ?? '');
    $data['primer_apellido'] = $this->limpiarTexto($data['primer_apellido'] ?? '');
    $data['segundo_apellido'] = $this->limpiarTexto($data['segundo_apellido'] ?? '');
    $data['cedula'] = $this->limpiarTexto($data['cedula'] ?? '');
    $data['nacionalidad'] = $this->limpiarTexto($data['nacionalidad'] ?? '');
    $data['direccion'] = $this->limpiarTexto($data['direccion'] ?? '');
    $data['telefono_principal'] = $this->limpiarTexto($data['telefono_principal'] ?? '');
    $data['telefono_secundario'] = $this->limpiarTexto($data['telefono_secundario'] ?? '');
    $data['email'] = $this->limpiarTexto($data['email'] ?? '');

    // Validar campos requeridos
    $camposRequeridos = [
      'primer_nombre' => 'Primer nombre',
      'primer_apellido' => 'Primer apellido',
      'fecha_nacimiento' => 'Fecha de nacimiento',
      'genero' => 'Género',
      'cedula' => 'Cédula',
      'nacionalidad' => 'Nacionalidad',
      'direccion' => 'Dirección',
      'telefono_principal' => 'Teléfono principal',
      'tipo_sangre' => 'Tipo de sangre'
    ];

    foreach ($camposRequeridos as $campo => $nombre) {
      if (empty($data[$campo])) {
        $errores[$campo] = "El campo {$nombre} es requerido";
      }
    }

    // Validar formatos de texto
    $errorPrimerNombre = $this->validarTextoEspanol('primer_nombre', $data['primer_nombre'], true);
    if ($errorPrimerNombre) $errores['primer_nombre'] = $errorPrimerNombre;

    $errorSegundoNombre = $this->validarTextoEspanol('segundo_nombre', $data['segundo_nombre'], false);
    if ($errorSegundoNombre) $errores['segundo_nombre'] = $errorSegundoNombre;

    $errorPrimerApellido = $this->validarTextoEspanol('primer_apellido', $data['primer_apellido'], true);
    if ($errorPrimerApellido) $errores['primer_apellido'] = $errorPrimerApellido;

    $errorSegundoApellido = $this->validarTextoEspanol('segundo_apellido', $data['segundo_apellido'], false);
    if ($errorSegundoApellido) $errores['segundo_apellido'] = $errorSegundoApellido;

    $errorNacionalidad = $this->validarTextoEspanol('nacionalidad', $data['nacionalidad'], true);
    if ($errorNacionalidad) $errores['nacionalidad'] = $errorNacionalidad;

    // Validar cédula (solo números y letras)
    if (!empty($data['cedula']) && !preg_match('/^[a-zA-Z0-9]+$/', $data['cedula'])) {
      $errores['cedula'] = 'La cédula solo puede contener números y letras';
    }

    // Validar email si se proporciona
    if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
      $errores['email'] = 'El formato del email no es válido';
    }

    // Validar teléfonos (solo números, espacios, +, -)
    if (!empty($data['telefono_principal']) && !preg_match('/^[0-9+\-\s]+$/', $data['telefono_principal'])) {
      $errores['telefono_principal'] = 'El teléfono principal contiene caracteres inválidos';
    }

    if (!empty($data['telefono_secundario']) && !preg_match('/^[0-9+\-\s]+$/', $data['telefono_secundario'])) {
      $errores['telefono_secundario'] = 'El teléfono secundario contiene caracteres inválidos';
    }

    // Validar fecha de nacimiento
    if (!empty($data['fecha_nacimiento'])) {
      $fechaNacimiento = DateTime::createFromFormat('Y-m-d', $data['fecha_nacimiento']);
      if (!$fechaNacimiento || $fechaNacimiento->format('Y-m-d') !== $data['fecha_nacimiento']) {
        $errores['fecha_nacimiento'] = 'La fecha de nacimiento no es válida';
      } else {
        $errorEdad = $this->validarEdad($data['fecha_nacimiento']);
        if ($errorEdad) $errores['fecha_nacimiento'] = $errorEdad;
      }
    }

    // Validar género
    if (!empty($data['genero']) && !in_array($data['genero'], ['M', 'F'])) {
      $errores['genero'] = 'El género debe ser M (Masculino) o F (Femenino)';
    }

    // Validar tipo de sangre
    $tiposSangreValidos = ['No sabe', 'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
    if (!empty($data['tipo_sangre']) && !in_array($data['tipo_sangre'], $tiposSangreValidos)) {
      $errores['tipo_sangre'] = 'Tipo de sangre no válido';
    }

    return $errores;
  }

  /**
   * Validar datos específicos de personal
   */
  private function validarDatosPersonal($data)
  {
    $errores = [];

    // Validar campos requeridos
    if (empty($data['fk_cargo'])) {
      $errores['fk_cargo'] = 'El cargo es requerido';
    }

    if (empty($data['fk_funcion'])) {
      $errores['fk_funcion'] = 'La función es requerida';
    }

    if (empty($data['fecha_contratacion'])) {
      $errores['fecha_contratacion'] = 'La fecha de contratación es requerida';
    }

    // Validar fecha de contratación
    if (!empty($data['fecha_contratacion'])) {
      $fechaContratacion = DateTime::createFromFormat('Y-m-d', $data['fecha_contratacion']);
      if (!$fechaContratacion || $fechaContratacion->format('Y-m-d') !== $data['fecha_contratacion']) {
        $errores['fecha_contratacion'] = 'La fecha de contratación no es válida';
      } else {
        // Validar que la fecha de contratación no sea futura
        $hoy = new DateTime();
        if ($fechaContratacion > $hoy) {
          $errores['fecha_contratacion'] = 'La fecha de contratación no puede ser futura';
        }
      }
    }

    // Validar horas de trabajo (si se proporciona)
    if (!empty($data['horas_trabajo']) && (!is_numeric($data['horas_trabajo']) || $data['horas_trabajo'] < 0 || $data['horas_trabajo'] > 168)) {
      $errores['horas_trabajo'] = 'Las horas de trabajo deben ser un número entre 0 y 168';
    }

    // Validar cantidad de hijos (si se proporciona)
    if (!empty($data['cantidad_hijas']) && (!is_numeric($data['cantidad_hijas']) || $data['cantidad_hijas'] < 0)) {
      $errores['cantidad_hijas'] = 'La cantidad de hijas debe ser un número positivo';
    }

    if (!empty($data['cantidad_hijos_varones']) && (!is_numeric($data['cantidad_hijos_varones']) || $data['cantidad_hijos_varones'] < 0)) {
      $errores['cantidad_hijos_varones'] = 'La cantidad de hijos varones debe ser un número positivo';
    }

    return $errores;
  }

  // ============================ OPERACIONES DE PERSONAL ============================

  /**
   * Listar todo el personal
   */
  public function listarPersonal()
  {
    try {
      $pdo = Conexion::obtener();
      $personal = Personal::consultarTodoElPersonal($pdo);

      $this->sendJsonResponse(200, 'success', 'Personal obtenido exitosamente.', $personal);
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error al obtener el personal: ' . $e->getMessage());
    }
  }

  /**
   * Listar personas disponibles para asignar como personal
   */
  public function listarPersonasParaPersonal()
  {
    try {
      $pdo = Conexion::obtener();
      $personas = Personal::consultarPersonasParaPersonal($pdo);

      $this->sendJsonResponse(200, 'success', 'Personas para personal obtenidas exitosamente.', $personas);
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error al obtener las personas para personal: ' . $e->getMessage());
    }
  }

  /**
   * Obtener información completa de personal por ID
   */
  public function obtenerPersonalCompleto($id_personal)
  {
    try {
      $pdo = Conexion::obtener();
      $personal = Personal::obtenerPersonalCompleto($pdo, $id_personal);

      if ($personal) {
        $this->sendJsonResponse(200, 'success', 'Personal obtenido exitosamente.', $personal);
      } else {
        $this->sendJsonResponse(404, 'error', 'Personal no encontrado.');
      }
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error al obtener el personal: ' . $e->getMessage());
    }
  }

  /**
   * Crear nueva persona (parte 1 - datos básicos)
   */
  public function crearPersona()
  {
    try {
      $data = $this->parseJsonInput();

      // Validar datos de persona
      $errores = $this->validarDatosPersona($data);

      // Validar cédula única
      if (!empty($data['cedula']) && empty($errores['cedula'])) {
        $pdo = Conexion::obtener();
        if (Personal::verificarCedulaExistente($pdo, $data['cedula'])) {
          $errores['cedula'] = 'La cédula ya está registrada';
        }
      }

      if (!empty($errores)) {
        $this->sendJsonResponse(400, 'error', 'Datos inválidos en la solicitud.', null, $errores);
        return;
      }

      $pdo = Conexion::obtener();

      // Crear persona con estado "incompleto" y tipo "personal"
      $personaData = [
        'primer_nombre' => $data['primer_nombre'],
        'segundo_nombre' => $data['segundo_nombre'] ?? null,
        'primer_apellido' => $data['primer_apellido'],
        'segundo_apellido' => $data['segundo_apellido'] ?? null,
        'fecha_nacimiento' => $data['fecha_nacimiento'],
        'genero' => $data['genero'],
        'cedula' => $data['cedula'],
        'nacionalidad' => $data['nacionalidad'],
        'direccion' => $data['direccion'],
        'telefono_principal' => $data['telefono_principal'],
        'telefono_secundario' => $data['telefono_secundario'] ?? null,
        'email' => $data['email'] ?? null,
        'tipo_persona' => 'personal',
        'tipo_sangre' => $data['tipo_sangre'],
        'estado' => 'incompleto'
      ];

      $id_persona = Personal::crearPersona($pdo, $personaData);

      if ($id_persona) {
        // Obtener datos de la persona creada
        $personaCreada = Personal::obtenerPersonaPorId($pdo, $id_persona);
        $this->sendJsonResponse(201, 'success', 'Persona creada exitosamente. Continúe con los datos de personal.', $personaCreada);
      } else {
        throw new Exception('No se pudo crear la persona en la base de datos');
      }
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error en el servidor al crear la persona: ' . $e->getMessage());
    }
  }

  /**
   * Completar datos de personal (parte 2 - datos laborales)
   */
  public function completarPersonal($id_persona)
  {
    try {
      $data = $this->parseJsonInput();

      // Validar datos de personal
      $errores = $this->validarDatosPersonal($data);

      if (!empty($errores)) {
        $this->sendJsonResponse(400, 'error', 'Datos inválidos en la solicitud.', null, $errores);
        return;
      }

      $pdo = Conexion::obtener();

      // Verificar que la persona existe y está en estado incompleto
      $persona = Personal::obtenerPersonaPorId($pdo, $id_persona);
      if (!$persona) {
        $this->sendJsonResponse(404, 'error', 'Persona no encontrada.');
        return;
      }

      if ($persona['estado'] !== 'incompleto') {
        $this->sendJsonResponse(400, 'error', 'La persona ya ha sido completada como personal.');
        return;
      }

      // Crear registro de personal
      $personalData = [
        'fk_persona' => $id_persona,
        'fk_cargo' => $data['fk_cargo'],
        'fk_funcion' => $data['fk_funcion'],
        'fecha_contratacion' => $data['fecha_contratacion'],
        'nivel_academico' => $data['nivel_academico'] ?? null,
        'horas_trabajo' => $data['horas_trabajo'] ?? null,
        'rif' => $data['rif'] ?? null,
        'etnia_religion' => $data['etnia_religion'] ?? null,
        'cantidad_hijas' => $data['cantidad_hijas'] ?? null,
        'cantidad_hijos_varones' => $data['cantidad_hijos_varones'] ?? null,
        'cod_dependencia' => $data['cod_dependencia'] ?? '',
        'estado' => $data['estado'] ?? 'activo'
      ];

      $id_personal = Personal::crearPersonal($pdo, $personalData);

      if ($id_personal) {
        // Actualizar estado de la persona a "activo"
        Personal::actualizarEstadoPersona($pdo, $id_persona, 'activo');

        // Obtener datos completos del personal creado
        $personalCompleto = Personal::obtenerPersonalCompleto($pdo, $id_personal);
        $this->sendJsonResponse(201, 'success', 'Personal creado exitosamente.', $personalCompleto);
      } else {
        throw new Exception('No se pudo crear el personal en la base de datos');
      }
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error en el servidor al crear el personal: ' . $e->getMessage());
    }
  }

  /**
   * Actualizar datos de personal
   */
  public function actualizarPersonal($id_personal)
  {
    try {
      $data = $this->parseJsonInput();

      $errores = [];

      // Validar campos requeridos para personal
      if (empty($data['fk_cargo'])) {
        $errores['fk_cargo'] = 'El cargo es requerido';
      }

      if (empty($data['fk_funcion'])) {
        $errores['fk_funcion'] = 'La función es requerida';
      }

      if (empty($data['fecha_contratacion'])) {
        $errores['fecha_contratacion'] = 'La fecha de contratación es requerida';
      }

      if (empty($data['estado'])) {
        $errores['estado'] = 'El estado es requerido';
      }

      if (!empty($errores)) {
        $this->sendJsonResponse(400, 'error', 'Datos inválidos en la solicitud.', null, $errores);
        return;
      }

      $pdo = Conexion::obtener();

      // Verificar que el personal existe
      $personalExistente = Personal::obtenerPersonalCompleto($pdo, $id_personal);
      if (!$personalExistente) {
        $this->sendJsonResponse(404, 'error', 'Personal no encontrado.');
        return;
      }

      // Actualizar registro de personal
      $personalData = [
        'fk_cargo' => $data['fk_cargo'],
        'fk_funcion' => $data['fk_funcion'],
        'fecha_contratacion' => $data['fecha_contratacion'],
        'nivel_academico' => $data['nivel_academico'] ?? null,
        'horas_trabajo' => $data['horas_trabajo'] ?? null,
        'rif' => $data['rif'] ?? null,
        'etnia_religion' => $data['etnia_religion'] ?? null,
        'cantidad_hijas' => $data['cantidad_hijas'] ?? null,
        'cantidad_hijos_varones' => $data['cantidad_hijos_varones'] ?? null,
        'cod_dependencia' => $data['cod_dependencia'] ?? '',
        'estado' => $data['estado']
      ];

      $actualizado = Personal::actualizarPersonal($pdo, $id_personal, $personalData);

      // Si se envían datos de persona, actualizar también
      if (isset($data['primer_nombre'])) {
        $personaData = [
          'primer_nombre' => $data['primer_nombre'],
          'segundo_nombre' => $data['segundo_nombre'] ?? null,
          'primer_apellido' => $data['primer_apellido'],
          'segundo_apellido' => $data['segundo_apellido'] ?? null,
          'fecha_nacimiento' => $data['fecha_nacimiento'],
          'genero' => $data['genero'],
          'cedula' => $data['cedula'],
          'nacionalidad' => $data['nacionalidad'] ?? 'Venezolana',
          'direccion' => $data['direccion'],
          'telefono_principal' => $data['telefono_principal'],
          'telefono_secundario' => $data['telefono_secundario'] ?? null,
          'email' => $data['email'] ?? null,
          'tipo_sangre' => $data['tipo_sangre'] ?? 'No sabe'
        ];

        // Validar cédula única si cambió
        if ($data['cedula'] !== $personalExistente['cedula']) {
          if (Personal::verificarCedulaExistente($pdo, $data['cedula'], $personalExistente['fk_persona'])) {
            $errores['cedula'] = 'La cédula ya está registrada';
          }
        }

        // Validar email si se proporciona
        if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
          $errores['email'] = 'El formato del email no es válido';
        }

        // Validar fecha de nacimiento
        if (!empty($data['fecha_nacimiento'])) {
          $fechaNacimiento = DateTime::createFromFormat('Y-m-d', $data['fecha_nacimiento']);
          if (!$fechaNacimiento || $fechaNacimiento->format('Y-m-d') !== $data['fecha_nacimiento']) {
            $errores['fecha_nacimiento'] = 'La fecha de nacimiento no es válida';
          } else {
            // Validar edad mínima (18 años)
            $errorEdad = $this->validarEdad($data['fecha_nacimiento']);
            if ($errorEdad) $errores['fecha_nacimiento'] = $errorEdad;
          }
        }

        if (!empty($errores)) {
          $this->sendJsonResponse(400, 'error', 'Datos inválidos en la solicitud.', null, $errores);
          return;
        }

        $actualizadoPersona = Personal::actualizarPersona($pdo, $personalExistente['fk_persona'], $personaData);
        if (!$actualizadoPersona) {
          throw new Exception('No se pudo actualizar la persona en la base de datos');
        }
      }

      if ($actualizado) {
        // Obtener datos actualizados
        $personalActualizado = Personal::obtenerPersonalCompleto($pdo, $id_personal);
        $this->sendJsonResponse(200, 'success', 'Personal actualizado exitosamente.', $personalActualizado);
      } else {
        throw new Exception('No se pudo actualizar el personal en la base de datos');
      }
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error en el servidor al actualizar el personal: ' . $e->getMessage());
    }
  }

  /**
   * Cambiar estado del personal
   */
  public function cambiarEstadoPersonal($id_personal)
  {
    try {
      $data = $this->parseJsonInput();

      if (!isset($data['estado'])) {
        $this->sendJsonResponse(400, 'error', 'El estado es requerido.');
        return;
      }

      // Validar estado
      $estadosValidos = ['activo', 'inactivo', 'suspendido', 'jubilado'];
      if (!in_array($data['estado'], $estadosValidos)) {
        $this->sendJsonResponse(400, 'error', 'Estado no válido. Los estados permitidos son: ' . implode(', ', $estadosValidos));
        return;
      }

      $pdo = Conexion::obtener();

      // Obtener datos del personal para saber la persona asociada
      $personal = Personal::obtenerPersonalCompleto($pdo, $id_personal);
      if (!$personal) {
        $this->sendJsonResponse(404, 'error', 'Personal no encontrado.');
        return;
      }

      // Cambiar estado de la persona
      $actualizado = Personal::cambiarEstadoPersona($pdo, $personal['fk_persona'], $data['estado']);

      if ($actualizado) {
        $this->sendJsonResponse(200, 'success', 'Estado del personal actualizado exitosamente.');
      } else {
        $this->sendJsonResponse(404, 'error', 'Personal no encontrado.');
      }
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error en el servidor al cambiar el estado del personal: ' . $e->getMessage());
    }
  }

  /**
   * Eliminar personal
   */
  public function eliminarPersonal($id_personal)
  {
    try {
      $pdo = Conexion::obtener();

      // Verificar que el personal existe
      $personal = Personal::obtenerPersonalCompleto($pdo, $id_personal);
      if (!$personal) {
        $this->sendJsonResponse(404, 'error', 'Personal no encontrado.');
        return;
      }

      $eliminado = Personal::eliminarPersonal($pdo, $id_personal);

      if ($eliminado) {
        // Cambiar estado de la persona a "inactivo" en lugar de eliminarla
        Personal::cambiarEstadoPersona($pdo, $personal['fk_persona'], 'inactivo');
        $this->sendJsonResponse(200, 'success', 'Personal eliminado exitosamente.');
      } else {
        $this->sendJsonResponse(500, 'error', 'No se pudo eliminar el personal.');
      }
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error en el servidor al eliminar el personal: ' . $e->getMessage());
    }
  }

  // ============================ CONSULTAS ADICIONALES ============================

  /**
   * Listar cargos disponibles
   */
  public function listarCargos()
  {
    try {
      $pdo = Conexion::obtener();
      $cargos = Personal::consultarCargos($pdo);

      $this->sendJsonResponse(200, 'success', 'Cargos obtenidos exitosamente.', $cargos);
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error al obtener los cargos: ' . $e->getMessage());
    }
  }

  /**
   * Listar funciones disponibles
   */
  public function listarFunciones()
  {
    try {
      $pdo = Conexion::obtener();
      $funciones = Personal::consultarFunciones($pdo);

      $this->sendJsonResponse(200, 'success', 'Funciones obtenidas exitosamente.', $funciones);
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error al obtener las funciones: ' . $e->getMessage());
    }
  }

  /**
   * Obtener estadísticas del personal
   */
  public function obtenerEstadisticas()
  {
    try {
      $pdo = Conexion::obtener();

      // Consulta para contar personal por estado
      $sqlEstados = "SELECT estado, COUNT(*) as cantidad FROM personal GROUP BY estado";
      $stmtEstados = $pdo->prepare($sqlEstados);
      $stmtEstados->execute();
      $estados = $stmtEstados->fetchAll(PDO::FETCH_ASSOC);

      // Consulta para contar personal por género
      $sqlGeneros = "SELECT p.genero, COUNT(*) as cantidad 
                          FROM personal per 
                          INNER JOIN personas p ON per.fk_persona = p.id_persona 
                          GROUP BY p.genero";
      $stmtGeneros = $pdo->prepare($sqlGeneros);
      $stmtGeneros->execute();
      $generos = $stmtGeneros->fetchAll(PDO::FETCH_ASSOC);

      // Consulta para contar personal por cargo
      $sqlCargos = "SELECT c.nombre_cargo, COUNT(*) as cantidad 
                         FROM personal per 
                         INNER JOIN cargos c ON per.fk_cargo = c.id_cargo 
                         GROUP BY c.nombre_cargo";
      $stmtCargos = $pdo->prepare($sqlCargos);
      $stmtCargos->execute();
      $cargos = $stmtCargos->fetchAll(PDO::FETCH_ASSOC);

      $estadisticas = [
        'por_estado' => $estados,
        'por_genero' => $generos,
        'por_cargo' => $cargos,
        'total' => array_sum(array_column($estados, 'cantidad'))
      ];

      $this->sendJsonResponse(200, 'success', 'Estadísticas obtenidas exitosamente.', $estadisticas);
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error al obtener las estadísticas: ' . $e->getMessage());
    }
  }
}
