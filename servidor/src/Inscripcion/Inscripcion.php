<?php

namespace Micodigo\Inscripcion;

use Exception;
use Micodigo\Config\Conexion;
use PDO;
use RuntimeException;
use Valitron\Validator;

require_once __DIR__ . '/InscripcionFormatoNombreTrait.php';
require_once __DIR__ . '/InscripcionAnioEscolarTrait.php';
require_once __DIR__ . '/InscripcionEstudiantesTrait.php';
require_once __DIR__ . '/InscripcionCuposTrait.php';
require_once __DIR__ . '/InscripcionRepresentantesTrait.php';
require_once __DIR__ . '/InscripcionProcesadorTrait.php';

class InscripcionValidacionException extends RuntimeException
{
  private array $errores;

  public function __construct(string $mensaje, array $errores)
  {
    parent::__construct($mensaje);
    $this->errores = $errores;
  }

  public function obtenerErrores(): array
  {
    return $this->errores;
  }
}





class Inscripcion
{
  use InscripcionAnioEscolarTrait;
  use InscripcionEstudiantesTrait;
  use InscripcionCuposTrait;
  use InscripcionRepresentantesTrait;
  use InscripcionProcesadorTrait;

  public function __construct()
  {
    Validator::lang('es');
  }

  public function verificarPrecondiciones(): void
  {
    try {
      $conexion = $this->obtenerConexion();
      $resultado = $this->validarAnioEscolar($conexion);

      $mensaje = $resultado['valido']
        ? 'El sistema de inscripción está listo para usarse.'
        : 'El sistema de inscripción no está disponible hasta completar los requisitos.';

      $this->responder(200, true, $mensaje, [
        'listo' => $resultado['valido'],
        'anio' => $resultado['anio'],
        'faltantes_docentes' => $resultado['faltantes_docentes'],
        'motivos' => $resultado['motivos'],
      ]);
    } catch (Exception $e) {
      $this->responder(500, false, 'Error interno al verificar las precondiciones.', null, [
        'detalle' => [$e->getMessage()],
      ]);
    }
  }

  public function listarEstudiantesElegibles(): void
  {
    try {
      $conexion = $this->obtenerConexion();
      $resultado = $this->validarAnioEscolar($conexion);
      if (!$resultado['valido']) {
        $this->responder(428, false, 'No es posible listar estudiantes hasta cumplir las precondiciones.', [
          'motivos' => $resultado['motivos'],
        ]);
        return;
      }

      $lista = $this->obtenerEstudiantesElegibles($conexion, $resultado['anio']['id']);

      $this->responder(200, true, 'Estudiantes elegibles cargados correctamente.', [
        'anio' => $resultado['anio'],
        'estudiantes' => $lista,
      ]);
    } catch (Exception $e) {
      $this->responder(500, false, 'Error al obtener los estudiantes elegibles.', null, [
        'detalle' => [$e->getMessage()],
      ]);
    }
  }

  public function listarAulasDisponibles(): void
  {
    try {
      $conexion = $this->obtenerConexion();
      $resultado = $this->validarAnioEscolar($conexion);
      if (!$resultado['valido']) {
        $this->responder(428, false, 'No es posible listar aulas hasta cumplir las precondiciones.', [
          'motivos' => $resultado['motivos'],
        ]);
        return;
      }

      $aulas = $this->listarAulasConDisponibilidad($conexion, $resultado['anio']['id']);
      $disponibles = array_values(
        array_filter(
          $aulas,
          fn(array $aula): bool => $aula['disponibles'] > 0 && $aula['docente'] !== null
        )
      );

      $this->responder(200, true, 'Aulas disponibles cargadas correctamente.', [
        'anio' => $resultado['anio'],
        'aulas' => $disponibles,
      ]);
    } catch (Exception $e) {
      $this->responder(500, false, 'Error al obtener las aulas disponibles.', null, [
        'detalle' => [$e->getMessage()],
      ]);
    }
  }

  public function listarRepresentantesElegibles(int $estudianteId): void
  {
    try {
      $conexion = $this->obtenerConexion();
      $resultado = $this->validarAnioEscolar($conexion);
      if (!$resultado['valido']) {
        $this->responder(428, false, 'No es posible listar representantes hasta cumplir las precondiciones.', [
          'motivos' => $resultado['motivos'],
        ]);
        return;
      }

      if ($estudianteId <= 0) {
        $this->responder(422, false, 'Identificador de estudiante inválido.', null, [
          'estudiante' => ['Debe seleccionar un estudiante válido.'],
        ]);
        return;
      }

      $estudiante = $this->obtenerEstudianteActivoPorId($conexion, $estudianteId);
      if ($estudiante === null) {
        $this->responder(404, false, 'El estudiante indicado no está disponible.', null, [
          'estudiante' => ['El estudiante no existe o no está activo.'],
        ]);
        return;
      }

      $lista = $this->obtenerRepresentantesAsociados($conexion, $estudianteId);

      $this->responder(200, true, 'Representantes asociados cargados correctamente.', [
        'estudiante' => $estudiante,
        'representantes' => $lista,
      ]);
    } catch (Exception $e) {
      $this->responder(500, false, 'Error al obtener los representantes disponibles.', null, [
        'detalle' => [$e->getMessage()],
      ]);
    }
  }

