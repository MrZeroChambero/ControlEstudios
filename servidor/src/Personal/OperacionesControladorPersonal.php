<?php

namespace Micodigo\Personal;

use Micodigo\Config\Conexion;
use Exception;

trait OperacionesControladorPersonal
{
  public function crearPersona()
  {
    try {
      $data = json_decode(file_get_contents('php://input'), true);
      if (json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());

      $v = $this->crearValidadorPersona($data);
      if (!$v->validate()) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'errors' => $v->errors(), 'message' => 'Datos inválidos.']);
        return;
      }

      $pdo = Conexion::obtener();

      // Datos para personas (registro preliminar para luego completar personal)
      $personaData = [
        'primer_nombre' => trim($data['primer_nombre']),
        'segundo_nombre' => $data['segundo_nombre'] ?? null,
        'primer_apellido' => trim($data['primer_apellido']),
        'segundo_apellido' => $data['segundo_apellido'] ?? null,
        'fecha_nacimiento' => $data['fecha_nacimiento'],
        'genero' => $data['genero'],
        'cedula' => $data['cedula'],
        'nacionalidad' => $data['nacionalidad'] ?? 'Venezolana',
        'direccion' => $data['direccion'],
        'telefono_principal' => $data['telefono_principal'],
        'telefono_secundario' => $data['telefono_secundario'] ?? null,
        'email' => $data['email'] ?? null,
        'tipo_sangre' => $data['tipo_sangre'] ?? 'No sabe',
        'tipo_persona' => 'personal',
        'estado' => 'incompleto'
      ];

      $id_persona = self::crearPersonaBD($pdo, $personaData);
      if (!$id_persona) throw new Exception('No se pudo crear la persona.');

      $nueva = self::obtenerPersonaPorId($pdo, $id_persona);
      if ($nueva) {
        $nueva['estado_persona_nombre'] = $this->nombreEstadoPersona($nueva['estado_persona'] ?? $nueva['estado'] ?? null);
      }

      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $nueva, 'message' => 'Persona creada exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al crear persona.', 'error_details' => $e->getMessage()]);
    }
  }

  public function listarPersonasParaPersonal()
  {
    try {
      $pdo = Conexion::obtener();
      $personas = self::consultarPersonasParaPersonal($pdo);
      foreach ($personas as &$p) {
        $p['estado_persona_nombre'] = $this->nombreEstadoPersona($p['estado_persona'] ?? $p['estado'] ?? null);
      }
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $personas, 'message' => 'Personas obtenidas exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al listar personas.', 'error_details' => $e->getMessage()]);
    }
  }

  public function listarPersonal()
  {
    try {
      $pdo = Conexion::obtener();
      $personal = self::consultarTodoElPersonal($pdo);
      // Añadir nombres de estado y mantener compatibilidad con 'estado' = estado_persona
      foreach ($personal as &$row) {
        $row['estado_persona_nombre'] = $this->nombreEstadoPersona($row['estado_persona'] ?? null);
        $row['estado_personal_nombre'] = $this->nombreEstadoPersonal($row['estado_personal'] ?? null);
        // Campo legacy para frontend: usar persona.estado
        $row['estado'] = $row['estado_persona'];
      }
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $personal, 'message' => 'Personal obtenido exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al obtener el personal.', 'error_details' => $e->getMessage()]);
    }
  }

  public function obtenerPersonalCompleto($id_personal)
  {
    try {
      $pdo = Conexion::obtener();
      $personal = self::obtenerPersonalCompletoDatos($pdo, $id_personal);
      if ($personal) {
        $personal['estado_persona_nombre'] = $this->nombreEstadoPersona($personal['estado_persona'] ?? null);
        $personal['estado_personal_nombre'] = $this->nombreEstadoPersonal($personal['estado_personal'] ?? null);
        $personal['estado'] = $personal['estado_persona']; // compatibilidad
        header('Content-Type: application/json');
        echo json_encode(['back' => true, 'data' => $personal, 'message' => 'Personal obtenido exitosamente.']);
      } else {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'message' => 'Personal no encontrado.']);
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al obtener el personal.', 'error_details' => $e->getMessage()]);
    }
  }

  public function completarPersonal($id_persona)
  {
    try {
      $data = json_decode(file_get_contents('php://input'), true);
      if (json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());

      $v = $this->crearValidadorPersonal($data);
      if (!$v->validate()) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'errors' => $v->errors(), 'message' => 'Datos inválidos.']);
        return;
      }

      $pdo = Conexion::obtener();
      $persona = self::obtenerPersonaPorId($pdo, $id_persona);
      if (!$persona) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'message' => 'Persona no encontrada.']);
        return;
      }

      // Estado del personal siempre 'activo' al completar
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
        'estado' => 'activo'
      ];
      $id_personal = self::crearPersonal($pdo, $personalData);
      self::actualizarEstadoPersona($pdo, $id_persona, 'activo');
      $personalCompleto = self::obtenerPersonalCompletoDatos($pdo, $id_personal);
      if ($personalCompleto) {
        $personalCompleto['estado_persona_nombre'] = $this->nombreEstadoPersona($personalCompleto['estado_persona'] ?? null);
        $personalCompleto['estado_personal_nombre'] = $this->nombreEstadoPersonal($personalCompleto['estado_personal'] ?? null);
        $personalCompleto['estado'] = $personalCompleto['estado_persona'];
      }

      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $personalCompleto, 'message' => 'Personal creado exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al crear personal.', 'error_details' => $e->getMessage()]);
    }
  }

  public function actualizarPersonal($id_personal)
  {
    try {
      $data = json_decode(file_get_contents('php://input'), true);
      if (json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());

      $pdo = Conexion::obtener();
      $existente = self::obtenerPersonalCompletoDatos($pdo, $id_personal);
      if (!$existente) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'message' => 'Personal no encontrado.']);
        return;
      }

      $vPersonal = $this->crearValidadorPersonal($data);
      $errores = [];
      if (!$vPersonal->validate()) $errores = $vPersonal->errors();

      $camposPersona = ['primer_nombre', 'primer_apellido', 'fecha_nacimiento', 'genero', 'cedula', 'nacionalidad', 'direccion', 'telefono_principal', 'tipo_sangre'];
      $hayDatosPersona = false;
      foreach ($camposPersona as $c) {
        if (array_key_exists($c, $data)) {
          $hayDatosPersona = true;
          break;
        }
      }
      if ($hayDatosPersona) {
        foreach ($camposPersona as $c) if (!isset($data[$c])) $data[$c] = $existente[$c] ?? null;
        $vPersona = $this->crearValidadorPersona($data, $existente['fk_persona']);
        if (!$vPersona->validate()) {
          foreach ($vPersona->errors() as $k => $arr) {
            $errores[$k] = isset($errores[$k]) ? array_merge($errores[$k], $arr) : $arr;
          }
        }
        $this->validarEdadMayor($errores, $data['fecha_nacimiento'] ?? null);
      }

      if (!empty($errores)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'errors' => $errores, 'message' => 'Datos inválidos.']);
        return;
      }

      // No permitir cambio de estado del personal aquí (se mantiene el existente)
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
        'estado' => $existente['estado_personal'] // fijo
      ];
      $okPersonal = self::actualizarPersonalBD($pdo, $id_personal, $personalData);

      if ($hayDatosPersona) {
        $personaData = [
          'primer_nombre' => $data['primer_nombre'],
          'segundo_nombre' => $data['segundo_nombre'] ?? $existente['segundo_nombre'],
          'primer_apellido' => $data['primer_apellido'],
          'segundo_apellido' => $data['segundo_apellido'] ?? $existente['segundo_apellido'],
          'fecha_nacimiento' => $data['fecha_nacimiento'],
          'genero' => $data['genero'],
          'cedula' => $data['cedula'],
          'nacionalidad' => $data['nacionalidad'],
          'direccion' => $data['direccion'],
          'telefono_principal' => $data['telefono_principal'],
          'telefono_secundario' => $data['telefono_secundario'] ?? $existente['telefono_secundario'],
          'email' => $data['email'] ?? $existente['email'],
          'tipo_sangre' => $data['tipo_sangre']
        ];
        $okPersona = self::actualizarPersona($pdo, $existente['fk_persona'], $personaData);
        if (!$okPersona) throw new Exception('No se pudo actualizar datos de persona');
      }

      if ($okPersonal) {
        $actualizado = self::obtenerPersonalCompletoDatos($pdo, $id_personal);
        if ($actualizado) {
          $actualizado['estado_persona_nombre'] = $this->nombreEstadoPersona($actualizado['estado_persona'] ?? null);
          $actualizado['estado_personal_nombre'] = $this->nombreEstadoPersonal($actualizado['estado_personal'] ?? null);
          $actualizado['estado'] = $actualizado['estado_persona'];
        }
        header('Content-Type: application/json');
        echo json_encode(['back' => true, 'data' => $actualizado, 'message' => 'Personal actualizado exitosamente.']);
      } else {
        throw new Exception('No se pudo actualizar personal');
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al actualizar personal.', 'error_details' => $e->getMessage()]);
    }
  }

  public function cambiarEstadoPersonal($id_personal)
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);
      if (!isset($data['estado'])) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'message' => 'El estado es requerido.']);
        return;
      }
      $pdo = Conexion::obtener();
      $personal = self::obtenerPersonalCompletoDatos($pdo, $id_personal);
      if (!$personal) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'message' => 'Personal no encontrado.']);
        return;
      }
      // Cambiar SOLO estado de persona (personas.estado)
      $actualizado = self::cambiarEstadoPersona($pdo, $personal['fk_persona'], $data['estado']);
      if ($actualizado) {
        header('Content-Type: application/json');
        echo json_encode(['back' => true, 'message' => 'Estado de la persona asociado al personal actualizado.']);
      } else {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'message' => 'No se pudo actualizar el estado.']);
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al cambiar estado.', 'error_details' => $e->getMessage()]);
    }
  }

  public function listarCargos()
  {
    try {
      $pdo = Conexion::obtener();
      $cargos = self::consultarCargos($pdo);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $cargos, 'message' => 'Cargos obtenidos exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al obtener los cargos.', 'error_details' => $e->getMessage()]);
    }
  }

  public function listarFunciones()
  {
    try {
      $pdo = Conexion::obtener();
      $funciones = self::consultarFunciones($pdo);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $funciones, 'message' => 'Funciones obtenidas exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al obtener las funciones.', 'error_details' => $e->getMessage()]);
    }
  }

  public function eliminarPersonal($id_personal)
  {
    try {
      $pdo = Conexion::obtener();
      $existente = self::obtenerPersonalCompletoDatos($pdo, $id_personal);
      if (!$existente) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'message' => 'Personal no encontrado.']);
        return;
      }
      $ok = self::eliminarPersonalBD($pdo, $id_personal);
      if ($ok) {
        header('Content-Type: application/json');
        echo json_encode(['back' => true, 'message' => 'Personal eliminado exitosamente.']);
      } else {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'message' => 'No se pudo eliminar el personal.']);
      }
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al eliminar personal.', 'error_details' => $e->getMessage()]);
    }
  }
}
