<?php

namespace Micodigo\Temas;

use Micodigo\Config\Conexion;
use PDO;
use Exception;

class Temas
{
  public $id_tema;
  public $fk_contenido;
  public $codigo;
  public $nombre_tema;
  public $descripcion;
  public $orden_tema;
  public $estado;

  public function __construct($fk_contenido = null, $codigo = null, $nombre_tema = null, $descripcion = null, $orden_tema = 1)
  {
    $this->fk_contenido = $fk_contenido;
    $this->codigo = $codigo;
    $this->nombre_tema = $nombre_tema;
    $this->descripcion = $descripcion;
    $this->orden_tema = $orden_tema;
    $this->estado = 'activo';
  }

  public static function consultarPorContenido($pdo, $id_contenido)
  {
    try {
      $sql = "SELECT * FROM temas WHERE fk_contenido = ? ORDER BY orden_tema, nombre_tema";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id_contenido]);
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar temas por contenido: " . $e->getMessage());
    }
  }

  public static function consultarActualizar($pdo, $id)
  {
    try {
      $sql = "SELECT * FROM temas WHERE id_tema = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

      if ($resultado) {
        $tema = new Temas();
        $tema->id_tema = $resultado['id_tema'];
        $tema->fk_contenido = $resultado['fk_contenido'];
        $tema->codigo = $resultado['codigo'];
        $tema->nombre_tema = $resultado['nombre_tema'];
        $tema->descripcion = $resultado['descripcion'];
        $tema->orden_tema = $resultado['orden_tema'];
        $tema->estado = $resultado['estado'];
        return $tema;
      }
      return null;
    } catch (Exception $e) {
      throw new Exception("Error al consultar tema para actualizar: " . $e->getMessage());
    }
  }

  public function crear($pdo)
  {
    try {
      $sql = "INSERT INTO temas (fk_contenido, codigo, nombre_tema, descripcion, orden_tema, estado) 
                    VALUES (?, ?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->fk_contenido,
        $this->codigo,
        $this->nombre_tema,
        $this->descripcion,
        $this->orden_tema,
        $this->estado
      ]);
      return $pdo->lastInsertId();
    } catch (Exception $e) {
      throw new Exception("Error al crear tema: " . $e->getMessage());
    }
  }

  public function actualizar($pdo)
  {
    try {
      $sql = "UPDATE temas 
                    SET codigo = ?, nombre_tema = ?, descripcion = ?, orden_tema = ?
                    WHERE id_tema = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->codigo,
        $this->nombre_tema,
        $this->descripcion,
        $this->orden_tema,
        $this->id_tema
      ]);
    } catch (Exception $e) {
      throw new Exception("Error al actualizar tema: " . $e->getMessage());
    }
  }

  public static function eliminar($pdo, $id)
  {
    try {
      $sql = "DELETE FROM temas WHERE id_tema = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      throw new Exception("Error al eliminar tema: " . $e->getMessage());
    }
  }

  public static function cambiarEstado($pdo, $id)
  {
    try {
      // Primero obtener el estado actual
      $sql = "SELECT estado FROM temas WHERE id_tema = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

      if ($resultado) {
        $nuevoEstado = $resultado['estado'] === 'activo' ? 'inactivo' : 'activo';

        $sql = "UPDATE temas SET estado = ? WHERE id_tema = ?";
        $stmt = $pdo->prepare($sql);
        return $stmt->execute([$nuevoEstado, $id]);
      }
      return false;
    } catch (Exception $e) {
      throw new Exception("Error al cambiar estado del tema: " . $e->getMessage());
    }
  }
}
