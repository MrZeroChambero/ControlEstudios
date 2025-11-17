<?php

namespace Micodigo\AreasAprendizaje;

use Micodigo\Config\Conexion;
use PDO;
use Exception;

class AreasAprendizaje
{
  public $id_area_aprendizaje;
  public $nombre_area;
  public $fk_componente;
  public $fk_funcion;
  public $estado;
  public $nombre_componente;
  public $nombre_funcion;

  public function __construct($nombre_area = null, $fk_componente = null, $fk_funcion = null)
  {
    $this->nombre_area = $nombre_area;
    $this->fk_componente = $fk_componente;
    $this->fk_funcion = $fk_funcion;
    $this->estado = 'activo';
  }

  public static function consultarTodos($pdo)
  {
    try {
      $sql = "SELECT aa.*, 
      aa.nombre as nombre_area,
                           ca.nombre as nombre_componente,
                           fp.nombre as nombre_funcion
                    FROM areas_aprendizaje aa
                    LEFT JOIN componentes_aprendizaje ca ON aa.fk_componente = ca.id_componente
                    LEFT JOIN funcion_personal fp ON aa.fk_funcion = fp.id_funcion_personal
                    ORDER BY aa.id_area_aprendizaje DESC";

      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar áreas de aprendizaje: " . $e->getMessage());
    }
  }

  public static function consultarParaSelect($pdo)
  {
    try {
      $sql = "SELECT id_area_aprendizaje, nombre as nombre_area
                    FROM areas_aprendizaje 
                    WHERE estado = 'activo'
                    ORDER BY nombre_area";

      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar áreas para select: " . $e->getMessage());
    }
  }

  public static function consultarActualizar($pdo, $id)
  {
    try {
      $sql = "SELECT id_area_aprendizaje, nombre as nombre_area, fk_componente, fk_funcion, estado
                    FROM areas_aprendizaje WHERE id_area_aprendizaje = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

      if ($resultado) {
        $area = new AreasAprendizaje();
        $area->id_area_aprendizaje = $resultado['id_area_aprendizaje'];
        $area->nombre_area = $resultado['nombre_area'];
        $area->fk_componente = $resultado['fk_componente'];
        $area->fk_funcion = $resultado['fk_funcion'];
        $area->estado = $resultado['estado'];
        return $area;
      }
      return null;
    } catch (Exception $e) {
      throw new Exception("Error al consultar área para actualizar: " . $e->getMessage());
    }
  }

  public function crear($pdo)
  {
    try {
      $sql = "INSERT INTO areas_aprendizaje (nombre, fk_componente, fk_funcion, estado) 
                    VALUES (?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->nombre_area,
        $this->fk_componente,
        $this->fk_funcion,
        $this->estado
      ]);
      return $pdo->lastInsertId();
    } catch (Exception $e) {
      throw new Exception("Error al crear área de aprendizaje: " . $e->getMessage());
    }
  }

  public function actualizar($pdo)
  {
    try {
      $sql = "UPDATE areas_aprendizaje 
                    SET nombre = ?, fk_componente = ?, fk_funcion = ?
                    WHERE id_area_aprendizaje = ?";
      $stmt = $pdo->prepare($sql);
      $resultado = $stmt->execute([
        $this->nombre_area,
        $this->fk_componente,
        $this->fk_funcion,
        $this->id_area_aprendizaje
      ]);
      return $resultado;
    } catch (Exception $e) {
      throw new Exception("Error al actualizar área de aprendizaje: " . $e->getMessage());
    }
  }

  public static function eliminar($pdo, $id)
  {
    try {
      $sql = "DELETE FROM areas_aprendizaje WHERE id_area_aprendizaje = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      throw new Exception("Error al eliminar área de aprendizaje: " . $e->getMessage());
    }
  }

  public static function cambiarEstado($pdo, $id)
  {
    try {
      // Primero obtener el estado actual
      $sql = "SELECT estado FROM areas_aprendizaje WHERE id_area_aprendizaje = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

      if ($resultado) {
        $nuevoEstado = $resultado['estado'] === 'activo' ? 'inactivo' : 'activo';

        $sql = "UPDATE areas_aprendizaje SET estado = ? WHERE id_area_aprendizaje = ?";
        $stmt = $pdo->prepare($sql);
        return $stmt->execute([$nuevoEstado, $id]);
      }
      return false;
    } catch (Exception $e) {
      throw new Exception("Error al cambiar estado del área de aprendizaje: " . $e->getMessage());
    }
  }
}
