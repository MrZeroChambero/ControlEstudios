<?php

namespace Micodigo\Temas;

use Micodigo\Config\Conexion;
use PDO;
use Exception;

class Temas
{
  public $id_tema;
  public $fk_contenido;
  public $nombre_tema;
  public $estado;

  public function __construct($fk_contenido = null, $nombre_tema = null)
  {
    $this->fk_contenido = $fk_contenido;
    $this->nombre_tema = $nombre_tema;
    $this->estado = 'activo';
  }

  public static function consultarPorContenido($pdo, $id_contenido)
  {
    try {
      $sql = "SELECT t.*, c.nombre as nombre_contenido 
                    FROM temas t
                    INNER JOIN contenidos c ON t.fk_contenido = c.id_contenido
                    WHERE t.fk_contenido = ? 
                    ORDER BY t.id_tema";
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
      $sql = "SELECT t.*, c.estado as estado_contenido 
                    FROM temas t
                    INNER JOIN contenidos c ON t.fk_contenido = c.id_contenido
                    WHERE t.id_tema = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

      if ($resultado) {
        $tema = new Temas();
        $tema->id_tema = $resultado['id_tema'];
        $tema->fk_contenido = $resultado['fk_contenido'];
        $tema->nombre_tema = $resultado['nombre_tema'];
        $tema->estado = $resultado['estado'];
        $tema->estado_contenido = $resultado['estado_contenido'];
        return $tema;
      }
      return null;
    } catch (Exception $e) {
      throw new Exception("Error al consultar tema para actualizar: " . $e->getMessage());
    }
  }

  public static function verificarExistencia($pdo, $id)
  {
    try {
      $sql = "SELECT COUNT(*) as existe FROM temas WHERE id_tema = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
      return $resultado['existe'] > 0;
    } catch (Exception $e) {
      throw new Exception("Error al verificar existencia del tema: " . $e->getMessage());
    }
  }

  public static function verificarContenidoActivo($pdo, $id_contenido)
  {
    try {
      $sql = "SELECT estado FROM contenidos WHERE id_contenido = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id_contenido]);
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

      if (!$resultado) {
        throw new Exception("El contenido especificado no existe");
      }

      return $resultado['estado'] === 'activo';
    } catch (Exception $e) {
      throw new Exception("Error al verificar estado del contenido: " . $e->getMessage());
    }
  }

  public function crear($pdo)
  {
    try {
      // Verificar que el contenido esté activo
      if (!self::verificarContenidoActivo($pdo, $this->fk_contenido)) {
        throw new Exception("No se puede crear el tema porque el contenido asociado no está activo");
      }

      $sql = "INSERT INTO temas (fk_contenido, nombre_tema, estado) 
                    VALUES (?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->fk_contenido,
        $this->nombre_tema,
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
      // Verificar que el contenido esté activo
      if (!self::verificarContenidoActivo($pdo, $this->fk_contenido)) {
        throw new Exception("No se puede actualizar el tema porque el contenido asociado no está activo");
      }

      $sql = "UPDATE temas 
                    SET nombre_tema = ?
                    WHERE id_tema = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->nombre_tema,
        $this->id_tema
      ]);
    } catch (Exception $e) {
      throw new Exception("Error al actualizar tema: " . $e->getMessage());
    }
  }

  public static function eliminar($pdo, $id)
  {
    try {
      // Verificar que el tema existe antes de eliminar
      if (!self::verificarExistencia($pdo, $id)) {
        throw new Exception("El tema que intenta eliminar no existe");
      }

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
      // Verificar que el tema existe
      if (!self::verificarExistencia($pdo, $id)) {
        throw new Exception("El tema que intenta modificar no existe");
      }

      // Obtener el estado actual
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

  public static function consultarParaSelect($pdo, $id_contenido = null)
  {
    try {
      $sql = "SELECT id_tema, nombre_tema FROM temas WHERE estado = 'activo'";
      $params = [];

      if ($id_contenido !== null) {
        $sql .= " AND fk_contenido = ?";
        $params[] = $id_contenido;
      }

      $sql .= " ORDER BY id_tema";

      $stmt = $pdo->prepare($sql);
      $stmt->execute($params);
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar temas para select: " . $e->getMessage());
    }
  }
}
