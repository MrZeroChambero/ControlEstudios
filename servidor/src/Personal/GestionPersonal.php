<?php

namespace Micodigo\Personal;

use Exception;
use PDO;

trait GestionPersonal
{
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

  public static function actualizarPersonalBD($pdo, $id_personal, $datosPersonal)
  {
    try {
      $sql = "UPDATE personal SET 
        fk_cargo = ?, fk_funcion = ?, fecha_contratacion = ?, nivel_academico = ?,
        horas_trabajo = ?, rif = ?, etnia_religion = ?, cantidad_hijas = ?, cantidad_hijos_varones = ?,
        cod_dependencia = ?, estado = ?
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

  public static function actualizarPersona($pdo, $id_persona, $datosPersona)
  {
    try {
      $sql = "UPDATE personas SET 
        primer_nombre = ?, segundo_nombre = ?, primer_apellido = ?, segundo_apellido = ?,
        fecha_nacimiento = ?, genero = ?, cedula = ?, nacionalidad = ?, direccion = ?,
        telefono_principal = ?, telefono_secundario = ?, email = ?, tipo_sangre = ?
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
}
