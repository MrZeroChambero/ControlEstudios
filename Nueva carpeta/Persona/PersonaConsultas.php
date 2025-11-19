<?php

namespace Micodigo\Persona;

use PDO;
use Exception;

trait PersonaConsultas
{
  public static function consultarTodos(PDO $pdo, array $filtros = [])
  {
    $sql = "SELECT * FROM personas";
    $where = [];
    $params = [];

    if (!empty($filtros['tipo_persona'])) {
      $where[] = "tipo_persona = ?";
      $params[] = $filtros['tipo_persona'];
    }

    if (!empty($where)) {
      $sql .= " WHERE " . implode(" AND ", $where);
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public static function consultar(PDO $pdo, $id)
  {
    $stmt = $pdo->prepare("SELECT * FROM personas WHERE id_persona = ?");
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  public static function obtenerPersonaPorId(PDO $pdo, $id_persona)
  {
    try {
      $sql = "SELECT 
                id_persona,
                primer_nombre,
                segundo_nombre,
                primer_apellido,
                segundo_apellido,
                cedula,
                tipo_persona,
                estado
            FROM personas 
            WHERE id_persona = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id_persona]);
      return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al obtener persona por ID: " . $e->getMessage());
    }
  }

  public static function verificarCedulaExistente(PDO $pdo, $cedula, $id_persona = null)
  {
    try {
      $sql = "SELECT COUNT(*) as count FROM personas WHERE cedula = ?";
      $params = [$cedula];
      if ($id_persona !== null) {
        $sql .= " AND id_persona != ?";
        $params[] = $id_persona;
      }
      $stmt = $pdo->prepare($sql);
      $stmt->execute($params);
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
      return $resultado['count'] > 0;
    } catch (Exception $e) {
      throw new Exception("Error al verificar cédula existente: " . $e->getMessage());
    }
  }

  public static function consultarPersonasParaPersonal(PDO $pdo)
  {
    try {
      $sql = "SELECT 
                p.id_persona,
                p.primer_nombre,
                p.segundo_nombre,
                p.primer_apellido,
                p.segundo_apellido,
                p.cedula,
                p.fecha_nacimiento,
                p.tipo_persona,
                p.estado,
                TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as edad
            FROM personas p
            WHERE p.estado = 'incompleto' 
            AND p.tipo_persona = 'personal'
            OR (
                p.estado = 'activo' 
                AND p.tipo_persona IN ('estudiante', 'representante')
                AND TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) >= 18
            )
            AND p.id_persona NOT IN (
                SELECT fk_persona FROM personal WHERE estado = 'activo'
            )
            ORDER BY p.primer_nombre, p.primer_apellido";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar personas para personal: " . $e->getMessage());
    }
  }
}
