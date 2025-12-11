<?php

namespace Micodigo\Representate;

use Micodigo\Config\Conexion;
use Micodigo\Persona\Persona;
use Micodigo\Estudiante\Estudiante as EstudianteModel;
use Exception;
use PDO;

trait OperacionesControladorRepresentante
{
  public function crearRepresentante()
  {
    try {
      $data = json_decode(file_get_contents('php://input'), true);
      if (json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());

      $pdo = Conexion::obtener();

      // Si nos pasan id_persona usamos persona existente
      if (!empty($data['id_persona'])) {
        $persona = Persona::consultar($pdo, $data['id_persona']);
        if (!$persona) throw new Exception('Persona no encontrada');

        // validar edad >=16
        $edad = null;
        if (!empty($persona['fecha_nacimiento'])) {
          $edad = (new \DateTime())->diff(new \DateTime($persona['fecha_nacimiento']))->y;
        }
        if ($edad === null || $edad < 16) throw new Exception('La persona debe tener al menos 16 años');

        // Si es estudiante, cambiar tipo a representante
        if (($persona['tipo_persona'] ?? '') === 'estudiante') {
          $stmt = $pdo->prepare('UPDATE personas SET tipo_persona = ? WHERE id_persona = ?');
          $stmt->execute(['representante', $data['id_persona']]);
        }

        // Crear registro representante
        $repData = [
          'fk_persona' => $data['id_persona'],
          'oficio' => $data['oficio'] ?? null,
          'nivel_educativo' => $data['nivel_educativo'] ?? null,
          'profesion' => $data['profesion'] ?? null,
          'lugar_trabajo' => $data['lugar_trabajo'] ?? null
        ];
        $id = self::crearRepresentanteBD($pdo, $repData);

        // Asegurar estado activo en persona
        $stmt = $pdo->prepare('UPDATE personas SET estado = ? WHERE id_persona = ?');
        $stmt->execute(['activo', $data['id_persona']]);

        header('Content-Type: application/json');
        echo json_encode(['back' => true, 'data' => ['id_representante' => (int)$id], 'message' => 'Representante creado para persona existente.']);
        return;
      }

      // Crear persona nueva tipo representante con estado incompleto (se activará luego)
      $email = array_key_exists('email', $data) ? trim((string) $data['email']) : null;
      $personaData = [
        'primer_nombre' => $data['primer_nombre'] ?? null,
        'segundo_nombre' => $data['segundo_nombre'] ?? null,
        'primer_apellido' => $data['primer_apellido'] ?? null,
        'segundo_apellido' => $data['segundo_apellido'] ?? null,
        'fecha_nacimiento' => $data['fecha_nacimiento'] ?? null,
        'genero' => $data['genero'] ?? null,
        'cedula' => $data['cedula'] ?? null,
        'nacionalidad' => $data['nacionalidad'] ?? null,
        'direccion' => $data['direccion'] ?? null,
        'telefono_principal' => $data['telefono_principal'] ?? null,
        'telefono_secundario' => $data['telefono_secundario'] ?? null,
        'email' => $email === '' ? null : $email,
        'tipo_persona' => 'representante',
        'tipo_sangre' => $data['tipo_sangre'] ?? null,
        'estado' => 'incompleto'
      ];

      // Validar edad mínima 16
      if (empty($personaData['fecha_nacimiento'])) throw new Exception('Fecha de nacimiento requerida');
      $edad = (new \DateTime())->diff(new \DateTime($personaData['fecha_nacimiento']))->y;
      if ($edad < 16) throw new Exception('La persona debe tener al menos 16 años');

      // Crear persona
      $persona = new Persona($personaData);
      $resultado = $persona->crear(Conexion::obtener());
      if (!is_numeric($resultado)) {
        // devolver errores de validación si ofrece
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'message' => 'Error validación persona', 'errors' => $resultado]);
        return;
      }
      $id_persona = $resultado;

      // Crear representante
      $repData = [
        'fk_persona' => $id_persona,
        'oficio' => $data['oficio'] ?? null,
        'nivel_educativo' => $data['nivel_educativo'] ?? null,
        'profesion' => $data['profesion'] ?? null,
        'lugar_trabajo' => $data['lugar_trabajo'] ?? null
      ];
      $id_rep = self::crearRepresentanteBD($pdo, $repData);

