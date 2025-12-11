<?php

namespace Micodigo\Inscripcion;

use DateTimeInterface;
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

  private function obtenerEstudiantesElegibles(PDO $conexion, int $anioId, DateTimeInterface $referencia, ?array &$debugSql = null, ?array &$debugMensajes = null): array
  {
    $registrados = $this->obtenerMapaEstudiantesInscritos($conexion, $anioId, $debugSql);
    $this->agregarMensajeDebug($debugMensajes, sprintf('Se excluyen %d estudiantes con inscripción activa.', count($registrados)));

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
              AND EXISTS (
                SELECT 1
                FROM parentesco par
                INNER JOIN representantes rep ON rep.id_representante = par.fk_representante
                INNER JOIN personas pr ON pr.id_persona = rep.fk_persona
                WHERE par.fk_estudiante = e.id_estudiante
                  AND pr.estado = "activo"
              )
            ORDER BY p.primer_nombre, p.primer_apellido';

    $this->agregarSqlDebug($debugSql, 'estudiantes_elegibles', $sql, ['anio_escolar_id' => $anioId]);

    $sentencia = $conexion->query($sql);
    $registros = $sentencia !== false ? $sentencia->fetchAll(PDO::FETCH_ASSOC) : [];

    $persona = $this->obtenerPersonaUtil();
    $elegibles = [];

    foreach ($registros as $fila) {
      $idEstudiante = (int) $fila['id_estudiante'];
      if (isset($registrados[$idEstudiante])) {
        continue;
      }

      $edad = $persona->calcularEdad($fila['fecha_nacimiento'], $referencia);
      if ($edad === null || $edad < 5 || $edad > 13) {
        continue;
      }

      $gradosPermitidos = $this->calcularGradosPermitidos($fila['fecha_nacimiento'], $referencia);
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
        'edad' => $edad,
        'grados_permitidos' => $gradosPermitidos,
      ];
    }

    $this->agregarMensajeDebug($debugMensajes, sprintf('Se encontraron %d estudiantes elegibles entre 5 y 13 años.', count($elegibles)));
    return $elegibles;
  }

  private function validarEstudianteSeleccion(PDO $conexion, int $estudianteId, int $grado, int $anioId, ?array &$debugSql = null, ?array &$debugMensajes = null): array
  {
    $estudiante = $this->obtenerEstudianteActivoPorId($conexion, $estudianteId, $debugSql);
    if ($estudiante === null) {
      $this->agregarMensajeDebug($debugMensajes, 'El estudiante no existe o no está activo.');
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

    $this->agregarSqlDebug($debugSql, 'verificar_inscripcion_activa_estudiante', $sql, [
      'estudiante_id' => $estudianteId,
      'anio_escolar_id' => $anioId,
    ]);

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$estudianteId, $anioId]);
    if ($sentencia->fetchColumn()) {
      $this->agregarMensajeDebug($debugMensajes, 'El estudiante ya tiene una inscripción activa o en proceso.');
      return [
        'valido' => false,
        'errores' => ['estudiante' => ['El estudiante ya posee una inscripción activa en este año escolar.']],
      ];
    }

    $persona = $this->obtenerPersonaUtil();
    $validacionEdad = $persona->validarEdadPorGrado($estudiante['fecha_nacimiento'], $grado);
    if ($validacionEdad !== true) {
      $this->agregarMensajeDebug($debugMensajes, 'La edad del estudiante no coincide con el grado solicitado.');
      return [
        'valido' => false,
        'errores' => $validacionEdad,
      ];
    }

    $estudiante['grados_permitidos'] = $this->calcularGradosPermitidos($estudiante['fecha_nacimiento']);

    $this->agregarMensajeDebug($debugMensajes, 'El estudiante cumple las validaciones de selección.');
    return [
      'valido' => true,
      'estudiante' => $estudiante,
    ];
  }

  private function obtenerEstudianteActivoPorId(PDO $conexion, int $estudianteId, ?array &$debugSql = null): ?array
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

    $this->agregarSqlDebug($debugSql, 'estudiante_activo_por_id', $sql, ['estudiante_id' => $estudianteId]);

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

  private function calcularGradosPermitidos(?string $fechaNacimiento, ?DateTimeInterface $referencia = null): array
  {
    $permitidos = [];
    $persona = $this->obtenerPersonaUtil();
    $referencia = $referencia ?? new \DateTimeImmutable();

    for ($grado = 1; $grado <= 6; $grado++) {
      $resultado = $persona->validarEdadPorGrado($fechaNacimiento, $grado, $referencia);
      if ($resultado === true) {
        $permitidos[] = $grado;
      }
    }

    return $permitidos;
  }

  private function obtenerMapaEstudiantesInscritos(PDO $conexion, int $anioId, ?array &$debugSql = null): array
  {
    $sql = 'SELECT DISTINCT i.fk_estudiante
            FROM inscripciones i
            INNER JOIN aula a ON a.id_aula = i.fk_aula
            WHERE a.fk_anio_escolar = ?
              AND i.estado_inscripcion IN ("activo", "en_proceso")';

    $this->agregarSqlDebug($debugSql, 'mapa_estudiantes_inscritos', $sql, ['anio_escolar_id' => $anioId]);

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
