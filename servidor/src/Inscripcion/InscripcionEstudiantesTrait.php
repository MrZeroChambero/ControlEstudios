<?php

namespace Micodigo\Inscripcion;

use Micodigo\Persona\Persona;
use PDO;

require_once __DIR__ . '/../Persona/Persona.php';

trait InscripcionEstudiantesTrait
{
  use InscripcionFormatoNombreTrait;

  private ?Persona $utilPersona = null;

  private function obtenerPersonaUtil(): Persona
  {
    if ($this->utilPersona === null) {
      $this->utilPersona = new Persona();
    }

    return $this->utilPersona;
  }

  private function obtenerEstudiantesElegibles(PDO $conexion, int $anioId): array
  {
    $registrados = $this->obtenerMapaEstudiantesInscritos($conexion, $anioId);

    $sql = 'SELECT e.id_estudiante,
                   e.id_persona,
                   e.cedula_escolar,
                   p.primer_nombre,
                   p.segundo_nombre,
                   p.primer_apellido,
                   p.segundo_apellido,
                   p.cedula,
                   p.fecha_nacimiento
            FROM estudiantes e
            INNER JOIN personas p ON p.id_persona = e.id_persona
            WHERE e.estado = "activo"
              AND p.estado = "activo"
            ORDER BY p.primer_nombre, p.primer_apellido';

    $sentencia = $conexion->query($sql);
    $registros = $sentencia !== false ? $sentencia->fetchAll(PDO::FETCH_ASSOC) : [];

    $persona = $this->obtenerPersonaUtil();
    $elegibles = [];

    foreach ($registros as $fila) {
      $idEstudiante = (int) $fila['id_estudiante'];
      if (isset($registrados[$idEstudiante])) {
        continue;
      }

      $gradosPermitidos = $this->calcularGradosPermitidos($fila['fecha_nacimiento']);
      if (empty($gradosPermitidos)) {
        continue;
      }

      $elegibles[] = [
        'id' => $idEstudiante,
        'id_persona' => (int) $fila['id_persona'],
        'cedula_escolar' => $fila['cedula_escolar'],
        'cedula' => $fila['cedula'],
        'nombre_completo' => $this->construirNombreCompleto($fila),
        'fecha_nacimiento' => $fila['fecha_nacimiento'],
        'edad' => $persona->calcularEdad($fila['fecha_nacimiento']),
        'grados_permitidos' => $gradosPermitidos,
      ];
    }

    return $elegibles;
  }

  private function validarEstudianteSeleccion(PDO $conexion, int $estudianteId, int $grado, int $anioId): array
  {
    $estudiante = $this->obtenerEstudianteActivoPorId($conexion, $estudianteId);
    if ($estudiante === null) {
      return [
        'valido' => false,
        'errores' => ['estudiante' => ['El estudiante no existe o no está activo.']],
      ];
    }

    $sql = 'SELECT 1
            FROM inscripciones i
            INNER JOIN aula a ON a.id_aula = i.fk_aula
            WHERE i.fk_estudiante = ?
              AND a.fk_anio_escolar = ?
              AND i.estado_inscripcion IN ("activo", "en_proceso")
            LIMIT 1';

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$estudianteId, $anioId]);
    if ($sentencia->fetchColumn()) {
      return [
        'valido' => false,
        'errores' => ['estudiante' => ['El estudiante ya posee una inscripción activa en este año escolar.']],
      ];
    }

    $persona = $this->obtenerPersonaUtil();
    $validacionEdad = $persona->validarEdadPorGrado($estudiante['fecha_nacimiento'], $grado);
    if ($validacionEdad !== true) {
      return [
        'valido' => false,
        'errores' => $validacionEdad,
      ];
    }

    $estudiante['grados_permitidos'] = $this->calcularGradosPermitidos($estudiante['fecha_nacimiento']);

    return [
      'valido' => true,
      'estudiante' => $estudiante,
    ];
  }

  private function obtenerEstudianteActivoPorId(PDO $conexion, int $estudianteId): ?array
  {
    $sql = 'SELECT e.id_estudiante,
                   e.id_persona,
                   e.cedula_escolar,
                   p.primer_nombre,
                   p.segundo_nombre,
                   p.primer_apellido,
                   p.segundo_apellido,
                   p.cedula,
                   p.fecha_nacimiento
            FROM estudiantes e
            INNER JOIN personas p ON p.id_persona = e.id_persona
            WHERE e.id_estudiante = ?
              AND e.estado = "activo"
              AND p.estado = "activo"
            LIMIT 1';

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$estudianteId]);
    $fila = $sentencia->fetch(PDO::FETCH_ASSOC);

    if (!$fila) {
      return null;
    }

    $persona = $this->obtenerPersonaUtil();

    return [
      'id' => (int) $fila['id_estudiante'],
      'id_persona' => (int) $fila['id_persona'],
      'cedula_escolar' => $fila['cedula_escolar'],
      'cedula' => $fila['cedula'],
      'nombre_completo' => $this->construirNombreCompleto($fila),
      'fecha_nacimiento' => $fila['fecha_nacimiento'],
      'edad' => $persona->calcularEdad($fila['fecha_nacimiento']),
    ];
  }

  private function calcularGradosPermitidos(?string $fechaNacimiento): array
  {
    $permitidos = [];
    $persona = $this->obtenerPersonaUtil();

    for ($grado = 1; $grado <= 6; $grado++) {
      $resultado = $persona->validarEdadPorGrado($fechaNacimiento, $grado);
      if ($resultado === true) {
        $permitidos[] = $grado;
      }
    }

    return $permitidos;
  }

  private function obtenerMapaEstudiantesInscritos(PDO $conexion, int $anioId): array
  {
    $sql = 'SELECT DISTINCT i.fk_estudiante
            FROM inscripciones i
            INNER JOIN aula a ON a.id_aula = i.fk_aula
            WHERE a.fk_anio_escolar = ?
              AND i.estado_inscripcion IN ("activo", "en_proceso")';

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$anioId]);
    $ids = $sentencia->fetchAll(PDO::FETCH_COLUMN) ?: [];

    $resultado = [];
    foreach ($ids as $id) {
      $resultado[(int) $id] = true;
    }

    return $resultado;
  }
}
