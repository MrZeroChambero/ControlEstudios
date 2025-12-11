<?php

namespace Micodigo\Estudiante;

trait ConsultasEstudiante
{
  // Listar estudiantes (JOIN personas)
  public static function consultarTodosEstudiantes($pdo)
  {
    // Adaptado al esquema real: tabla estudiantes tiene id_persona y datos biomédicos, no grado/seccion.
    // Grado se obtiene de la última inscripcion si existe.
    $sql = "SELECT 
          e.id_estudiante,
          e.id_persona AS fk_persona,
          e.cedula_escolar,
          e.fecha_ingreso_escuela,
          e.vive_con_padres,
          e.orden_nacimiento,
          e.tiempo_gestacion,
          e.embarazo_deseado,
          e.tipo_parto,
          e.control_esfinteres,
          e.control_embarazo,
          e.estado AS estado_estudiante,
            COALESCE((SELECT gs.grado FROM inscripciones i2 
              JOIN aula a2 ON i2.fk_aula = a2.id_aula
              JOIN anios_escolares ae2 ON a2.fk_anio_escolar = ae2.id_anio_escolar AND ae2.estado='activo'
              JOIN grado_seccion gs ON a2.fk_grado_seccion = gs.id_grado_seccion
              WHERE i2.fk_estudiante = e.id_estudiante
              ORDER BY i2.fecha_inscripcion DESC LIMIT 1), 'sin asignar') AS grado,
            COALESCE((SELECT gs.seccion FROM inscripciones i3 
              JOIN aula a3 ON i3.fk_aula = a3.id_aula
              JOIN anios_escolares ae3 ON a3.fk_anio_escolar = ae3.id_anio_escolar AND ae3.estado='activo'
              JOIN grado_seccion gs ON a3.fk_grado_seccion = gs.id_grado_seccion
              WHERE i3.fk_estudiante = e.id_estudiante
              ORDER BY i3.fecha_inscripcion DESC LIMIT 1), 'sin asignar') AS seccion,
          p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido, p.fecha_nacimiento, p.genero,
          p.cedula, p.nacionalidad, p.direccion, p.telefono_principal, p.telefono_secundario, p.email,
          p.tipo_sangre, p.estado AS estado_persona
          FROM estudiantes e 
          INNER JOIN personas p ON e.id_persona = p.id_persona
          ORDER BY p.primer_nombre, p.primer_apellido";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(\PDO::FETCH_ASSOC);
  }

  // Candidatos: personas incompletas tipo estudiante sin registro en estudiantes
  public static function consultarCandidatos($pdo)
  {
    $sql = "SELECT p.* FROM personas p
        LEFT JOIN estudiantes e ON e.id_persona = p.id_persona
        WHERE p.tipo_persona = 'estudiante' AND p.estado = 'incompleto' AND e.id_estudiante IS NULL
        ORDER BY p.primer_nombre, p.primer_apellido";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(\PDO::FETCH_ASSOC);
  }

