<?php

namespace Micodigo\Inscripcion;

use DateTime;
use Exception;
use PDO;
use RuntimeException;
use Valitron\Validator;

trait InscripcionProcesadorTrait
{
  private function registrarProcesoDeInscripcion(PDO $conexion, array $contexto, array $datosFormulario): array
  {
    $datosValidados = $this->validarDatosDeInscripcion($datosFormulario, $contexto['anio']);

    $conexion->beginTransaction();

    try {
      $disponibilidad = $this->verificarDisponibilidadCupo(
        $conexion,
        $contexto['aula']['id_aula'],
        $contexto['anio']['id'],
        true
      );

      $idInscripcion = $this->insertarInscripcionEnBase(
        $conexion,
        $contexto,
        $datosValidados,
        $disponibilidad
      );

      $conexion->commit();

      return [
        'id_inscripcion' => $idInscripcion,
        'fecha_inscripcion' => $datosValidados['fecha_inscripcion'],
        'tipo_inscripcion' => $contexto['tipo_inscripcion'],
        'anio' => $contexto['anio'],
        'estudiante' => [
          'id' => $contexto['estudiante']['id'],
          'nombre' => $contexto['estudiante']['nombre_completo'],
          'cedula' => $contexto['estudiante']['cedula'],
        ],
        'representante' => [
          'id' => $contexto['representante']['id'],
          'nombre' => $contexto['representante']['nombre_completo'],
          'cedula' => $contexto['representante']['cedula'],
          'parentesco' => $contexto['representante']['tipo_parentesco'],
        ],
        'aula' => [
          'id_aula' => $contexto['aula']['id_aula'],
          'grado' => $contexto['aula']['grado'],
          'seccion' => $contexto['aula']['seccion'],
          'docente' => [
            'id' => $disponibilidad['docente_id'],
            'nombre' => $disponibilidad['docente_nombre'],
          ],
          'cupos_restantes' => max(0, $disponibilidad['disponibles'] - 1),
        ],
      ];
    } catch (Exception $e) {
      $conexion->rollBack();
      throw $e;
    }
  }

