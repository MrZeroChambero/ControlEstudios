<?php

namespace Micodigo\Inscripcion;

use DateTime;
use DateTimeImmutable;
use Exception;
use PDO;
use RuntimeException;
use Valitron\Validator;

trait InscripcionProcesadorTrait
{
  private function registrarProcesoDeInscripcion(PDO $conexion, array $contexto, array $datosFormulario, ?array &$debugSql = null, ?array &$debugMensajes = null): array
  {
    $this->agregarMensajeDebug($debugMensajes, 'Se inicia el proceso de registro de inscripción.');
    $datosValidados = $this->validarDatosDeInscripcion($datosFormulario, $contexto['anio']);

    $evaluacion = $this->evaluarCondicionesFinalesInscripcion(
      $conexion,
      $contexto,
      $datosValidados,
      $debugSql,
      $debugMensajes
    );

    $contexto['tipo_inscripcion'] = $evaluacion['tipo'];
    $contexto['estado_inscripcion'] = $evaluacion['estado'];
    $contexto['documentos_pendientes'] = $evaluacion['faltantes_documentos'];
    $contexto['requiere_documentos'] = $evaluacion['requiere_documentos'];
    $contexto['evaluacion'] = $evaluacion;

    $conexion->beginTransaction();

    try {
      $disponibilidad = $this->verificarDisponibilidadCupo(
        $conexion,
        $contexto['aula']['id_aula'],
        $contexto['anio']['id'],
        true,
        $debugSql
      );

      $idInscripcion = $this->insertarInscripcionEnBase(
        $conexion,
        $contexto,
        $datosValidados,
        $disponibilidad,
        $debugSql
      );

      $conexion->commit();

      $this->agregarMensajeDebug($debugMensajes, 'Transacción confirmada correctamente.');

      $tipoSalida = $this->formatearTipoInscripcionSalida($contexto['tipo_inscripcion']);

      return [
        'id_inscripcion' => $idInscripcion,
        'fecha_inscripcion' => $datosValidados['fecha_inscripcion'],
        'tipo_inscripcion' => $tipoSalida,
        'estado_inscripcion' => $contexto['estado_inscripcion'],
        'documentos_pendientes' => $contexto['documentos_pendientes'],
        'requiere_documentos' => $contexto['requiere_documentos'],
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
        'ajustes' => [
          'tipo_original' => $contexto['tipo_original'] ?? null,
          'tipo_interno' => $contexto['tipo_inscripcion'],
          'detalle' => $contexto['evaluacion']['ajustes'] ?? [],
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
        'evaluacion' => array_merge($contexto['evaluacion'], ['tipo_publico' => $tipoSalida]),
      ];
    } catch (Exception $e) {
      $this->agregarMensajeDebug($debugMensajes, 'Se revierte la transacción por una excepción: ' . $e->getMessage());
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

    $anioInicio = (int) $inicio->format('Y');
    $mesInicio = (int) $inicio->format('m');
    $anioLimite = $mesInicio > 5 ? $anioInicio + 1 : $anioInicio;
    $limiteAutomatico = DateTime::createFromFormat('Y-m-d', sprintf('%04d-05-31', $anioLimite));
    $limiteConfigurado = DateTime::createFromFormat('Y-m-d', $anio['fecha_limite_inscripcion'] ?? '');
    $limiteComparacion = $limiteAutomatico;
    if ($limiteConfigurado instanceof DateTime && $limiteConfigurado < $limiteComparacion) {
      $limiteComparacion = $limiteConfigurado;
    }

    if ($limiteComparacion instanceof DateTime && $fechaInscripcion > $limiteComparacion) {
      throw new InscripcionValidacionException(
        'Las inscripciones para este año escolar cerraron a finales de mayo.',
        ['fecha_inscripcion' => ['El registro se encuentra cerrado desde el 31 de mayo.']]
      );
    }

    return $datos;
  }

  private function evaluarCondicionesFinalesInscripcion(
    PDO $conexion,
    array $contexto,
    array $datos,
    ?array &$debugSql = null,
    ?array &$debugMensajes = null
  ): array {
    $gradoObjetivo = (int) ($contexto['aula']['grado'] ?? 0);
    $tipoActual = $contexto['tipo_inscripcion'] ?? 'nuevo_ingreso';
    $tipoOriginal = $contexto['tipo_original'] ?? $tipoActual;
    $historial = $contexto['historial'] ?? [];
    $ajustes = [];

    $fechaTexto = $datos['fecha_inscripcion'] ?? null;
    $fechaInscripcion = null;
    if (is_string($fechaTexto) && $fechaTexto !== '') {
      $fechaInscripcion = DateTimeImmutable::createFromFormat('Y-m-d', $fechaTexto) ?: null;
      if ($fechaInscripcion === null) {
        try {
          $fechaInscripcion = new DateTimeImmutable($fechaTexto);
        } catch (Exception) {
          $fechaInscripcion = null;
        }
      }
    }

    $cursoAnterior = (bool) ($historial['curso_anio_anterior'] ?? false);
    $aprobadoUltimo = (bool) ($historial['aprobado_ultimo'] ?? false);
    $estaRepitiendo = (bool) ($historial['esta_repitiendo'] ?? false);
    $inactividadProlongada = (bool) ($historial['inactividad_prolongada'] ?? false);
    $gradoUltimo = $historial['grado_ultimo'] ?? null;
    $sinHistorial = $gradoUltimo === null;
    $esReingreso = !$cursoAnterior && !$sinHistorial;
    $esProgresionRegular = $cursoAnterior && $aprobadoUltimo && $gradoUltimo !== null && $gradoObjetivo === $gradoUltimo + 1;

    $tipoEvaluado = $tipoActual;

    if ($tipoOriginal === 'no_escolarizado') {
      $tipoEvaluado = 'no_escolarizados';
      $ajustes[] = 'Se normaliza el tipo "no escolarizado" a la clave interna "no_escolarizados".';
    }

    if ($gradoObjetivo === 1 && $tipoEvaluado !== 'no_escolarizados') {
      $primerMomento = $this->obtenerPrimerMomentoAnio($conexion, $contexto['anio']['id'], $debugSql);
      $tipoEvaluado = 'nuevo_ingreso';
      if ($primerMomento !== null && $fechaInscripcion instanceof DateTimeImmutable) {
        $fechaFinMomento = isset($primerMomento['fecha_fin']) && $primerMomento['fecha_fin'] !== null
          ? DateTimeImmutable::createFromFormat('Y-m-d', $primerMomento['fecha_fin'])
          : null;
        if ($fechaFinMomento instanceof DateTimeImmutable && $fechaInscripcion > $fechaFinMomento) {
          $tipoEvaluado = 'traslado';
          $ajustes[] = 'Primer grado con primer momento finalizado: la inscripción se marca como traslado.';
        } else {
          $ajustes[] = 'Primer grado dentro del primer momento: la inscripción se marca como nuevo ingreso.';
        }
      } else {
        $ajustes[] = 'Primer grado sin información de momentos: la inscripción se maneja como nuevo ingreso.';
      }
    } else {
      if ($esProgresionRegular) {
        $tipoEvaluado = 'regular';
        $ajustes[] = 'El estudiante aprobó el año inmediato anterior; se asigna tipo regular.';
      } elseif ($estaRepitiendo && $cursoAnterior) {
        $ajustes[] = 'El estudiante repetirá el mismo grado cursado el año anterior.';
      } elseif ($tipoEvaluado === 'regular') {
        if ($sinHistorial || $inactividadProlongada || $esReingreso) {
          $tipoEvaluado = $esReingreso ? 'traslado' : 'nuevo_ingreso';
          $ajustes[] = 'No se cumple con los criterios de continuidad; se ajusta el tipo de inscripción.';
        }
      }
    }

    $permitidos = ['regular', 'nuevo_ingreso', 'traslado', 'no_escolarizados'];
    if (!in_array($tipoEvaluado, $permitidos, true)) {
      throw new InscripcionValidacionException(
        'El tipo de inscripción calculado es inválido.',
        ['tipo_inscripcion' => ['No se pudo determinar un tipo de inscripción válido para el estudiante.']]
      );
    }

    $requiereDocumentos = in_array($tipoEvaluado, ['nuevo_ingreso', 'traslado'], true)
      && !$estaRepitiendo
      && $tipoEvaluado !== 'no_escolarizados';

    $faltantes = $requiereDocumentos
      ? $this->verificarDocumentosRequeridos($historial['documentos'] ?? [], $gradoObjetivo)
      : [];

    $estado = !empty($faltantes) ? 'en_proceso' : 'activo';

    if ($tipoEvaluado === 'no_escolarizados') {
      $estado = 'activo';
      $ajustes[] = 'La modalidad "no escolarizados" no requiere documentación previa.';
    }

    if (!empty($faltantes)) {
      $nombresFaltantes = array_map(fn(array $item): string => $item['documento'], $faltantes);
      $this->agregarMensajeDebug(
        $debugMensajes,
        'Documentos pendientes para completar la inscripción: ' . implode(', ', $nombresFaltantes)
      );
    }

    foreach ($ajustes as $detalle) {
      $this->agregarMensajeDebug($debugMensajes, $detalle);
    }

    return [
      'tipo' => $tipoEvaluado,
      'estado' => $estado,
      'faltantes_documentos' => $faltantes,
      'requiere_documentos' => $requiereDocumentos,
      'ajustes' => $ajustes,
      'es_regular' => $tipoEvaluado === 'regular',
      'es_reingreso' => $esReingreso,
      'esta_repitiendo' => $estaRepitiendo,
    ];
  }

  private function verificarDocumentosRequeridos(array $documentos, int $gradoObjetivo): array
  {
    $gradoRequerido = max(0, $gradoObjetivo - 1);
    $requeridos = [
      'constancia_prosecucion' => 'Constancia de prosecución',
      'certificado_aprendizaje' => 'Certificado de aprendizaje',
      'boleta_promocion' => 'Boleta de promoción',
    ];

    $faltantes = [];
    foreach ($requeridos as $clave => $etiqueta) {
      $gradoDisponible = $documentos[$clave] ?? null;
      if ($gradoDisponible === null || $gradoDisponible < $gradoRequerido) {
        $faltantes[$clave] = [
          'documento' => $etiqueta,
          'grado_requerido' => $gradoRequerido,
          'grado_disponible' => $gradoDisponible,
        ];
      }
    }

    return $faltantes;
  }

  private function obtenerPrimerMomentoAnio(PDO $conexion, int $anioId, ?array &$debugSql = null): ?array
  {
    $sql = 'SELECT id_momento,
                   nombre_momento,
                   fecha_inicio,
                   fecha_fin
            FROM momentos
            WHERE fk_anio_escolar = ?
            ORDER BY CAST(nombre_momento AS UNSIGNED), fecha_inicio
            LIMIT 1';

    $this->agregarSqlDebug($debugSql, 'primer_momento_anio', $sql, ['anio_escolar_id' => $anioId]);

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$anioId]);
    $fila = $sentencia->fetch(PDO::FETCH_ASSOC);

    if (!$fila) {
      return null;
    }

    return [
      'id' => (int) $fila['id_momento'],
      'nombre' => $fila['nombre_momento'],
      'fecha_inicio' => $fila['fecha_inicio'],
      'fecha_fin' => $fila['fecha_fin'],
    ];
  }

  private function formatearTipoInscripcionSalida(string $tipo): string
  {
    return $tipo === 'no_escolarizados' ? 'no_escolarizado' : $tipo;
  }

  private function insertarInscripcionEnBase(PDO $conexion, array $contexto, array $datos, array $disponibilidad, ?array &$debugSql = null): int
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

    $estadoInscripcion = $contexto['estado_inscripcion'] ?? 'activo';

    $this->agregarSqlDebug($debugSql, 'insertar_inscripcion', $sql, [
      'estudiante_id' => $contexto['estudiante']['id'],
      'representante_id' => $contexto['representante']['id'],
      'docente_id' => $disponibilidad['docente_id'],
      'aula_id' => $contexto['aula']['id_aula'],
      'tipo_inscripcion' => $contexto['tipo_inscripcion'],
      'estado_inscripcion' => $estadoInscripcion,
    ]);

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
      $estadoInscripcion,
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