  public static function consultarEstudiantePorId($pdo, $id_estudiante)
  {
    $sql = "SELECT 
          e.id_estudiante,
          e.id_persona AS fk_persona,
          e.cedula_escolar,
          e.fecha_ingreso_escuela,
          e.vive_con_padres,
          e.orden_nacimiento,
          e.tiempo_gestacion,
          e.embarazo_deseado,
          e.tipo_parto,
          e.control_esfinteres,
          e.control_embarazo,
          e.estado AS estado_estudiante,
            COALESCE((SELECT gs.grado FROM inscripciones i2 
              JOIN aula a2 ON i2.fk_aula = a2.id_aula
              JOIN anios_escolares ae2 ON a2.fk_anio_escolar = ae2.id_anio_escolar AND ae2.estado='activo'
              JOIN grado_seccion gs ON a2.fk_grado_seccion = gs.id_grado_seccion
              WHERE i2.fk_estudiante = e.id_estudiante
              ORDER BY i2.fecha_inscripcion DESC LIMIT 1), 'sin asignar') AS grado,
            COALESCE((SELECT gs.seccion FROM inscripciones i3 
              JOIN aula a3 ON i3.fk_aula = a3.id_aula
              JOIN anios_escolares ae3 ON a3.fk_anio_escolar = ae3.id_anio_escolar AND ae3.estado='activo'
              JOIN grado_seccion gs ON a3.fk_grado_seccion = gs.id_grado_seccion
              WHERE i3.fk_estudiante = e.id_estudiante
              ORDER BY i3.fecha_inscripcion DESC LIMIT 1), 'sin asignar') AS seccion,
          p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido, p.fecha_nacimiento, p.genero,
          p.cedula, p.nacionalidad, p.direccion, p.telefono_principal, p.telefono_secundario, p.email,
          p.tipo_sangre, p.estado AS estado_persona
          FROM estudiantes e INNER JOIN personas p ON e.id_persona = p.id_persona
          WHERE e.id_estudiante = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id_estudiante]);
    $row = $stmt->fetch(\PDO::FETCH_ASSOC);
    if (!$row) {
      return $row;
    }

    $idEst = (int) ($row['id_estudiante'] ?? $id_estudiante);

    // Documentos académicos
    $stmtDocs = $pdo->prepare('SELECT id_documento, tipo_documento, entregado, observaciones FROM documentos_academicos WHERE fk_estudiante = ? ORDER BY tipo_documento');
    $stmtDocs->execute([$idEst]);
    $row['documentos'] = $stmtDocs->fetchAll(\PDO::FETCH_ASSOC) ?: [];

    // Alergias asignadas
    $stmtAlergias = $pdo->prepare('SELECT la.id_lista_alergia, la.fk_alergia, a.nombre AS nombre_alergia FROM lista_alergias la INNER JOIN alergias a ON la.fk_alergia = a.id_alergia WHERE la.fk_estudiante = ? ORDER BY a.nombre');
    $stmtAlergias->execute([$idEst]);
    $row['alergias'] = $stmtAlergias->fetchAll(\PDO::FETCH_ASSOC) ?: [];

    // Condiciones de salud / patologías
    $stmtPat = $pdo->prepare('SELECT c.id_condicion, c.fk_patologia, p.nombre_patologia, c.observaciones FROM condiciones_salud c LEFT JOIN patologias p ON p.id_patologia = c.fk_patologia WHERE c.fk_estudiante = ? ORDER BY c.id_condicion DESC');
    $stmtPat->execute([$idEst]);
    $row['condiciones_salud'] = $stmtPat->fetchAll(\PDO::FETCH_ASSOC) ?: [];

    // Vacunas registradas
    $stmtVac = $pdo->prepare('SELECT ve.id_vacuna_estudiante, ve.fk_vacuna, v.nombre AS nombre_vacuna, ve.fecha_aplicacion, ve.refuerzos FROM vacunas_estudiante ve INNER JOIN vacuna v ON ve.fk_vacuna = v.id_vacuna WHERE ve.fk_estudiante = ? ORDER BY v.nombre');
    $stmtVac->execute([$idEst]);
    $row['vacunas'] = $stmtVac->fetchAll(\PDO::FETCH_ASSOC) ?: [];

    // Consultas médicas
    $stmtCons = $pdo->prepare('SELECT id_consulta, fk_estudiante, tipo_consulta, fecha_consulta AS fecha, motivo AS descripcion, observaciones AS tratamiento FROM consultas_medicas WHERE fk_estudiante = ? ORDER BY fecha_consulta DESC, id_consulta DESC');
    $stmtCons->execute([$idEst]);
    $row['consultas_medicas'] = $stmtCons->fetchAll(\PDO::FETCH_ASSOC) ?: [];

    // Estructura auxiliar de persona (facilita al frontend)
    $row['persona'] = [
      'id_persona' => $row['fk_persona'] ?? null,
      'primer_nombre' => $row['primer_nombre'] ?? null,
      'segundo_nombre' => $row['segundo_nombre'] ?? null,
      'primer_apellido' => $row['primer_apellido'] ?? null,
      'segundo_apellido' => $row['segundo_apellido'] ?? null,
      'fecha_nacimiento' => $row['fecha_nacimiento'] ?? null,
      'genero' => $row['genero'] ?? null,
      'cedula' => $row['cedula'] ?? null,
      'nacionalidad' => $row['nacionalidad'] ?? null,
      'direccion' => $row['direccion'] ?? null,
      'telefono_principal' => $row['telefono_principal'] ?? null,
      'telefono_secundario' => $row['telefono_secundario'] ?? null,
      'email' => $row['email'] ?? null,
      'tipo_sangre' => $row['tipo_sangre'] ?? null,
      'estado' => $row['estado_persona'] ?? null,
    ];

    return $row;
  }
}