  private function validarDatosDeInscripcion(array $entrada, array $anio): array
  {
    $datos = [
      'fecha_inscripcion' => trim((string) ($entrada['fecha_inscripcion'] ?? '')),
      'vive_con' => trim((string) ($entrada['vive_con'] ?? '')),
      'altura' => $entrada['altura'] ?? null,
      'talla_zapatos' => $entrada['talla_zapatos'] ?? null,
      'talla_camisa' => $entrada['talla_camisa'] ?? null,
      'talla_pantalon' => $entrada['talla_pantalon'] ?? null,
      'peso' => $entrada['peso'] ?? null,
      'tipo_vivienda' => trim((string) ($entrada['tipo_vivienda'] ?? '')),
      'zona_vivienda' => trim((string) ($entrada['zona_vivienda'] ?? '')),
      'tenencia_viviencia' => trim((string) ($entrada['tenencia_viviencia'] ?? '')),
      'ingreso_familiar' => $entrada['ingreso_familiar'] ?? null,
      'miembros_familia' => $entrada['miembros_familia'] ?? null,
      'tareas_comunitarias' => $this->normalizarRespuestaSiNo($entrada['tareas_comunitarias'] ?? 'no'),
      'participar_comite' => $this->normalizarRespuestaSiNo($entrada['participar_comite'] ?? 'no'),
      'detalles_participacion' => trim((string) ($entrada['detalles_participacion'] ?? '')),
      'foto_estudiante' => $this->normalizarRespuestaSiNo($entrada['foto_estudiante'] ?? 'no'),
      'foto_representante' => $this->normalizarRespuestaSiNo($entrada['foto_representante'] ?? 'no'),
      'cedula_estudiante' => $this->normalizarRespuestaSiNo($entrada['cedula_estudiante'] ?? 'no'),
      'cedula_representante' => $this->normalizarRespuestaSiNo($entrada['cedula_representante'] ?? 'no'),
    ];

    $validator = new Validator($datos);
    $validator->rule('required', [
      'fecha_inscripcion',
      'vive_con',
      'altura',
      'talla_zapatos',
      'talla_camisa',
      'talla_pantalon',
      'peso',
      'tipo_vivienda',
      'zona_vivienda',
      'tenencia_viviencia',
      'ingreso_familiar',
      'miembros_familia',
      'detalles_participacion',
    ]);
    $validator->rule('date', 'fecha_inscripcion');
    $validator->rule('lengthMax', 'vive_con', 200);
    $validator->rule('lengthMax', 'tipo_vivienda', 60);
    $validator->rule('lengthMax', 'zona_vivienda', 60);
    $validator->rule('lengthMax', 'tenencia_viviencia', 60);
    $validator->rule('lengthMax', 'detalles_participacion', 60);
    $validator->rule('numeric', ['altura', 'peso', 'ingreso_familiar']);
    $validator->rule('min', ['altura', 'peso', 'ingreso_familiar'], 0);
    $validator->rule('integer', ['talla_zapatos', 'talla_camisa', 'talla_pantalon', 'miembros_familia']);
    $validator->rule('min', ['talla_zapatos', 'talla_camisa', 'talla_pantalon'], 1);
    $validator->rule('min', 'miembros_familia', 1);
    $validator->rule('max', 'miembros_familia', 99);
    $validator->rule('in', [
      'tareas_comunitarias',
      'participar_comite',
      'foto_estudiante',
      'foto_representante',
      'cedula_estudiante',
      'cedula_representante',
    ], ['si', 'no']);

    if (!$validator->validate()) {
      throw new InscripcionValidacionException(
        'Existen errores en la información de la inscripción.',
        $validator->errors()
      );
    }

    $datos['altura'] = (float) $datos['altura'];
    $datos['peso'] = (float) $datos['peso'];
    $datos['ingreso_familiar'] = (float) $datos['ingreso_familiar'];
    $datos['talla_zapatos'] = (int) $datos['talla_zapatos'];
    $datos['talla_camisa'] = (int) $datos['talla_camisa'];
    $datos['talla_pantalon'] = (int) $datos['talla_pantalon'];
    $datos['miembros_familia'] = (int) $datos['miembros_familia'];

    $fechaInscripcion = DateTime::createFromFormat('Y-m-d', $datos['fecha_inscripcion']);
    if (!$fechaInscripcion) {
      throw new InscripcionValidacionException(
        'La fecha de inscripción no tiene un formato válido.',
        ['fecha_inscripcion' => ['Formato de fecha inválido.']]
      );
    }

    $inicio = DateTime::createFromFormat('Y-m-d', $anio['fecha_inicio']);
    $fin = DateTime::createFromFormat('Y-m-d', $anio['fecha_fin']);
    if ($inicio && $fechaInscripcion < $inicio) {
      throw new InscripcionValidacionException(
        'La fecha de inscripción no puede ser anterior al inicio del año escolar.',
        ['fecha_inscripcion' => ['Fecha de inscripción fuera del rango del año escolar.']]
      );
    }
    if ($fin && $fechaInscripcion > $fin) {
      throw new InscripcionValidacionException(
        'La fecha de inscripción no puede ser posterior al fin del año escolar.',
        ['fecha_inscripcion' => ['Fecha de inscripción fuera del rango del año escolar.']]
      );
    }

    return $datos;
  }

  private function insertarInscripcionEnBase(PDO $conexion, array $contexto, array $datos, array $disponibilidad): int
  {
    $sql = 'INSERT INTO inscripciones (
              fk_estudiante,
              fk_representante,
              fk_personal,
              fk_aula,
              fecha_inscripcion,
              vive_con,
              altura,
              talla_zapatos,
              talla_camisa,
              talla_pantalon,
              peso,
              estado_inscripcion,
              tipo_inscripcion,
              foto_estudiante,
              foto_representante,
              cedula_estudiante,
              cedula_representante,
              tipo_vivienda,
              zona_vivienda,
              tenencia_viviencia,
              ingreso_familiar,
              miembros_familia,
              tareas_comunitarias,
              participar_comite,
              detalles_participacion
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([
      $contexto['estudiante']['id'],
      $contexto['representante']['id'],
      $disponibilidad['docente_id'],
      $contexto['aula']['id_aula'],
      $datos['fecha_inscripcion'],
      $datos['vive_con'],
      $datos['altura'],
      $datos['talla_zapatos'],
      $datos['talla_camisa'],
      $datos['talla_pantalon'],
      $datos['peso'],
      'activo',
      $contexto['tipo_inscripcion'],
      $datos['foto_estudiante'],
      $datos['foto_representante'],
      $datos['cedula_estudiante'],
      $datos['cedula_representante'],
      $datos['tipo_vivienda'],
      $datos['zona_vivienda'],
      $datos['tenencia_viviencia'],
      $datos['ingreso_familiar'],
      $datos['miembros_familia'],
      $datos['tareas_comunitarias'],
      $datos['participar_comite'],
      $datos['detalles_participacion'],
    ]);

    return (int) $conexion->lastInsertId();
  }

  private function normalizarRespuestaSiNo(string $valor): string
  {
    $valor = strtolower(trim($valor));
    return in_array($valor, ['si', 'no'], true) ? $valor : 'no';
  }
}
