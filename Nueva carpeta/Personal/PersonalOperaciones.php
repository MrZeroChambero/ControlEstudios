<?php

namespace Micodigo\Personal;

use Micodigo\Config\Conexion;
use PDO;
use Exception;

class Personal
{
  /**
   * Consultar todo el personal con información completa
   */
  public static function consultarTodoElPersonal($pdo)
  {
    try {
      $sql = "SELECT 
                per.id_personal,
                per.fk_persona,
                per.fk_cargo,
                per.fk_funcion,
                per.fecha_contratacion,
                per.nivel_academico,
                per.horas_trabajo,
                per.rif,
                per.etnia_religion,
                per.cantidad_hijas,
                per.cantidad_hijos_varones,
                per.estado,
                per.cod_dependencia,
                p.primer_nombre,
                p.segundo_nombre,
                p.primer_apellido,
                p.segundo_apellido,
                p.cedula,
                p.fecha_nacimiento,
                p.genero,
                p.nacionalidad,
                p.direccion,
                p.telefono_principal,
                p.telefono_secundario,
                p.email,
                p.tipo_sangre,
                c.nombre_cargo,
                c.tipo as tipo_cargo,
                fp.nombre as nombre_funcion,
                fp.tipo as tipo_funcion,
                TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as edad
            FROM personal per
            INNER JOIN personas p ON per.fk_persona = p.id_persona
            LEFT JOIN cargos c ON per.fk_cargo = c.id_cargo
            LEFT JOIN funcion_personal fp ON per.fk_funcion = fp.id_funcion_personal
            ORDER BY p.primer_nombre, p.primer_apellido";

      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar todo el personal: " . $e->getMessage());
    }
  }

