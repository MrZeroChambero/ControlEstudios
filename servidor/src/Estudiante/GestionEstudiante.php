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

    // Determinar cédula escolar final (usa la recibida o genera una nueva)
    $cedulaEscolar = self::generarCedulaEscolar($pdo, $id_persona, $data);
    $fechaIngreso = array_key_exists('fecha_ingreso_escuela', $data)
      ? trim((string) $data['fecha_ingreso_escuela'])
      : '';
    if ($fechaIngreso === '') {
      $fechaIngreso = date('Y-m-d');
    }

    // Asegurar valores válidos para columnas NOT NULL
    $vive_con_padres = $data['vive_con_padres'] ?? 'si';
    if (!in_array($vive_con_padres, ['si', 'no'], true)) {
      $vive_con_padres = 'si';
    }

    $orden_nacimiento = isset($data['orden_nacimiento']) && $data['orden_nacimiento'] !== ''
      ? (int) $data['orden_nacimiento']
      : 1;
    if ($orden_nacimiento < 1) {
      $orden_nacimiento = 1;
    }

    $tiempo_gestacion = isset($data['tiempo_gestacion']) && $data['tiempo_gestacion'] !== ''
      ? (int) $data['tiempo_gestacion']
      : 38;
    if ($tiempo_gestacion < 1) {
      $tiempo_gestacion = 38;
    }

    $embarazo_deseado = $data['embarazo_deseado'] ?? 'si';
    if (!in_array($embarazo_deseado, ['si', 'no'], true)) {
      $embarazo_deseado = 'si';
    }

    $tipo_parto = $data['tipo_parto'] ?? 'normal';
    if (!in_array($tipo_parto, ['cesaria', 'normal'], true)) {
      $tipo_parto = 'normal';
    }

    $control_esfinteres = $data['control_esfinteres'] ?? 'si';
    if (!in_array($control_esfinteres, ['si', 'no'], true)) {
      $control_esfinteres = 'si';
    }

    $control_embarazo = $data['control_embarazo'] ?? 'si';
    if (!in_array($control_embarazo, ['si', 'no'], true)) {
      $control_embarazo = 'si';
    }

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
        if ($c === 'cedula_escolar') {
          $normalizada = trim((string) $data[$c]);
          if ($normalizada === '') {
            continue;
          }
          $valor = $normalizada;
        } else {
          $valor = $data[$c] === '' ? null : $data[$c];
        }
        $sets[] = "$c = ?";
        $vals[] = $valor;
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
  public static function generarCedulaEscolar($pdo, $id_persona, array $data = [])
  {
    $proporcionada = null;
    if (array_key_exists('cedula_escolar', $data)) {
      $valor = trim((string) $data['cedula_escolar']);
      if ($valor !== '') {
        $proporcionada = $valor;
      }
    }

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM estudiantes WHERE cedula_escolar = ?');

    if ($proporcionada !== null) {
      $stmt->execute([$proporcionada]);
      if ((int) $stmt->fetchColumn() > 0) {
        throw new \RuntimeException('La cédula escolar proporcionada ya está registrada.');
      }
      return $proporcionada;
    }

    $year = date('Y');
    $base = $year . '-' . str_pad((string) $id_persona, 8, '0', STR_PAD_LEFT);
    $candidato = $base;
    $intentos = 0;

    while (true) {
      $stmt->execute([$candidato]);
      if ((int) $stmt->fetchColumn() === 0) {
        return $candidato;
      }

      $intentos += 1;
      if ($intentos > 999) {
        throw new \RuntimeException('No se pudo generar una cédula escolar única.');
      }
      $candidato = sprintf('%s-%03d', $base, $intentos);
    }
  }
}