      // Activar persona (regla: al crear representante persona pasa a 'activo')
      $stmtAct = $pdo->prepare('UPDATE personas SET estado = ? WHERE id_persona = ?');
      $stmtAct->execute(['activo', $id_persona]);

      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => ['id_representante' => (int)$id_rep, 'id_persona' => (int)$id_persona], 'message' => 'Representante creado.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al crear representante.', 'error_details' => $e->getMessage()]);
    }
  }

  public function listarRepresentantes()
  {
    try {
      $pdo = Conexion::obtener();
      $lista = self::consultarTodos($pdo);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $lista, 'message' => 'Representantes obtenidos.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al listar representantes.', 'error_details' => $e->getMessage()]);
    }
  }

  public function listarPersonasCandidatas()
  {
    try {
      $pdo = Conexion::obtener();
      $lista = self::consultarPersonasParaRepresentante($pdo);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $lista, 'message' => 'Personas candidatas obtenidas.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al listar personas candidatas.', 'error_details' => $e->getMessage()]);
    }
  }

  public function obtenerRepresentanteCompleto($id_representante)
  {
    try {
      $pdo = Conexion::obtener();
      $datos = self::obtenerRepresentantePorId($pdo, $id_representante);
      if ($datos) {
        $id_persona = (int)$datos['fk_persona'];

        // Habilidades asociadas al representante
        $stmtHab = $pdo->prepare('SELECT id_habilidad, nombre_habilidad FROM habilidades WHERE fk_representante = ? ORDER BY nombre_habilidad');
        $stmtHab->execute([(int)$id_representante]);
        $datos['habilidades'] = $stmtHab->fetchAll(PDO::FETCH_ASSOC) ?: [];

        // Personal (si existe)
        $stmtPer = $pdo->prepare("SELECT per.*, c.nombre_cargo, fp.nombre AS nombre_funcion
                                   FROM personal per
                                   LEFT JOIN cargos c ON per.fk_cargo = c.id_cargo
                                   LEFT JOIN funcion_personal fp ON per.fk_funcion = fp.id_funcion_personal
                                   WHERE per.fk_persona = ? LIMIT 1");
        $stmtPer->execute([$id_persona]);
        $personal = $stmtPer->fetch(PDO::FETCH_ASSOC);
        if ($personal) $datos['personal'] = $personal;

        // Estudiante (si existe)
        $stmtEst = $pdo->prepare('SELECT id_estudiante FROM estudiantes WHERE id_persona = ? LIMIT 1');
        $stmtEst->execute([$id_persona]);
        $estudianteRow = $stmtEst->fetch(PDO::FETCH_ASSOC);
        if ($estudianteRow) {
          $detallesEstudiante = EstudianteModel::consultarEstudiantePorId($pdo, (int)$estudianteRow['id_estudiante']);
          if ($detallesEstudiante) {
            $datos['estudiante'] = $detallesEstudiante;
            $datos['alergias'] = $detallesEstudiante['alergias'] ?? [];
            $datos['vacunas'] = $detallesEstudiante['vacunas'] ?? [];
            $datos['documentos'] = $detallesEstudiante['documentos'] ?? [];
            $datos['condiciones_salud'] = $detallesEstudiante['condiciones_salud'] ?? [];
            $datos['consultas_medicas'] = $detallesEstudiante['consultas_medicas'] ?? [];
          }
        } else {
          $datos['alergias'] = [];
          $datos['vacunas'] = [];
          $datos['documentos'] = [];
          $datos['condiciones_salud'] = [];
          $datos['consultas_medicas'] = [];
        }

        // Otros representantes asociados por parentesco (si existen estudiantes vinculados a este representante)
        // (Consulta básica: estudiantes que tengan parentesco con este representante)
        $stmtFam = $pdo->prepare("SELECT e.id_estudiante, p.primer_nombre, p.primer_apellido, p.cedula
                                   FROM parentesco par
                                   INNER JOIN estudiantes e ON par.fk_estudiante = e.id_estudiante
                                   INNER JOIN personas p ON e.id_persona = p.id_persona
                                   WHERE par.fk_representante = ?");
        $stmtFam->execute([(int)$id_representante]);
        $familia = $stmtFam->fetchAll(PDO::FETCH_ASSOC);
        if ($familia && count($familia) > 0) $datos['estudiantes_familia'] = $familia;
      }
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $datos, 'message' => 'Representante obtenido.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al obtener representante.', 'error_details' => $e->getMessage()]);
    }
  }

  public function actualizarRepresentante($id_representante)
  {
    try {
      $data = json_decode(file_get_contents('php://input'), true) ?? [];
      $pdo = Conexion::obtener();
      $ok = self::actualizarRepresentanteBD($pdo, $id_representante, $data);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => ['updated' => (bool)$ok], 'message' => 'Representante actualizado.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al actualizar representante.', 'error_details' => $e->getMessage()]);
    }
  }

  public function eliminarRepresentante($id_representante)
  {
    try {
      $pdo = Conexion::obtener();
      $ok = self::eliminarRepresentanteBD($pdo, $id_representante);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => ['deleted' => (bool)$ok], 'message' => 'Representante eliminado.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al eliminar representante.', 'error_details' => $e->getMessage()]);
    }
  }
}