  public function registrarInscripcion(): void
  {
    try {
      $entrada = $this->leerEntradaJson();

      $estudianteId = isset($entrada['estudiante_id']) ? (int) $entrada['estudiante_id'] : 0;
      $aulaId = isset($entrada['aula_id']) ? (int) $entrada['aula_id'] : 0;
      $representanteId = isset($entrada['representante_id']) ? (int) $entrada['representante_id'] : 0;
      $tipoInscripcion = $entrada['tipo_inscripcion'] ?? null;
      $datosFormulario = $entrada['datos'] ?? null;

      $errores = [];
      if ($estudianteId <= 0) {
        $errores['estudiante'][] = 'Debe seleccionar un estudiante válido.';
      }
      if ($aulaId <= 0) {
        $errores['aula'][] = 'Debe seleccionar un grado y sección válidos.';
      }
      if ($representanteId <= 0) {
        $errores['representante'][] = 'Debe seleccionar un representante válido.';
      }

      $tiposPermitidos = ['regular', 'nuevo_ingreso', 'traslado', 'educado_en_casa'];
      if (!is_string($tipoInscripcion) || !in_array($tipoInscripcion, $tiposPermitidos, true)) {
        $errores['tipo_inscripcion'][] = 'Debe seleccionar un tipo de inscripción válido.';
      }

      if (!is_array($datosFormulario)) {
        $errores['datos'][] = 'Los datos adicionales de la inscripción son requeridos.';
      }

      if (!empty($errores)) {
        $this->responder(422, false, 'La solicitud contiene datos inválidos.', null, $errores);
        return;
      }

      $conexion = $this->obtenerConexion();
      $resultadoAnio = $this->validarAnioEscolar($conexion);
      if (!$resultadoAnio['valido']) {
        $this->responder(428, false, 'No es posible registrar la inscripción hasta cumplir las precondiciones.', [
          'motivos' => $resultadoAnio['motivos'],
        ]);
        return;
      }

      $detalleAula = $this->obtenerDetalleAulaDisponible($conexion, $resultadoAnio['anio']['id'], $aulaId);
      if ($detalleAula['docente'] === null) {
        $this->responder(422, false, 'El aula seleccionada no tiene docente asignado.', null, [
          'aula' => ['Debe asignar un docente titular a la sección antes de inscribir.'],
        ]);
        return;
      }

      $validacionEstudiante = $this->validarEstudianteSeleccion(
        $conexion,
        $estudianteId,
        $detalleAula['grado'],
        $resultadoAnio['anio']['id']
      );

      if (!$validacionEstudiante['valido']) {
        $this->responder(422, false, 'El estudiante no cumple los requisitos de inscripción.', null, $validacionEstudiante['errores']);
        return;
      }

      $validacionRepresentante = $this->validarRepresentanteSeleccion(
        $conexion,
        $estudianteId,
        $representanteId
      );

      if (!$validacionRepresentante['valido']) {
        $this->responder(422, false, 'El representante no cumple los requisitos.', null, $validacionRepresentante['errores']);
        return;
      }

      $contexto = [
        'anio' => $resultadoAnio['anio'],
        'aula' => $detalleAula,
        'estudiante' => $validacionEstudiante['estudiante'],
        'representante' => $validacionRepresentante['representante'],
        'tipo_inscripcion' => $tipoInscripcion,
      ];

      $resultado = $this->registrarProcesoDeInscripcion($conexion, $contexto, $datosFormulario);

      $this->responder(201, true, 'Inscripción registrada correctamente.', $resultado);
    } catch (InscripcionValidacionException $e) {
      $this->responder(422, false, $e->getMessage(), null, $e->obtenerErrores());
    } catch (RuntimeException $e) {
      $this->responder(422, false, $e->getMessage(), null, [
        'general' => [$e->getMessage()],
      ]);
    } catch (Exception $e) {
      $this->responder(500, false, 'Ocurrió un error al registrar la inscripción.', null, [
        'detalle' => [$e->getMessage()],
      ]);
    }
  }

  private function obtenerConexion(): PDO
  {
    return Conexion::obtener();
  }

  private function leerEntradaJson(): array
  {
    $contenido = file_get_contents('php://input');
    if ($contenido === false) {
      throw new RuntimeException('No fue posible leer la entrada de la solicitud.');
    }

    $contenido = trim($contenido);
    if ($contenido === '') {
      return [];
    }

    $decodificado = json_decode($contenido, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($decodificado)) {
      throw new RuntimeException('El cuerpo de la solicitud debe ser JSON válido.');
    }

    return $decodificado;
  }

  private function responder(int $codigo, bool $exito, string $mensaje, mixed $datos = null, ?array $errores = null): void
  {
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');

    $payload = [
      'back' => $exito,
      'message' => $mensaje,
    ];

    if ($datos !== null) {
      $payload['data'] = $datos;
    }

    if ($errores !== null) {
      $payload['errors'] = $errores;
    }

    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
  }
}
