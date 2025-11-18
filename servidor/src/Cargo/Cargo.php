<?php

namespace Micodigo\Cargo;

use PDO;
use Exception;

class Cargo
{
  public static function consultarTodos($pdo)
  {
    try {
      $sql = "SELECT id_cargo, nombre_cargo, tipo, codigo FROM cargos ORDER BY nombre_cargo";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar cargos: " . $e->getMessage());
    }
  }

  public static function consultarParaSelect($pdo)
  {
    try {
      $sql = "SELECT id_cargo, nombre_cargo, tipo FROM cargos ORDER BY nombre_cargo";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar cargos para select: " . $e->getMessage());
    }
  }

  public static function obtenerPorId($pdo, $id_cargo)
  {
    try {
      $sql = "SELECT id_cargo, nombre_cargo, tipo, codigo FROM cargos WHERE id_cargo = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id_cargo]);
      return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al obtener cargo por ID: " . $e->getMessage());
    }
  }

  public static function verificarNombreExistente($pdo, $nombre_cargo, $id_cargo_excluir = null)
  {
    try {
      $sql = "SELECT COUNT(*) as count FROM cargos WHERE nombre_cargo = ?";
      $params = [$nombre_cargo];

      if ($id_cargo_excluir !== null) {
        $sql .= " AND id_cargo != ?";
        $params[] = $id_cargo_excluir;
      }

      $stmt = $pdo->prepare($sql);
      $stmt->execute($params);
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
      return $resultado['count'] > 0;
    } catch (Exception $e) {
      throw new Exception("Error al verificar nombre de cargo existente: " . $e->getMessage());
    }
  }

  public static function verificarCodigoExistente($pdo, $codigo, $id_cargo_excluir = null)
  {
    try {
      $sql = "SELECT COUNT(*) as count FROM cargos WHERE codigo = ?";
      $params = [$codigo];

      if ($id_cargo_excluir !== null) {
        $sql .= " AND id_cargo != ?";
        $params[] = $id_cargo_excluir;
      }

      $stmt = $pdo->prepare($sql);
      $stmt->execute($params);
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
      return $resultado['count'] > 0;
    } catch (Exception $e) {
      throw new Exception("Error al verificar código de cargo existente: " . $e->getMessage());
    }
  }

  public static function verificarUsoEnPersonal($pdo, $id_cargo)
  {
    try {
      $sql = "SELECT COUNT(*) as count FROM personal WHERE fk_cargo = ? AND estado = 'activo'";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id_cargo]);
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
      return $resultado['count'] > 0;
    } catch (Exception $e) {
      throw new Exception("Error al verificar uso de cargo en personal: " . $e->getMessage());
    }
  }

  public static function crear($pdo, $datosCargo)
  {
    try {
      $sql = "INSERT INTO cargos (nombre_cargo, tipo, codigo) VALUES (?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $datosCargo['nombre_cargo'],
        $datosCargo['tipo'],
        $datosCargo['codigo']
      ]);
      return $pdo->lastInsertId();
    } catch (Exception $e) {
      throw new Exception("Error al crear cargo: " . $e->getMessage());
    }
  }

  public static function actualizar($pdo, $id_cargo, $datosCargo)
  {
    try {
      $sql = "UPDATE cargos SET nombre_cargo = ?, tipo = ?, codigo = ? WHERE id_cargo = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $datosCargo['nombre_cargo'],
        $datosCargo['tipo'],
        $datosCargo['codigo'],
        $id_cargo
      ]);
    } catch (Exception $e) {
      throw new Exception("Error al actualizar cargo: " . $e->getMessage());
    }
  }

  public static function eliminar($pdo, $id_cargo)
  {
    try {
      $sql = "DELETE FROM cargos WHERE id_cargo = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id_cargo]);
    } catch (Exception $e) {
      throw new Exception("Error al eliminar cargo: " . $e->getMessage());
    }
  }

  public static function consultarPorTipo($pdo, $tipo)
  {
    try {
      $sql = "SELECT id_cargo, nombre_cargo, tipo, codigo FROM cargos WHERE tipo = ? ORDER BY nombre_cargo";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$tipo]);
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar cargos por tipo: " . $e->getMessage());
    }
  }
}
