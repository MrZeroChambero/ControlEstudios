<?php

use Micodigo\Config\Conexion;

/**
 * Registra rutas relacionadas con estudiantes.
 *
 * Detecta dinámicamente la columna FK hacia personas en la tabla 'estudiantes'
 * para evitar errores por nombres de columna distintos entre esquemas.
 *
 * @param AltoRouter $router
 * @param callable $mapAuthenticated wrapper para rutas autenticadas (opcional)
 */
function registrarRutasEstudiante(AltoRouter $router, callable $mapAuthenticated = null)
{
  $sendJson = function ($data, $code = 200) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
  };

  $hasColumn = function ($pdo, $table, $column) {
    $sql = "SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$table, $column]);
    $r = $stmt->fetch(PDO::FETCH_ASSOC);
    return (int)($r['cnt'] ?? 0) > 0;
  };

  // Busca una columna candidata en la tabla 'estudiantes' que apunte a 'personas'
  $findPersonaFk = function ($pdo) {
    $candidatas = ['fk_persona', 'id_persona', 'persona_id', 'fk_persona_id', 'id_persona_estudiante'];
    foreach ($candidatas as $col) {
      $sql = "SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'estudiantes' AND COLUMN_NAME = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$col]);
      $r = $stmt->fetch(PDO::FETCH_ASSOC);
      if ((int)($r['cnt'] ?? 0) > 0) return $col;
    }
    return false;
  };

  // LISTADO mínimo (solo nombres y apellidos)
  $handlerList = function () use ($sendJson, $findPersonaFk) {
    try {
      $pdo = Conexion::obtener();
      $fk = $findPersonaFk($pdo);
      if ($fk === false) {
        $sendJson(['back' => false, 'msg' => "No se encontró columna FK a personas en 'estudiantes'. Revisar esquema."], 500);
        return;
      }

      // Usamos nombres explícitos para evitar ambigüedad
      $sql = "SELECT e.id_estudiante, p.id_persona,
        p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido
      FROM estudiantes e
      JOIN personas p ON (e.{$fk} = p.id_persona)
      ORDER BY p.primer_apellido, p.primer_nombre";
      $stmt = $pdo->query($sql);
      $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
      $list = array_map(function ($r) {
        return [
          'id_estudiante' => $r['id_estudiante'],
          'id_persona' => $r['id_persona'],
          'primer_nombre' => $r['primer_nombre'],
          'segundo_nombre' => $r['segundo_nombre'],
          'primer_apellido' => $r['primer_apellido'],
          'segundo_apellido' => $r['segundo_apellido'],
        ];
      }, $rows);
      $sendJson(['back' => true, 'estudiantes' => $list], 200);
    } catch (Exception $e) {
      $sendJson(['back' => false, 'msg' => 'Error al listar estudiantes.', 'error' => $e->getMessage()], 500);
    }
  };

  // DETALLE completo
  $handlerDetail = function ($id = null) use ($sendJson, $findPersonaFk) {
    try {
      if (empty($id)) {
        $sendJson(['back' => false, 'msg' => 'ID de estudiante requerido.'], 400);
        return;
      }
      $pdo = Conexion::obtener();
      $fk = $findPersonaFk($pdo);
      if ($fk === false) {
        $sendJson(['back' => false, 'msg' => "No se encontró columna FK a personas en 'estudiantes'. Revisar esquema."], 500);
        return;
      }

      $sql = "SELECT e.id_estudiante, e.{$fk} AS id_persona, e.cedula_escolar, e.fecha_ingreso_escuela, e.vive_con_padres, e.orden_nacimiento, e.tiempo_gestacion, e.embarazo_deseado, e.tipo_parto, e.control_esfinteres,
               p.id_persona AS pid, p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido, p.cedula, p.fecha_nacimiento, p.genero, p.nacionalidad, p.direccion, p.telefono_principal, p.telefono_secundario, p.email
              FROM estudiantes e
              JOIN personas p ON e.{$fk} = p.id_persona
              WHERE e.id_estudiante = ? LIMIT 1";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $row = $stmt->fetch(PDO::FETCH_ASSOC);
      if (!$row) {
        $sendJson(['back' => false, 'msg' => 'Estudiante no encontrado.'], 404);
        return;
      }

      $persona = [
        'id_persona' => $row['id_persona'],
        'primer_nombre' => $row['primer_nombre'],
        'segundo_nombre' => $row['segundo_nombre'],
        'primer_apellido' => $row['primer_apellido'],
        'segundo_apellido' => $row['segundo_apellido'],
        'cedula' => $row['cedula'],
        'fecha_nacimiento' => $row['fecha_nacimiento'],
        'genero' => $row['genero'],
        'nacionalidad' => $row['nacionalidad'],
        'direccion' => $row['direccion'],
        'telefono_principal' => $row['telefono_principal'],
        'telefono_secundario' => $row['telefono_secundario'],
        'email' => $row['email'],
      ];
      $estudiante = [
        'id_estudiante' => $row['id_estudiante'],
        'cedula_escolar' => $row['cedula_escolar'],
        'fecha_ingreso_escuela' => $row['fecha_ingreso_escuela'],
        'vive_con_padres' => $row['vive_con_padres'],
        'orden_nacimiento' => $row['orden_nacimiento'],
        'tiempo_gestacion' => $row['tiempo_gestacion'],
        'embarazo_deseado' => $row['embarazo_deseado'],
        'tipo_parto' => $row['tipo_parto'],
        'control_esfinteres' => $row['control_esfinteres'],
      ];

      // Alergias
      $alergias = [];
      try {
        $stmt = $pdo->prepare("SELECT id_alergia, nombre_alergia, observaciones FROM alergias WHERE fk_persona = ?");
        $stmt->execute([$row['id_persona']]);
        $alergias = $stmt->fetchAll(PDO::FETCH_ASSOC);
      } catch (Exception $e) {
        $alergias = [];
      }

      // Vacunas
      $vacunas = [];
      try {
        $stmt = $pdo->prepare("SELECT id_vacuna, nombre_vacuna, fecha_aplicacion FROM vacunas WHERE fk_persona = ?");
        $stmt->execute([$row['id_persona']]);
        $vacunas = $stmt->fetchAll(PDO::FETCH_ASSOC);
      } catch (Exception $e) {
        $vacunas = [];
      }

      // Documentos
      $documentos = [];
      try {
        $stmt = $pdo->prepare("SELECT id_documento, tipo_documento, nombre_archivo, url FROM documentos WHERE fk_persona = ?");
        $stmt->execute([$row['id_persona']]);
        $documentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
      } catch (Exception $e) {
        $documentos = [];
      }

      $sendJson(['back' => true, 'persona' => $persona, 'estudiante' => $estudiante, 'alergias' => $alergias, 'vacunas' => $vacunas, 'documentos' => $documentos], 200);
    } catch (Exception $e) {
      $sendJson(['back' => false, 'msg' => 'Error al obtener detalle.', 'error' => $e->getMessage()], 500);
    }
  };

  // Activar / Desactivar / Eliminar: comprueban existencia de columna 'estado' antes de ejecutar
  $handlerActivar = function ($id = null) use ($sendJson, $hasColumn) {
    try {
      if (empty($id)) {
        $sendJson(['back' => false, 'msg' => 'ID requerido.'], 400);
        return;
      }
      $pdo = Conexion::obtener();
      if (!$hasColumn($pdo, 'estudiantes', 'estado')) {
        $sendJson(['back' => false, 'msg' => "Operación no soportada: columna 'estado' no existe en la tabla estudiantes."], 400);
        return;
      }
      $stmt = $pdo->prepare("UPDATE estudiantes SET estado = 'activo' WHERE id_estudiante = ?");
      $ok = $stmt->execute([$id]);
      if ($ok) $sendJson(['back' => true, 'msg' => 'Estudiante activado.']);
      else $sendJson(['back' => false, 'msg' => 'No se pudo activar.'], 500);
    } catch (Exception $e) {
      $sendJson(['back' => false, 'msg' => 'Error al activar.', 'error' => $e->getMessage()], 500);
    }
  };

  $handlerDesactivar = function ($id = null) use ($sendJson, $hasColumn) {
    try {
      if (empty($id)) {
        $sendJson(['back' => false, 'msg' => 'ID requerido.'], 400);
        return;
      }
      $pdo = Conexion::obtener();
      if (!$hasColumn($pdo, 'estudiantes', 'estado')) {
        $sendJson(['back' => false, 'msg' => "Operación no soportada: columna 'estado' no existe en la tabla estudiantes."], 400);
        return;
      }
      $stmt = $pdo->prepare("UPDATE estudiantes SET estado = 'inactivo' WHERE id_estudiante = ?");
      $ok = $stmt->execute([$id]);
      if ($ok) $sendJson(['back' => true, 'msg' => 'Estudiante desactivado.']);
      else $sendJson(['back' => false, 'msg' => 'No se pudo desactivar.'], 500);
    } catch (Exception $e) {
      $sendJson(['back' => false, 'msg' => 'Error al desactivar.', 'error' => $e->getMessage()], 500);
    }
  };

  $handlerDelete = function ($id = null) use ($sendJson, $hasColumn) {
    try {
      if (empty($id)) {
        $sendJson(['back' => false, 'msg' => 'ID requerido.'], 400);
        return;
      }
      $pdo = Conexion::obtener();
      if (!$hasColumn($pdo, 'estudiantes', 'estado')) {
        // si no existe 'estado', intentar borrar fila físicamente
        $stmt = $pdo->prepare("DELETE FROM estudiantes WHERE id_estudiante = ?");
        $ok = $stmt->execute([$id]);
        if ($ok) {
          $sendJson(['back' => true, 'msg' => 'Estudiante eliminado.']);
          return;
        }
        $sendJson(['back' => false, 'msg' => 'No se pudo eliminar.'], 500);
        return;
      }
      $stmt = $pdo->prepare("UPDATE estudiantes SET estado = 'eliminado' WHERE id_estudiante = ?");
      $ok = $stmt->execute([$id]);
      if ($ok) $sendJson(['back' => true, 'msg' => 'Estudiante marcado como eliminado.']);
      else $sendJson(['back' => false, 'msg' => 'No se pudo eliminar.'], 500);
    } catch (Exception $e) {
      $sendJson(['back' => false, 'msg' => 'Error al eliminar.', 'error' => $e->getMessage()], 500);
    }
  };

  // Actualizar datos del estudiante (PUT)
  $handlerUpdate = function ($id = null) use ($sendJson) {
    try {
      if (empty($id)) {
        $sendJson(['back' => false, 'msg' => 'ID requerido.'], 400);
        return;
      }
      $raw = file_get_contents('php://input');
      $data = json_decode($raw, true) ?: [];
      $fields = [];
      $values = [];
      $allowed = ['cedula_escolar', 'fecha_ingreso_escuela', 'vive_con_padres', 'orden_nacimiento', 'tiempo_gestacion', 'embarazo_deseado', 'tipo_parto', 'control_esfinteres'];
      foreach ($allowed as $f) {
        if (array_key_exists($f, $data)) {
          $fields[] = "$f = ?";
          $values[] = $data[$f];
        }
      }
      if (empty($fields)) {
        $sendJson(['back' => false, 'msg' => 'Nada para actualizar.'], 400);
        return;
      }
      $values[] = $id;
      $pdo = Conexion::obtener();
      $sql = "UPDATE estudiantes SET " . implode(', ', $fields) . " WHERE id_estudiante = ?";
      $stmt = $pdo->prepare($sql);
      $ok = $stmt->execute($values);
      if ($ok) $sendJson(['back' => true, 'msg' => 'Estudiante actualizado.']);
      else $sendJson(['back' => false, 'msg' => 'No se pudo actualizar.'], 500);
    } catch (Exception $e) {
      $sendJson(['back' => false, 'msg' => 'Error al actualizar.', 'error' => $e->getMessage()], 500);
    }
  };

  // Crear estudiante (POST)
  $handlerCreate = function () use ($sendJson, $findPersonaFk) {
    try {
      $raw = file_get_contents('php://input');
      $data = json_decode($raw, true) ?: [];
      if (empty($data['id_persona'])) {
        $sendJson(['back' => false, 'msg' => 'id_persona requerido.'], 400);
        return;
      }
      $pdo = Conexion::obtener();
      $fk = $findPersonaFk($pdo);
      if ($fk === false) {
        $sendJson(['back' => false, 'msg' => "No se encontró columna FK a personas en 'estudiantes'. Revisar esquema."], 500);
        return;
      }
      $sql = "INSERT INTO estudiantes ({$fk}, cedula_escolar, fecha_ingreso_escuela, vive_con_padres, orden_nacimiento, tiempo_gestacion, embarazo_deseado, tipo_parto, control_esfinteres)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $ok = $stmt->execute([
        $data['id_persona'],
        $data['cedula_escolar'] ?? null,
        $data['fecha_ingreso_escuela'] ?? null,
        $data['vive_con_padres'] ?? null,
        $data['orden_nacimiento'] ?? null,
        $data['tiempo_gestacion'] ?? null,
        $data['embarazo_deseado'] ?? null,
        $data['tipo_parto'] ?? null,
        $data['control_esfinteres'] ?? null
      ]);
      if ($ok) {
        $id = $pdo->lastInsertId();
        $sendJson(['back' => true, 'msg' => 'Estudiante creado.', 'id_estudiante' => $id], 201);
      } else {
        $err = $stmt->errorInfo();
        $sendJson(['back' => false, 'msg' => 'No se pudo crear estudiante.', 'error' => $err[2] ?? json_encode($err)], 500);
      }
    } catch (Exception $e) {
      $sendJson(['back' => false, 'msg' => 'Error al crear estudiante.', 'error' => $e->getMessage()], 500);
    }
  };

  // Registrar rutas
  $router->map('GET', '/estudiantes', $handlerList);
  $router->map('GET', '/estudiantes/[:id]', $handlerDetail);
  $router->map('POST', '/estudiantes', $handlerCreate);
  $router->map('PUT', '/estudiantes/[:id]', $handlerUpdate);
  $router->map('PATCH', '/estudiantes/[:id]/activar', $handlerActivar);
  $router->map('PATCH', '/estudiantes/[:id]/desactivar', $handlerDesactivar);
  $router->map('DELETE', '/estudiantes/[:id]', $handlerDelete);
}
