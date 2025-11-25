<?php

namespace Micodigo\Parentesco;

use PDO;

trait ValidacionesParentesco
{
  private static function tiposPermitidos(): array
  {
    return ['padre', 'madre', 'representante', 'tutor', 'encargado'];
  }

  public static function validarDatosCrear(PDO $pdo, array $data): array|bool
  {
    $err = [];
    foreach (['fk_estudiante', 'fk_representante', 'tipo_parentesco'] as $req) if (empty($data[$req])) $err[$req][] = 'Campo requerido';
    if (!empty($data['tipo_parentesco']) && !in_array($data['tipo_parentesco'], self::tiposPermitidos(), true)) $err['tipo_parentesco'][] = 'Tipo no permitido';
    if ($err) return $err;

    // Verificar estudiante existe y activo
    $stmt = $pdo->prepare('SELECT e.id_estudiante, p.estado FROM estudiantes e INNER JOIN personas p ON e.id_persona=p.id_persona WHERE e.id_estudiante=?');
    $stmt->execute([$data['fk_estudiante']]);
    $est = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$est) $err['fk_estudiante'][] = 'Estudiante no existe';
    else if ($est['estado'] !== 'activo') $err['fk_estudiante'][] = 'Estudiante no está activo';

    // Verificar representante existe y activo
    $stmt = $pdo->prepare('SELECT r.id_representante, p.estado FROM representantes r INNER JOIN personas p ON r.fk_persona=p.id_persona WHERE r.id_representante=?');
    $stmt->execute([$data['fk_representante']]);
    $rep = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$rep) $err['fk_representante'][] = 'Representante no existe';
    else if ($rep['estado'] !== 'activo') $err['fk_representante'][] = 'Representante no está activo';

    // Restricción único padre/madre
    if (in_array($data['tipo_parentesco'], ['padre', 'madre'], true)) {
      if (ConsultasParentesco::estudianteTieneTipo($pdo, (int)$data['fk_estudiante'], $data['tipo_parentesco'])) {
        $err['tipo_parentesco'][] = 'El estudiante ya tiene ' . $data['tipo_parentesco'];
      }
    }

    // Evitar duplicado exacto
    if (ConsultasParentesco::existeRelacion($pdo, (int)$data['fk_estudiante'], (int)$data['fk_representante'])) {
      $err['duplicado'][] = 'Ya existe este parentesco entre estudiante y representante';
    }

    return $err ?: true;
  }

  public static function validarDatosActualizar(PDO $pdo, int $id_parentesco, array $data): array|bool
  {
    $err = [];
    // Verificar que exista el registro
    $stmt = $pdo->prepare('SELECT fk_estudiante, fk_representante, tipo_parentesco FROM parentesco WHERE id_parentesco=?');
    $stmt->execute([$id_parentesco]);
    $orig = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$orig) {
      $err['id_parentesco'][] = 'Parentesco inexistente';
      return $err;
    }

    $tipoNuevo = $data['tipo_parentesco'] ?? $orig['tipo_parentesco'];
    $fkEst = $data['fk_estudiante'] ?? $orig['fk_estudiante'];
    $fkRep = $data['fk_representante'] ?? $orig['fk_representante'];

    if (!in_array($tipoNuevo, self::tiposPermitidos(), true)) $err['tipo_parentesco'][] = 'Tipo no permitido';

    // Restricción único padre/madre si se cambia o se reasigna
    if (in_array($tipoNuevo, ['padre', 'madre'], true)) {
      $stmt2 = $pdo->prepare('SELECT id_parentesco FROM parentesco WHERE fk_estudiante=? AND tipo_parentesco=? AND id_parentesco!=? LIMIT 1');
      $stmt2->execute([$fkEst, $tipoNuevo, $id_parentesco]);
      if ($stmt2->fetch()) $err['tipo_parentesco'][] = 'El estudiante ya tiene ' . $tipoNuevo;
    }

    // Duplicado exacto si se cambian claves
    $stmt3 = $pdo->prepare('SELECT id_parentesco FROM parentesco WHERE fk_estudiante=? AND fk_representante=? AND id_parentesco!=? LIMIT 1');
    $stmt3->execute([$fkEst, $fkRep, $id_parentesco]);
    if ($stmt3->fetch()) $err['duplicado'][] = 'Ya existe relación igual con otro registro';

    // Verificar activos
    $stmt4 = $pdo->prepare('SELECT p.estado FROM estudiantes e INNER JOIN personas p ON e.id_persona=p.id_persona WHERE e.id_estudiante=?');
    $stmt4->execute([$fkEst]);
    $est = $stmt4->fetch(PDO::FETCH_ASSOC);
    if (!$est) $err['fk_estudiante'][] = 'Estudiante inexistente';
    else if ($est['estado'] !== 'activo') $err['fk_estudiante'][] = 'Estudiante inactivo';

    $stmt5 = $pdo->prepare('SELECT p.estado FROM representantes r INNER JOIN personas p ON r.fk_persona=p.id_persona WHERE r.id_representante=?');
    $stmt5->execute([$fkRep]);
    $rep = $stmt5->fetch(PDO::FETCH_ASSOC);
    if (!$rep) $err['fk_representante'][] = 'Representante inexistente';
    else if ($rep['estado'] !== 'activo') $err['fk_representante'][] = 'Representante inactivo';

    return $err ?: true;
  }
}
