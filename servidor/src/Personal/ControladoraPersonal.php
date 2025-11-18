<?php

namespace Micodigo\Personal;

use Micodigo\Config\Conexion;
use Micodigo\Persona\Persona;
use Valitron\Validator;
use Exception;
use DateTime;

class ControladoraPersonal
{
  public function __construct()
  {
    Validator::lang('es');
  }

  private function limpiarTexto($texto)
  {
    if ($texto === null) return null;
    $texto = trim($texto);
    $texto = preg_replace('/\s+/', ' ', $texto);
    return $texto === '' ? null : $texto;
  }

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

  private function validarEdad($fechaNacimiento)
  {
    $hoy = new DateTime();
    $nacimiento = DateTime::createFromFormat('Y-m-d', $fechaNacimiento);
    $edad = $hoy->diff($nacimiento)->y;

    if ($edad < 18) {
      return "La persona debe ser mayor de 18 años";
    }

    return null;
  }

  // Listar todo el personal
  public function listarPersonal()
  {
    try {
      $pdo = Conexion::obtener();
      $personal = Personal::consultarTodoElPersonal($pdo);

      header('Content-Type: application/json');
      echo json_encode([
        'back' => true,
        'data' => $personal,
        'message' => 'Personal obtenido exitosamente.'
      ]);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error al obtener el personal.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  // Listar personas para select (incompletas o estudiantes/representantes mayores de 18 años)
  public function listarPersonasParaPersonal()
  {
    try {
      $pdo = Conexion::obtener();
      $personas = Personal::consultarPersonasParaPersonal($pdo);

      header('Content-Type: application/json');
      echo json_encode([
        'back' => true,
        'data' => $personas,
        'message' => 'Personas para personal obtenidas exitosamente.'
      ]);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error al obtener las personas para personal.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  // Obtener personal completo por ID
  public function obtenerPersonalCompleto($id_personal)
  {
    try {
      $pdo = Conexion::obtener();
      $personal = Personal::obtenerPersonalCompleto($pdo, $id_personal);

      if ($personal) {
        header('Content-Type: application/json');
        echo json_encode([
          'back' => true,
          'data' => $personal,
          'message' => 'Personal obtenido exitosamente.'
        ]);
      } else {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Personal no encontrado.'
        ]);
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error al obtener el personal.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  // Crear nueva persona (parte 1)
  public function crearPersona()
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);

      if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error en el formato JSON: ' . json_last_error_msg());
      }

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

      $errores = [];

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

      // Validar formatos
      $errorPrimerNombre = $this->validarTextoEspanol('primer_nombre', $data['primer_nombre'], true);
      if ($errorPrimerNombre) $errores['primer_nombre'] = $errorPrimerNombre;

      $errorPrimerApellido = $this->validarTextoEspanol('primer_apellido', $data['primer_apellido'], true);
      if ($errorPrimerApellido) $errores['primer_apellido'] = $errorPrimerApellido;

      // Validar cédula única
      if (!empty($data['cedula'])) {
        $pdo = Conexion::obtener();
        if (Personal::verificarCedulaExistente($pdo, $data['cedula'])) {
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
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'errors' => $errores,
          'message' => 'Datos inválidos en la solicitud.'
        ]);
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

        header('Content-Type: application/json');
        echo json_encode([
          'back' => true,
          'data' => $personaCreada,
          'message' => 'Persona creada exitosamente. Continúe con los datos de personal.'
        ]);
      } else {
        throw new Exception('No se pudo crear la persona en la base de datos');
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error en el servidor al crear la persona.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  // Completar datos de personal (parte 2)
  public function completarPersonal($id_persona)
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);

      if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error en el formato JSON: ' . json_last_error_msg());
      }

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

      if (!empty($errores)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'errors' => $errores,
          'message' => 'Datos inválidos en la solicitud.'
        ]);
        return;
      }

      $pdo = Conexion::obtener();

      // Verificar que la persona existe y está en estado incompleto
      $persona = Personal::obtenerPersonaPorId($pdo, $id_persona);
      if (!$persona) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Persona no encontrada.'
        ]);
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

        header('Content-Type: application/json');
        echo json_encode([
          'back' => true,
          'data' => $personalCompleto,
          'message' => 'Personal creado exitosamente.'
        ]);
      } else {
        throw new Exception('No se pudo crear el personal en la base de datos');
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error en el servidor al crear el personal.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  // Actualizar personal (CORREGIDO)
  public function actualizarPersonal($id_personal)
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);

      if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error en el formato JSON: ' . json_last_error_msg());
      }

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

      // Validar campos de persona si se envían
      if (isset($data['primer_nombre']) && empty($data['primer_nombre'])) {
        $errores['primer_nombre'] = 'El primer nombre es requerido';
      }

      if (isset($data['primer_apellido']) && empty($data['primer_apellido'])) {
        $errores['primer_apellido'] = 'El primer apellido es requerido';
      }

      if (isset($data['cedula']) && empty($data['cedula'])) {
        $errores['cedula'] = 'La cédula es requerida';
      }

      if (isset($data['fecha_nacimiento']) && empty($data['fecha_nacimiento'])) {
        $errores['fecha_nacimiento'] = 'La fecha de nacimiento es requerida';
      }

      if (isset($data['genero']) && empty($data['genero'])) {
        $errores['genero'] = 'El género es requerido';
      }

      if (isset($data['direccion']) && empty($data['direccion'])) {
        $errores['direccion'] = 'La dirección es requerida';
      }

      if (isset($data['telefono_principal']) && empty($data['telefono_principal'])) {
        $errores['telefono_principal'] = 'El teléfono principal es requerido';
      }

      if (!empty($errores)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'errors' => $errores,
          'message' => 'Datos inválidos en la solicitud.'
        ]);
        return;
      }

      $pdo = Conexion::obtener();

      // Verificar que el personal existe
      $personalExistente = Personal::obtenerPersonalCompleto($pdo, $id_personal);
      if (!$personalExistente) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Personal no encontrado.'
        ]);
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
          http_response_code(400);
          header('Content-Type: application/json');
          echo json_encode([
            'back' => false,
            'errors' => $errores,
            'message' => 'Datos inválidos en la solicitud.'
          ]);
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

        header('Content-Type: application/json');
        echo json_encode([
          'back' => true,
          'data' => $personalActualizado,
          'message' => 'Personal actualizado exitosamente.'
        ]);
      } else {
        throw new Exception('No se pudo actualizar el personal en la base de datos');
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error en el servidor al actualizar el personal.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  // Cambiar estado del personal (ahora cambia estado de persona)
  public function cambiarEstadoPersonal($id_personal)
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);

      if (!isset($data['estado'])) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'El estado es requerido.'
        ]);
        return;
      }

      $pdo = Conexion::obtener();

      // Obtener datos del personal para saber la persona asociada
      $personal = Personal::obtenerPersonalCompleto($pdo, $id_personal);
      if (!$personal) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Personal no encontrado.'
        ]);
        return;
      }

      // Cambiar estado de la persona
      $actualizado = Personal::cambiarEstadoPersona($pdo, $personal['fk_persona'], $data['estado']);

      if ($actualizado) {
        header('Content-Type: application/json');
        echo json_encode([
          'back' => true,
          'message' => 'Estado del personal actualizado exitosamente.'
        ]);
      } else {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Personal no encontrado.'
        ]);
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error en el servidor al cambiar el estado del personal.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  // Eliminar personal
  public function eliminarPersonal($id_personal)
  {
    try {
      $pdo = Conexion::obtener();
      $eliminado = Personal::eliminarPersonal($pdo, $id_personal);

      if ($eliminado) {
        header('Content-Type: application/json');
        echo json_encode([
          'back' => true,
          'message' => 'Personal eliminado exitosamente.'
        ]);
      } else {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
          'back' => false,
          'message' => 'Personal no encontrado.'
        ]);
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error en el servidor al eliminar el personal.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  // Listar cargos para select
  public function listarCargos()
  {
    try {
      $pdo = Conexion::obtener();
      $cargos = Personal::consultarCargos($pdo);

      header('Content-Type: application/json');
      echo json_encode([
        'back' => true,
        'data' => $cargos,
        'message' => 'Cargos obtenidos exitosamente.'
      ]);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error al obtener los cargos.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  // Listar funciones para select
  public function listarFunciones()
  {
    try {
      $pdo = Conexion::obtener();
      $funciones = Personal::consultarFunciones($pdo);

      header('Content-Type: application/json');
      echo json_encode([
        'back' => true,
        'data' => $funciones,
        'message' => 'Funciones obtenidas exitosamente.'
      ]);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error al obtener las funciones.',
        'error_details' => $e->getMessage()
      ]);
    }
  }
}
