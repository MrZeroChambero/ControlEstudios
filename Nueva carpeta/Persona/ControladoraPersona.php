<?php

namespace Micodigo\Persona;

use Micodigo\Config\Conexion;
use Exception;

class ControladoraPersona
{
  private $persona;

  public function __construct()
  {
    $this->persona = new Persona();
  }

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

  // ============================ OPERACIONES DE PERSONA ============================

  /**
   * Listar todas las personas
   */
  public function listarPersonas()
  {
    try {
      $pdo = Conexion::obtener();
      $filtros = [];

      if (isset($_GET['tipo_persona'])) {
        $filtros['tipo_persona'] = $_GET['tipo_persona'];
      }

      $personas = Persona::consultarTodos($pdo, $filtros);
      $this->sendJsonResponse(200, 'success', 'Personas obtenidas exitosamente.', $personas);
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error del servidor al obtener las personas.');
    }
  }

  /**
   * Obtener una persona por ID
   */
  public function obtenerPersona($id)
  {
    try {
      $pdo = Conexion::obtener();
      $persona = Persona::consultar($pdo, $id);

      if ($persona) {
        $this->sendJsonResponse(200, 'success', 'Persona obtenida exitosamente.', $persona);
      } else {
        $this->sendJsonResponse(404, 'error', 'Persona no encontrada.');
      }
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error del servidor al consultar la persona.');
    }
  }

  /**
   * Crear una nueva persona
   */
  public function crearPersona()
  {
    try {
      $data = $this->parseJsonInput();

      $persona = new Persona($data);
      $pdo = Conexion::obtener();
      $resultado = $persona->crear($pdo);

      if (is_numeric($resultado)) {
        $persona->id_persona = $resultado;
        $this->sendJsonResponse(201, 'success', 'Persona creada exitosamente.', $persona);
      } elseif (is_array($resultado)) {
        $this->sendJsonResponse(400, 'error', 'Error de validación.', null, $resultado);
      } else {
        $this->sendJsonResponse(500, 'error', 'No se pudo crear la persona.');
      }
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error en el servidor: ' . $e->getMessage());
    }
  }

  /**
   * Actualizar una persona existente
   */
  public function actualizarPersona($id)
  {
    try {
      $data = $this->parseJsonInput();

      $pdo = Conexion::obtener();

      // Verificar si la persona existe
      if (!Persona::consultar($pdo, $id)) {
        $this->sendJsonResponse(404, 'error', 'Persona no encontrada.');
        return;
      }

      $persona = new Persona($data);
      $persona->id_persona = $id;
      $resultado = $persona->actualizar($pdo);

      if ($resultado === true) {
        $this->sendJsonResponse(200, 'success', 'Persona actualizada exitosamente.');
      } elseif (is_array($resultado)) {
        $this->sendJsonResponse(400, 'error', 'Error de validación.', null, $resultado);
      } else {
        $this->sendJsonResponse(500, 'error', 'No se pudo actualizar la persona.');
      }
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error en el servidor: ' . $e->getMessage());
    }
  }

  /**
   * Cambiar estado de una persona
   */
  public function cambiarEstadoPersona($id)
  {
    try {
      $data = $this->parseJsonInput();

      if (!isset($data['estado'])) {
        $this->sendJsonResponse(400, 'error', 'El estado es requerido.');
        return;
      }

      $pdo = Conexion::obtener();

      // Verificar si la persona existe
      if (!Persona::consultar($pdo, $id)) {
        $this->sendJsonResponse(404, 'error', 'Persona no encontrada.');
        return;
      }

      $actualizado = Persona::actualizarEstadoPersona($pdo, $id, $data['estado']);

      if ($actualizado) {
        $this->sendJsonResponse(200, 'success', 'Estado de la persona actualizado exitosamente.');
      } else {
        $this->sendJsonResponse(404, 'error', 'Persona no encontrada o el estado ya era el mismo.');
      }
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error en el servidor: ' . $e->getMessage());
    }
  }