  /**
   * Consultar personas disponibles para asignar como personal
   */
  public static function consultarPersonasParaPersonal($pdo)
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
            WHERE (p.estado = 'incompleto' AND p.tipo_persona = 'personal')
               OR (p.estado = 'activo' 
                   AND p.tipo_persona IN ('estudiante', 'representante')
                   AND TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) >= 18)
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

  /**
   * Verificar si una cédula ya existe
   */
  public static function verificarCedulaExistente($pdo, $cedula, $id_persona = null)
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

  /**
   * Crear una nueva persona
   */
  public static function crearPersona($pdo, $datosPersona)
  {
    try {
      $sql = "INSERT INTO personas (
                primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
                fecha_nacimiento, genero, cedula, nacionalidad, direccion,
                telefono_principal, telefono_secundario, email, tipo_persona, tipo_sangre, estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $datosPersona['primer_nombre'],
        $datosPersona['segundo_nombre'],
        $datosPersona['primer_apellido'],
        $datosPersona['segundo_apellido'],
        $datosPersona['fecha_nacimiento'],
        $datosPersona['genero'],
        $datosPersona['cedula'],
        $datosPersona['nacionalidad'],
        $datosPersona['direccion'],
        $datosPersona['telefono_principal'],
        $datosPersona['telefono_secundario'],
        $datosPersona['email'],
        $datosPersona['tipo_persona'],
        $datosPersona['tipo_sangre'],
        $datosPersona['estado']
      ]);
      return $pdo->lastInsertId();
    } catch (Exception $e) {
      throw new Exception("Error al crear persona: " . $e->getMessage());
    }
  }

  /**
   * Obtener persona por ID
   */
  public static function obtenerPersonaPorId($pdo, $id_persona)
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

  /**
   * Crear registro de personal
   */
  public static function crearPersonal($pdo, $datosPersonal)
  {
    try {
      $sql = "INSERT INTO personal (
                fk_persona, fk_cargo, fk_funcion, fecha_contratacion,
                nivel_academico, horas_trabajo, rif, etnia_religion,
                cantidad_hijas, cantidad_hijos_varones, cod_dependencia, estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $datosPersonal['fk_persona'],
        $datosPersonal['fk_cargo'],
        $datosPersonal['fk_funcion'],
        $datosPersonal['fecha_contratacion'],
        $datosPersonal['nivel_academico'],
        $datosPersonal['horas_trabajo'],
        $datosPersonal['rif'],
        $datosPersonal['etnia_religion'],
        $datosPersonal['cantidad_hijas'],
        $datosPersonal['cantidad_hijos_varones'],
        $datosPersonal['cod_dependencia'],
        $datosPersonal['estado']
      ]);
      return $pdo->lastInsertId();
    } catch (Exception $e) {
      throw new Exception("Error al crear personal: " . $e->getMessage());
    }
  }

  /**
   * Actualizar estado de una persona
   */
  public static function actualizarEstadoPersona($pdo, $id_persona, $estado)
  {
    try {
      $sql = "UPDATE personas SET estado = ? WHERE id_persona = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$estado, $id_persona]);
    } catch (Exception $e) {
      throw new Exception("Error al actualizar estado de persona: " . $e->getMessage());
    }
  }

  /**
   * Obtener información completa de personal por ID
   */
  public static function obtenerPersonalCompleto($pdo, $id_personal)
  {
    try {
      $sql = "SELECT 
                per.*,
                p.primer_nombre,
                p.segundo_nombre,
                p.primer_apellido,
                p.segundo_apellido,
                p.cedula,
                p.fecha_nacimiento,
                p.genero,
                p.nacionalidad,
                p.direccion,
                p.telefono_principal,
                p.telefono_secundario,
                p.email,
                p.tipo_sangre,
                c.nombre_cargo,
                c.tipo as tipo_cargo,
                fp.nombre as nombre_funcion,
                fp.tipo as tipo_funcion,
                TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as edad
            FROM personal per
            INNER JOIN personas p ON per.fk_persona = p.id_persona
            LEFT JOIN cargos c ON per.fk_cargo = c.id_cargo
            LEFT JOIN funcion_personal fp ON per.fk_funcion = fp.id_funcion_personal
            WHERE per.id_personal = ?";

      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id_personal]);
      return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al obtener personal completo: " . $e->getMessage());
    }
  }

  /**
   * Actualizar datos de personal
   */
  public static function actualizarPersonal($pdo, $id_personal, $datosPersonal)
  {
    try {
      $sql = "UPDATE personal SET 
                fk_cargo = ?,
                fk_funcion = ?,
                fecha_contratacion = ?,
                nivel_academico = ?,
                horas_trabajo = ?,
                rif = ?,
                etnia_religion = ?,
                cantidad_hijas = ?,
                cantidad_hijos_varones = ?,
                cod_dependencia = ?,
                estado = ?
            WHERE id_personal = ?";

      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $datosPersonal['fk_cargo'],
        $datosPersonal['fk_funcion'],
        $datosPersonal['fecha_contratacion'],
        $datosPersonal['nivel_academico'],
        $datosPersonal['horas_trabajo'],
        $datosPersonal['rif'],
        $datosPersonal['etnia_religion'],
        $datosPersonal['cantidad_hijas'],
        $datosPersonal['cantidad_hijos_varones'],
        $datosPersonal['cod_dependencia'],
        $datosPersonal['estado'],
        $id_personal
      ]);
    } catch (Exception $e) {
      throw new Exception("Error al actualizar personal: " . $e->getMessage());
    }
  }

  /**
   * Actualizar datos de persona
   */
  public static function actualizarPersona($pdo, $id_persona, $datosPersona)
  {
    try {
      $sql = "UPDATE personas SET 
                primer_nombre = ?,
                segundo_nombre = ?,
                primer_apellido = ?,
                segundo_apellido = ?,
                fecha_nacimiento = ?,
                genero = ?,
                cedula = ?,
                nacionalidad = ?,
                direccion = ?,
                telefono_principal = ?,
                telefono_secundario = ?,
                email = ?,
                tipo_sangre = ?
            WHERE id_persona = ?";

      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $datosPersona['primer_nombre'],
        $datosPersona['segundo_nombre'],
        $datosPersona['primer_apellido'],
        $datosPersona['segundo_apellido'],
        $datosPersona['fecha_nacimiento'],
        $datosPersona['genero'],
        $datosPersona['cedula'],
        $datosPersona['nacionalidad'],
        $datosPersona['direccion'],
        $datosPersona['telefono_principal'],
        $datosPersona['telefono_secundario'],
        $datosPersona['email'],
        $datosPersona['tipo_sangre'],
        $id_persona
      ]);
    } catch (Exception $e) {
      throw new Exception("Error al actualizar persona: " . $e->getMessage());
    }
  }

  /**
   * Cambiar estado del personal
   */
  public static function cambiarEstadoPersonal($pdo, $id_personal, $estado)
  {
    try {
      $sql = "UPDATE personal SET estado = ? WHERE id_personal = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$estado, $id_personal]);
    } catch (Exception $e) {
      throw new Exception("Error al cambiar estado del personal: " . $e->getMessage());
    }
  }

  /**
   * Eliminar personal
   */
  public static function eliminarPersonal($pdo, $id_personal)
  {
    try {
      $sql = "DELETE FROM personal WHERE id_personal = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id_personal]);
    } catch (Exception $e) {
      throw new Exception("Error al eliminar personal: " . $e->getMessage());
    }
  }

  /**
   * Cambiar estado de persona
   */
  public static function cambiarEstadoPersona($pdo, $id_persona, $estado)
  {
    try {
      $sql = "UPDATE personas SET estado = ? WHERE id_persona = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$estado, $id_persona]);
    } catch (Exception $e) {
      throw new Exception("Error al cambiar estado de persona: " . $e->getMessage());
    }
  }

  /**
   * Consultar cargos disponibles
   */
  public static function consultarCargos($pdo)
  {
    try {
      $sql = "SELECT id_cargo, nombre_cargo, tipo FROM cargos ORDER BY nombre_cargo";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar cargos: " . $e->getMessage());
    }
  }

  /**
   * Consultar funciones disponibles
   */
  public static function consultarFunciones($pdo)
  {
    try {
      $sql = "SELECT id_funcion_personal, nombre, tipo FROM funcion_personal ORDER BY nombre";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar funciones: " . $e->getMessage());
    }
  }

  /**
   * Buscar personal por término
   */
  public static function buscarPersonal($pdo, $termino)
  {
    try {
      $sql = "SELECT 
                per.id_personal,
                p.primer_nombre,
                p.segundo_nombre,
                p.primer_apellido,
                p.segundo_apellido,
                p.cedula,
                c.nombre_cargo,
                fp.nombre as nombre_funcion,
                per.estado
            FROM personal per
            INNER JOIN personas p ON per.fk_persona = p.id_persona
            LEFT JOIN cargos c ON per.fk_cargo = c.id_cargo
            LEFT JOIN funcion_personal fp ON per.fk_funcion = fp.id_funcion_personal
            WHERE p.primer_nombre LIKE ? 
               OR p.segundo_nombre LIKE ? 
               OR p.primer_apellido LIKE ? 
               OR p.segundo_apellido LIKE ? 
               OR p.cedula LIKE ?
               OR c.nombre_cargo LIKE ?
               OR fp.nombre LIKE ?
            ORDER BY p.primer_nombre, p.primer_apellido";

      $terminoLike = "%$termino%";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $terminoLike,
        $terminoLike,
        $terminoLike,
        $terminoLike,
        $terminoLike,
        $terminoLike,
        $terminoLike
      ]);
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al buscar personal: " . $e->getMessage());
    }
  }
}
