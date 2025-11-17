<?php

namespace Micodigo\Evaluaciones;

use Micodigo\Config\Conexion;
use PDO;
use Exception;

class Evaluaciones
{
  public $id_evaluacion;
  public $nombre_evaluacion;
  public $descripcion;
  public $estado;

  public function __construct($nombre_evaluacion = null, $descripcion = null)
  {
    $this->nombre_evaluacion = $nombre_evaluacion;
    $this->descripcion = $descripcion;
    $this->estado = 'activo';
  }

  public static function consultarTodos($pdo)
  {
    try {
      $sql = "SELECT * FROM evaluaciones ORDER BY nombre_evaluacion";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar evaluaciones: " . $e->getMessage());
    }
  }

  public static function consultarParaSelect($pdo)
  {
    try {
      $sql = "SELECT id_evaluacion, nombre_evaluacion FROM evaluaciones WHERE estado = 'activo' ORDER BY nombre_evaluacion";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar evaluaciones para select: " . $e->getMessage());
    }
  }

  public static function consultarActualizar($pdo, $id)
  {
    try {
      $sql = "SELECT * FROM evaluaciones WHERE id_evaluacion = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

      if ($resultado) {
        $evaluacion = new Evaluaciones();
        $evaluacion->id_evaluacion = $resultado['id_evaluacion'];
        $evaluacion->nombre_evaluacion = $resultado['nombre_evaluacion'];
        $evaluacion->descripcion = $resultado['descripcion'];
        $evaluacion->estado = $resultado['estado'];
        return $evaluacion;
      }
      return null;
    } catch (Exception $e) {
      throw new Exception("Error al consultar evaluación para actualizar: " . $e->getMessage());
    }
  }

  public function crear($pdo)
  {
    try {
      $sql = "INSERT INTO evaluaciones (nombre_evaluacion, descripcion, estado) 
                    VALUES (?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->nombre_evaluacion,
        $this->descripcion,
        $this->estado
      ]);
      return $pdo->lastInsertId();
    } catch (Exception $e) {
      throw new Exception("Error al crear evaluación: " . $e->getMessage());
    }
  }

  public function actualizar($pdo)
  {
    try {
      $sql = "UPDATE evaluaciones 
                    SET nombre_evaluacion = ?, descripcion = ?
                    WHERE id_evaluacion = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->nombre_evaluacion,
        $this->descripcion,
        $this->id_evaluacion
      ]);
    } catch (Exception $e) {
      throw new Exception("Error al actualizar evaluación: " . $e->getMessage());
    }
  }

  public static function eliminar($pdo, $id)
  {
    try {
      $sql = "DELETE FROM evaluaciones WHERE id_evaluacion = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      throw new Exception("Error al eliminar evaluación: " . $e->getMessage());
    }
  }

  public static function cambiarEstado($pdo, $id)
  {
    try {
      // Primero obtener el estado actual
      $sql = "SELECT estado FROM evaluaciones WHERE id_evaluacion = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

      if ($resultado) {
        $nuevoEstado = $resultado['estado'] === 'activo' ? 'inactivo' : 'activo';

        $sql = "UPDATE evaluaciones SET estado = ? WHERE id_evaluacion = ?";
        $stmt = $pdo->prepare($sql);
        return $stmt->execute([$nuevoEstado, $id]);
      }
      return false;
    } catch (Exception $e) {
      throw new Exception("Error al cambiar estado de la evaluación: " . $e->getMessage());
    }
  }
}
