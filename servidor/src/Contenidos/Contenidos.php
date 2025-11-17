<?php

namespace Micodigo\Contenidos;

use Micodigo\Config\Conexion;
use PDO;
use Exception;

class Contenidos
{
  public $id_contenido;
  public $nombre;
  public $fk_area_aprendizaje;
  public $grado;
  public $descripcion;
  public $estado;

  public function __construct($nombre = null, $fk_area_aprendizaje = null, $grado = null, $descripcion = null)
  {
    $this->nombre = $nombre;
    $this->fk_area_aprendizaje = $fk_area_aprendizaje;
    $this->grado = $grado;
    $this->descripcion = $descripcion;
    $this->estado = 'activo';
  }

  public static function consultarTodos($pdo)
  {
    try {
      $sql = "SELECT c.*, a.nombre as nombre_area 
                    FROM contenidos c
                    LEFT JOIN areas_aprendizaje a ON c.fk_area_aprendizaje = a.id_area_aprendizaje
                    ORDER BY  c.nombre";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar contenidos: " . $e->getMessage());
    }
  }

  public static function consultarParaSelect($pdo)
  {
    try {
      $sql = "SELECT id_contenido, nombre FROM contenidos WHERE estado = 'activo' ORDER BY nombre";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar contenidos para select: " . $e->getMessage());
    }
  }

  public static function consultarActualizar($pdo, $id)
  {
    try {
      $sql = "SELECT * FROM contenidos WHERE id_contenido = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

      if ($resultado) {
        $contenido = new Contenidos();
        $contenido->id_contenido = $resultado['id_contenido'];
        $contenido->nombre = $resultado['nombre'];
        $contenido->fk_area_aprendizaje = $resultado['fk_area_aprendizaje'];
        $contenido->grado = $resultado['grado'];
        $contenido->descripcion = $resultado['descripcion'];
        $contenido->estado = $resultado['estado'];
        return $contenido;
      }
      return null;
    } catch (Exception $e) {
      throw new Exception("Error al consultar contenido para actualizar: " . $e->getMessage());
    }
  }

  public function crear($pdo)
  {
    try {
      $sql = "INSERT INTO contenidos (nombre, fk_area_aprendizaje, grado, descripcion, estado) 
                    VALUES (?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->nombre,
        $this->fk_area_aprendizaje,
        $this->grado,
        $this->descripcion,
        $this->estado
      ]);
      return $pdo->lastInsertId();
    } catch (Exception $e) {
      throw new Exception("Error al crear contenido: " . $e->getMessage());
    }
  }

  public function actualizar($pdo)
  {
    try {
      $sql = "UPDATE contenidos 
                    SET nombre = ?, fk_area_aprendizaje = ?, grado = ?, descripcion = ?
                    WHERE id_contenido = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->nombre,
        $this->fk_area_aprendizaje,
        $this->grado,
        $this->descripcion,
        $this->id_contenido
      ]);
    } catch (Exception $e) {
      throw new Exception("Error al actualizar contenido: " . $e->getMessage());
    }
  }

  public static function eliminar($pdo, $id)
  {
    try {
      $sql = "DELETE FROM contenidos WHERE id_contenido = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      throw new Exception("Error al eliminar contenido: " . $e->getMessage());
    }
  }

  public static function cambiarEstado($pdo, $id)
  {
    try {
      // Primero obtener el estado actual
      $sql = "SELECT estado FROM contenidos WHERE id_contenido = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

      if ($resultado) {
        $nuevoEstado = $resultado['estado'] === 'activo' ? 'inactivo' : 'activo';

        $sql = "UPDATE contenidos SET estado = ? WHERE id_contenido = ?";
        $stmt = $pdo->prepare($sql);
        return $stmt->execute([$nuevoEstado, $id]);
      }
      return false;
    } catch (Exception $e) {
      throw new Exception("Error al cambiar estado del contenido: " . $e->getMessage());
    }
  }
}
