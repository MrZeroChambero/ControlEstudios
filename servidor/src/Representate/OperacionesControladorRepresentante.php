<?php

namespace Micodigo\Representate;

use Micodigo\Config\Conexion;
use Micodigo\Persona\Persona;
use Micodigo\Estudiante\Estudiante as EstudianteModel;
use Micodigo\Utils\RespuestaJson;
use Exception;
use PDO;
use RuntimeException;

trait OperacionesControladorRepresentante
{
  public function crearRepresentante()
  {
    try {
      $data = $this->leerEntradaJsonRepresentante();
      $pdo = Conexion::obtener();

      if (!empty($data['id_persona'])) {
        $personaId = (int) $data['id_persona'];
        $persona = Persona::consultar($pdo, $personaId);
        if (!$persona) {
          RespuestaJson::error('Persona no encontrada.', 404);
          return;
        }

        $edad = $this->calcularEdad($persona['fecha_nacimiento'] ?? null);
        if ($edad === null || $edad < 16) {
          RespuestaJson::error('La persona debe tener al menos 16 años.', 422);
          return;
        }

        if (($persona['tipo_persona'] ?? '') === 'estudiante') {
          $stmt = $pdo->prepare('UPDATE personas SET tipo_persona = ? WHERE id_persona = ?');
          $stmt->execute(['representante', $personaId]);
        }

        $representanteId = self::crearRepresentanteBD($pdo, [
          'fk_persona' => $personaId,
          'oficio' => $data['oficio'] ?? null,
          'nivel_educativo' => $data['nivel_educativo'] ?? null,
          'profesion' => $data['profesion'] ?? null,
          'lugar_trabajo' => $data['lugar_trabajo'] ?? null,
        ]);

        $stmt = $pdo->prepare('UPDATE personas SET estado = ? WHERE id_persona = ?');
        $stmt->execute(['activo', $personaId]);

        RespuestaJson::exito([
          'id_representante' => (int) $representanteId,
        ], 'Representante creado para persona existente.', 201);
        return;
      }

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
        'estado' => 'incompleto',
      ];

      $edad = $this->calcularEdad($personaData['fecha_nacimiento'] ?? null);
      if ($edad === null) {
        RespuestaJson::error('Fecha de nacimiento requerida.', 422, [
          'fecha_nacimiento' => ['Debe indicar la fecha de nacimiento.'],
        ]);
        return;
      }

      if ($edad < 16) {
        RespuestaJson::error('La persona debe tener al menos 16 años.', 422);
        return;
      }

      $persona = new Persona($personaData);
      $resultado = $persona->crear($pdo);
      if (!is_numeric($resultado)) {
        RespuestaJson::error('Error de validación al crear la persona.', 422, is_array($resultado) ? $resultado : null);
        return;
      }

      $personaId = (int) $resultado;
      $representanteId = self::crearRepresentanteBD($pdo, [
        'fk_persona' => $personaId,
        'oficio' => $data['oficio'] ?? null,
        'nivel_educativo' => $data['nivel_educativo'] ?? null,
        'profesion' => $data['profesion'] ?? null,
        'lugar_trabajo' => $data['lugar_trabajo'] ?? null,
      ]);

      $stmtAct = $pdo->prepare('UPDATE personas SET estado = ? WHERE id_persona = ?');
      $stmtAct->execute(['activo', $personaId]);

      RespuestaJson::exito([
        'id_representante' => (int) $representanteId,
        'id_persona' => $personaId,
      ], 'Representante creado.', 201);
    } catch (RuntimeException $e) {
      $codigo = $e->getCode();
      RespuestaJson::error($e->getMessage(), $codigo > 0 ? $codigo : 400);
    } catch (Exception $e) {
      RespuestaJson::error('Error al crear representante.', 500, null, $e);
    }
  }

  public function listarRepresentantes()
  {
    try {
      $pdo = Conexion::obtener();
      $lista = self::consultarTodos($pdo);
      RespuestaJson::exito($lista, 'Representantes obtenidos.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al listar representantes.', 500, null, $e);
    }
  }

  public function listarPersonasCandidatas()
  {
    try {
      $pdo = Conexion::obtener();
      $lista = self::consultarPersonasParaRepresentante($pdo);
      RespuestaJson::exito($lista, 'Personas candidatas obtenidas.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al listar personas candidatas.', 500, null, $e);
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
        $stmtPer = $pdo->prepare("SELECT per.*, c.nombre_cargo, c.nombre_cargo AS nombre_funcion, c.tipo AS tipo_funcion
                 FROM personal per
                 LEFT JOIN cargos c ON per.fk_cargo = c.id_cargo
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
      RespuestaJson::exito($datos, 'Representante obtenido.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al obtener representante.', 500, null, $e);
    }
  }

  public function actualizarRepresentante($id_representante)
  {
    try {
      $data = $this->leerEntradaJsonRepresentante();
      $pdo = Conexion::obtener();
      $ok = self::actualizarRepresentanteBD($pdo, $id_representante, $data);
      RespuestaJson::exito([
        'updated' => (bool) $ok,
      ], 'Representante actualizado.');
    } catch (RuntimeException $e) {
      RespuestaJson::error($e->getMessage(), 400);
    } catch (Exception $e) {
      RespuestaJson::error('Error al actualizar representante.', 500, null, $e);
    }
  }

  public function eliminarRepresentante($id_representante)
  {
    try {
      $pdo = Conexion::obtener();
      $ok = self::eliminarRepresentanteBD($pdo, $id_representante);
      if (!$ok) {
        RespuestaJson::error('No se pudo eliminar el representante.', 500);
        return;
      }

      RespuestaJson::exito([
        'deleted' => true,
      ], 'Representante eliminado.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al eliminar representante.', 500, null, $e);
    }
  }

  private function leerEntradaJsonRepresentante(): array
  {
    $contenido = file_get_contents('php://input');
    if ($contenido === false) {
      throw new RuntimeException('No se pudo leer la solicitud.');
    }

    $contenido = trim($contenido);
    if ($contenido === '') {
      return [];
    }

    $datos = json_decode($contenido, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($datos)) {
      throw new RuntimeException('El cuerpo de la solicitud debe contener JSON válido: ' . json_last_error_msg());
    }

    return $datos;
  }

  private function calcularEdad(?string $fecha): ?int
  {
    if ($fecha === null || trim($fecha) === '') {
      return null;
    }

    $fechaNormalizada = \DateTime::createFromFormat('Y-m-d', $fecha);
    if (!$fechaNormalizada) {
      return null;
    }

    return (int) $fechaNormalizada->diff(new \DateTime())->y;
  }
}
