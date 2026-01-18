<?php
// filepath: c:\xampp\htdocs\controlestudios\servidor\src\Personal\ConsultasPersonal.php
namespace Micodigo\Personal;

use Exception;
use PDO;

trait ConsultasPersonal
{
  public static function consultarTodoElPersonal($pdo)
  {
    try {
      $sql = "SELECT 
        per.id_personal,
        per.fk_persona,
        per.fk_cargo,
        per.fecha_contratacion,
        per.nivel_academico,
        per.horas_trabajo,
        per.rif,
        per.etnia_religion,
        per.cantidad_hijas,
        per.cantidad_hijos_varones,
        per.cod_dependencia,
        per.estado AS estado_personal,
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
        p.estado AS estado_persona,
        c.nombre_cargo,
        c.tipo AS tipo_cargo,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad
      FROM personal per
      INNER JOIN personas p ON per.fk_persona = p.id_persona
      LEFT JOIN cargos c ON per.fk_cargo = c.id_cargo
      ORDER BY p.primer_nombre, p.primer_apellido";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar todo el personal: " . $e->getMessage());
    }
  }

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
        p.estado AS estado_persona,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad
      FROM personas p
      WHERE (p.estado = 'incompleto' AND p.tipo_persona = 'personal')
         OR (
            p.estado = 'activo'
            AND p.tipo_persona IN ('estudiante','representante')
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
        estado AS estado_persona
      FROM personas WHERE id_persona = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id_persona]);
      return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al obtener persona por ID: " . $e->getMessage());
    }
  }

  public static function obtenerPersonalCompleto($pdo, $id_personal)
  {
    try {
      $sql = "SELECT 
        per.id_personal,
        per.fk_persona,
        per.fk_cargo,
        per.fecha_contratacion,
        per.nivel_academico,
        per.horas_trabajo,
        per.rif,
        per.etnia_religion,
        per.cantidad_hijas,
        per.cantidad_hijos_varones,
        per.cod_dependencia,
        per.estado AS estado_personal,
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
        p.estado AS estado_persona,
        c.nombre_cargo,
        c.tipo AS tipo_cargo,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad
      FROM personal per
      INNER JOIN personas p ON per.fk_persona = p.id_persona
      LEFT JOIN cargos c ON per.fk_cargo = c.id_cargo
      WHERE per.id_personal = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id_personal]);
      return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al obtener personal completo: " . $e->getMessage());
    }
  }

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
}
