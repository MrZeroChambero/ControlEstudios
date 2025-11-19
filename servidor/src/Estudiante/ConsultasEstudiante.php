<?php

namespace Micodigo\Estudiante;

trait ConsultasEstudiante
{
  // Listar estudiantes (JOIN personas)
  public static function consultarTodosEstudiantes($pdo)
  {
    $sql = "SELECT e.id_estudiante, e.fk_persona, e.grado, e.seccion, e.fecha_registro, e.estado AS estado_estudiante,
            p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido, p.fecha_nacimiento, p.genero,
            p.cedula, p.nacionalidad, p.direccion, p.telefono_principal, p.telefono_secundario, p.email,
            p.tipo_sangre, p.estado AS estado_persona
            FROM estudiantes e INNER JOIN personas p ON e.fk_persona = p.id_persona
            ORDER BY p.primer_nombre, p.primer_apellido";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(\PDO::FETCH_ASSOC);
  }

  // Candidatos: personas incompletas tipo estudiante sin registro en estudiantes
  public static function consultarCandidatos($pdo)
  {
    $sql = "SELECT p.* FROM personas p
            LEFT JOIN estudiantes e ON e.fk_persona = p.id_persona
            WHERE p.tipo_persona = 'estudiante' AND p.estado = 'incompleto' AND e.id_estudiante IS NULL
            ORDER BY p.primer_nombre, p.primer_apellido";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(\PDO::FETCH_ASSOC);
  }

  public static function consultarEstudiantePorId($pdo, $id_estudiante)
  {
    $sql = "SELECT e.id_estudiante, e.fk_persona, e.grado, e.seccion, e.fecha_registro, e.estado AS estado_estudiante,
            p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido, p.fecha_nacimiento, p.genero,
            p.cedula, p.nacionalidad, p.direccion, p.telefono_principal, p.telefono_secundario, p.email,
            p.tipo_sangre, p.estado AS estado_persona
            FROM estudiantes e INNER JOIN personas p ON e.fk_persona = p.id_persona
            WHERE e.id_estudiante = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id_estudiante]);
    return $stmt->fetch(\PDO::FETCH_ASSOC);
  }
}