  /**
   * Eliminar una persona
   */
  public function eliminarPersona($id)
  {
    try {
      $pdo = Conexion::obtener();

      // Verificar si la persona existe antes de intentar eliminar
      if (!Persona::consultar($pdo, $id)) {
        $this->sendJsonResponse(404, 'error', 'Persona no encontrada.');
        return;
      }

      $resultado = Persona::eliminar($pdo, $id);

      if ($resultado === true) {
        $this->sendJsonResponse(200, 'success', 'Persona eliminada exitosamente.');
      } elseif (is_array($resultado) && isset($resultado['error_fk'])) {
        $this->sendJsonResponse(409, 'error', $resultado['error_fk']);
      } else {
        $this->sendJsonResponse(500, 'error', 'No se pudo eliminar la persona.');
      }
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error en el servidor: ' . $e->getMessage());
    }
  }

  // ============================ OPERACIONES DE PERSONAL ============================

  /**
   * Listar todo el personal
   */
  public function listarPersonal()
  {
    try {
      $pdo = Conexion::obtener();
      $personal = Persona::consultarTodoElPersonal($pdo);

      $this->sendJsonResponse(200, 'success', 'Personal obtenido exitosamente.', $personal);
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error al obtener el personal.');
    }
  }

  /**
   * Listar personas disponibles para asignar como personal
   */
  public function listarPersonasParaPersonal()
  {
    try {
      $pdo = Conexion::obtener();
      $personas = Persona::consultarPersonasParaPersonal($pdo);

      $this->sendJsonResponse(200, 'success', 'Personas para personal obtenidas exitosamente.', $personas);
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error al obtener las personas para personal.');
    }
  }

  /**
   * Obtener información completa de personal por ID
   */
  public function obtenerPersonalCompleto($id_personal)
  {
    try {
      $pdo = Conexion::obtener();
      $personal = Persona::obtenerPersonalCompleto($pdo, $id_personal);

      if ($personal) {
        $this->sendJsonResponse(200, 'success', 'Personal obtenido exitosamente.', $personal);
      } else {
        $this->sendJsonResponse(404, 'error', 'Personal no encontrado.');
      }
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error al obtener el personal.');
    }
  }

