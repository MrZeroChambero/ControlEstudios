<?php

namespace Micodigo\Estudiante;

trait GestionEstudiante
{
  // Crear persona preliminar para estudiante (estado incompleto)
  public static function crearPersonaEstudiante($pdo, array $data)
  {
    $email = array_key_exists('email', $data) ? trim((string) $data['email']) : null;
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
      $email === '' ? null : $email,
      'estudiante',
      $data['tipo_sangre'],
      'incompleto'
    ]);
    return $pdo->lastInsertId();
  }

  // Registrar estudiante: crea registro estudiante y activa persona
  public static function registrarEstudiante($pdo, $id_persona, array $data)
  {
    // Activar persona (candidato -> activo)
    $stmtP = $pdo->prepare('UPDATE personas SET estado = ? WHERE id_persona = ?');
    $stmtP->execute(['activo', $id_persona]);

    // Placeholder generación cédula escolar (por ahora null)
    $cedulaEscolar = self::generarCedulaEscolar($pdo, $id_persona);
    $fechaIngreso = $data['fecha_ingreso_escuela'] ?? date('Y-m-d');
    // Valores por defecto si no llegan (la tabla parece tener NOT NULL)
    $vive_con_padres    = $data['vive_con_padres'] ?? 'si';
    $orden_nacimiento   = $data['orden_nacimiento'] ?? 1;
    $tiempo_gestacion   = $data['tiempo_gestacion'] ?? 38;
    $embarazo_deseado   = $data['embarazo_deseado'] ?? 'si';
    $tipo_parto         = $data['tipo_parto'] ?? 'normal';
    $control_esfinteres = $data['control_esfinteres'] ?? 'si';
    $control_embarazo   = $data['control_embarazo'] ?? 'si';

    $sql = "INSERT INTO estudiantes (id_persona, cedula_escolar, fecha_ingreso_escuela, vive_con_padres, orden_nacimiento, tiempo_gestacion, embarazo_deseado, tipo_parto, control_esfinteres, control_embarazo, estado) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
      $id_persona,
      $cedulaEscolar,
      $fechaIngreso,
      $vive_con_padres,
      $orden_nacimiento,
      $tiempo_gestacion,
      $embarazo_deseado,
      $tipo_parto,
      $control_esfinteres,
      $control_embarazo,
      'activo'
    ]);
    return $pdo->lastInsertId();
  }

  public static function actualizarEstudiante($pdo, $id_estudiante, array $data)
  {
    // Construir set dinámico permitiendo actualización de campos definidos
    $permitidos = [
      'cedula_escolar',
      'fecha_ingreso_escuela',
      'vive_con_padres',
      'orden_nacimiento',
      'tiempo_gestacion',
      'embarazo_deseado',
      'tipo_parto',
      'control_esfinteres',
      'control_embarazo'
    ];
    $sets = [];
    $vals = [];
    foreach ($permitidos as $c) {
      if (array_key_exists($c, $data)) {
        $sets[] = "$c = ?";
        $vals[] = $data[$c] === '' ? null : $data[$c];
      }
    }
    if (empty($sets)) return true; // nada que actualizar
    $vals[] = $id_estudiante;
    $sql = 'UPDATE estudiantes SET ' . implode(', ', $sets) . ' WHERE id_estudiante = ?';
    $stmt = $pdo->prepare($sql);
    return $stmt->execute($vals);
  }

  public static function cambiarEstadoEstudiante($pdo, $id_estudiante, string $estado)
  {
    $permitidos = ['activo', 'inactivo'];
    if (!in_array($estado, $permitidos, true)) return false;
    // Actualizar también estado de persona
    $stmtSel = $pdo->prepare('SELECT id_persona FROM estudiantes WHERE id_estudiante = ?');
    $stmtSel->execute([$id_estudiante]);
    $row = $stmtSel->fetch(\PDO::FETCH_ASSOC);
    if (!$row) return false;
    $id_persona = $row['id_persona'];
    $stmtEst = $pdo->prepare('UPDATE estudiantes SET estado = ? WHERE id_estudiante = ?');
    $stmtPer = $pdo->prepare('UPDATE personas SET estado = ? WHERE id_persona = ?');
    $ok1 = $stmtEst->execute([$estado, $id_estudiante]);
    $ok2 = $stmtPer->execute([$estado, $id_persona]);
    return $ok1 && $ok2;
  }

  // Método placeholder para futura lógica de generación de cédula escolar
  public static function generarCedulaEscolar($pdo, $id_persona)
  {
    return null; // Implementar futura lógica
  }
}
