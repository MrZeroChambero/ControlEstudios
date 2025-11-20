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
              JOIN imparticion_clases ic2 ON i2.fk_imparticion_clases = ic2.id_imparticion_clases
              JOIN aula a2 ON ic2.fk_aula = a2.id_aula
              JOIN anios_escolares ae2 ON a2.fk_anio_escolar = ae2.id_anio_escolar AND ae2.estado='activo'
              JOIN grado_seccion gs ON a2.fk_grado_seccion = gs.id_grado_seccion
              WHERE i2.fk_estudiante = e.id_estudiante
              ORDER BY i2.fecha_inscripcion DESC LIMIT 1), 'sin asignar') AS grado,
          COALESCE((SELECT gs.seccion FROM inscripciones i3 
              JOIN imparticion_clases ic3 ON i3.fk_imparticion_clases = ic3.id_imparticion_clases
              JOIN aula a3 ON ic3.fk_aula = a3.id_aula
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
              JOIN imparticion_clases ic2 ON i2.fk_imparticion_clases = ic2.id_imparticion_clases
              JOIN aula a2 ON ic2.fk_aula = a2.id_aula
              JOIN anios_escolares ae2 ON a2.fk_anio_escolar = ae2.id_anio_escolar AND ae2.estado='activo'
              JOIN grado_seccion gs ON a2.fk_grado_seccion = gs.id_grado_seccion
              WHERE i2.fk_estudiante = e.id_estudiante
              ORDER BY i2.fecha_inscripcion DESC LIMIT 1), 'sin asignar') AS grado,
          COALESCE((SELECT gs.seccion FROM inscripciones i3 
              JOIN imparticion_clases ic3 ON i3.fk_imparticion_clases = ic3.id_imparticion_clases
              JOIN aula a3 ON ic3.fk_aula = a3.id_aula
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
    return $stmt->fetch(\PDO::FETCH_ASSOC);
  }
}