  /**
   * Crear nueva persona (parte 1 - datos básicos)
   */
  public function crearPersonaPersonal()
  {
    try {
      $data = $this->parseJsonInput();

      // Validar datos de persona
      $errores = $this->persona->validarDatosPersona($data);

      // Validar cédula única
      if (!empty($data['cedula'])) {
        $pdo = Conexion::obtener();
        if (Persona::verificarCedulaExistente($pdo, $data['cedula'])) {
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

      $id_persona = Persona::crearPersona($pdo, $personaData);

      if ($id_persona) {
        // Obtener datos de la persona creada
        $personaCreada = Persona::obtenerPersonaPorId($pdo, $id_persona);
        $this->sendJsonResponse(201, 'success', 'Persona creada exitosamente. Continúe con los datos de personal.', $personaCreada);
      } else {
        throw new Exception('No se pudo crear la persona en la base de datos');
      }
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error en el servidor al crear la persona.');
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
      $errores = $this->persona->validarDatosPersonal($data);

      if (!empty($errores)) {
        $this->sendJsonResponse(400, 'error', 'Datos inválidos en la solicitud.', null, $errores);
        return;
      }

      $pdo = Conexion::obtener();

      // Verificar que la persona existe y está en estado incompleto
      $persona = Persona::obtenerPersonaPorId($pdo, $id_persona);
      if (!$persona) {
        $this->sendJsonResponse(404, 'error', 'Persona no encontrada.');
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

      $id_personal = Persona::crearPersonal($pdo, $personalData);

      if ($id_personal) {
        // Actualizar estado de la persona a "activo"
        Persona::actualizarEstadoPersona($pdo, $id_persona, 'activo');

        // Obtener datos completos del personal creado
        $personalCompleto = Persona::obtenerPersonalCompleto($pdo, $id_personal);
        $this->sendJsonResponse(201, 'success', 'Personal creado exitosamente.', $personalCompleto);
      } else {
        throw new Exception('No se pudo crear el personal en la base de datos');
      }
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error en el servidor al crear el personal.');
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
      $personalExistente = Persona::obtenerPersonalCompleto($pdo, $id_personal);
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

      $actualizado = Persona::actualizarPersonal($pdo, $id_personal, $personalData);

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
          if (Persona::verificarCedulaExistente($pdo, $data['cedula'], $personalExistente['fk_persona'])) {
            $errores['cedula'] = 'La cédula ya está registrada';
          }
        }

        // Validar email si se proporciona
        if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
          $errores['email'] = 'El formato del email no es válido';
        }

        // Validar fecha de nacimiento
        if (!empty($data['fecha_nacimiento'])) {
          $fechaNacimiento = \DateTime::createFromFormat('Y-m-d', $data['fecha_nacimiento']);
          if (!$fechaNacimiento || $fechaNacimiento->format('Y-m-d') !== $data['fecha_nacimiento']) {
            $errores['fecha_nacimiento'] = 'La fecha de nacimiento no es válida';
          } else {
            // Validar edad mínima (18 años)
            $errorEdad = $this->persona->validarEdad($data['fecha_nacimiento']);
            if ($errorEdad) $errores['fecha_nacimiento'] = $errorEdad;
          }
        }

        if (!empty($errores)) {
          $this->sendJsonResponse(400, 'error', 'Datos inválidos en la solicitud.', null, $errores);
          return;
        }

        $actualizadoPersona = Persona::actualizarPersona($pdo, $personalExistente['fk_persona'], $personaData);
        if (!$actualizadoPersona) {
          throw new Exception('No se pudo actualizar la persona en la base de datos');
        }
      }

      if ($actualizado) {
        // Obtener datos actualizados
        $personalActualizado = Persona::obtenerPersonalCompleto($pdo, $id_personal);
        $this->sendJsonResponse(200, 'success', 'Personal actualizado exitosamente.', $personalActualizado);
      } else {
        throw new Exception('No se pudo actualizar el personal en la base de datos');
      }
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error en el servidor al actualizar el personal.');
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

      $pdo = Conexion::obtener();

      // Obtener datos del personal para saber la persona asociada
      $personal = Persona::obtenerPersonalCompleto($pdo, $id_personal);
      if (!$personal) {
        $this->sendJsonResponse(404, 'error', 'Personal no encontrado.');
        return;
      }

      // Cambiar estado de la persona
      $actualizado = Persona::cambiarEstadoPersona($pdo, $personal['fk_persona'], $data['estado']);

      if ($actualizado) {
        $this->sendJsonResponse(200, 'success', 'Estado del personal actualizado exitosamente.');
      } else {
        $this->sendJsonResponse(404, 'error', 'Personal no encontrado.');
      }
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error en el servidor al cambiar el estado del personal.');
    }
  }

  /**
   * Eliminar personal
   */
  public function eliminarPersonal($id_personal)
  {
    try {
      $pdo = Conexion::obtener();
      $eliminado = Persona::eliminarPersonal($pdo, $id_personal);

      if ($eliminado) {
        $this->sendJsonResponse(200, 'success', 'Personal eliminado exitosamente.');
      } else {
        $this->sendJsonResponse(404, 'error', 'Personal no encontrado.');
      }
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error en el servidor al eliminar el personal.');
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
      $cargos = Persona::consultarCargos($pdo);

      $this->sendJsonResponse(200, 'success', 'Cargos obtenidos exitosamente.', $cargos);
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error al obtener los cargos.');
    }
  }

  /**
   * Listar funciones disponibles
   */
  public function listarFunciones()
  {
    try {
      $pdo = Conexion::obtener();
      $funciones = Persona::consultarFunciones($pdo);

      $this->sendJsonResponse(200, 'success', 'Funciones obtenidas exitosamente.', $funciones);
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error al obtener las funciones.');
    }
  }

  /**
   * Verificar existencia de cédula
   */
  public function verificarCedula($cedula, $id_persona = null)
  {
    try {
      $pdo = Conexion::obtener();
      $existe = Persona::verificarCedulaExistente($pdo, $cedula, $id_persona);

      $this->sendJsonResponse(200, 'success', 'Verificación completada.', [
        'cedula' => $cedula,
        'existe' => $existe,
        'id_persona_excluido' => $id_persona
      ]);
    } catch (Exception $e) {
      $this->sendJsonResponse(500, 'error', 'Error al verificar la cédula.');
    }
  }
}
