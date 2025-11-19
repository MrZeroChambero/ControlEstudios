<?php

namespace Micodigo\Estudiante;

trait GestionEstudiante
{
  // Crear persona preliminar para estudiante (estado incompleto)
  public static function crearPersonaEstudiante($pdo, array $data)
  {
    $sql = "INSERT INTO personas (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, genero, cedula, nacionalidad, direccion, telefono_principal, telefono_secundario, email, tipo_persona, tipo_sangre, estado)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
      $data['primer_nombre'],
      $data['segundo_nombre'] ?? null,
      $data['primer_apellido'],
      $data['segundo_apellido'] ?? null,
      $data['fecha_nacimiento'],
      $data['genero'],
      $data['cedula'] ?? null,
      $data['nacionalidad'],
      $data['direccion'],
      $data['telefono_principal'],
      $data['telefono_secundario'] ?? null,
      $data['email'] ?? null,
      'estudiante',
      $data['tipo_sangre'],
      'incompleto'
    ]);
    return $pdo->lastInsertId();
  }

  // Registrar estudiante: crea registro estudiante y activa persona
  public static function registrarEstudiante($pdo, $id_persona, array $data)
  {
    // Activar persona
    $stmtP = $pdo->prepare('UPDATE personas SET estado = ? WHERE id_persona = ?');
    $stmtP->execute(['activo', $id_persona]);

    $sql = "INSERT INTO estudiantes (fk_persona, grado, seccion, fecha_registro, estado) VALUES (?,?,?,?,?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
      $id_persona,
      $data['grado'],
      $data['seccion'] ?? null,
      date('Y-m-d'),
      'activo'
    ]);
    return $pdo->lastInsertId();
  }

  public static function actualizarEstudiante($pdo, $id_estudiante, array $data)
  {
    $sql = "UPDATE estudiantes SET grado = ?, seccion = ?, estado = ? WHERE id_estudiante = ?";
    $stmt = $pdo->prepare($sql);
    return $stmt->execute([
      $data['grado'],
      $data['seccion'] ?? null,
      $data['estado'] ?? 'activo',
      $id_estudiante
    ]);
  }

  public static function cambiarEstadoEstudiante($pdo, $id_estudiante, string $estado)
  {
    $permitidos = ['activo', 'inactivo'];
    if (!in_array($estado, $permitidos, true)) return false;
    $stmt = $pdo->prepare('UPDATE estudiantes SET estado = ? WHERE id_estudiante = ?');
    return $stmt->execute([$estado, $id_estudiante]);
  }
}
