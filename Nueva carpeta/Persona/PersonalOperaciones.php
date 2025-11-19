<?php

namespace Micodigo\Persona;

use PDO;
use Exception;

trait PersonaOperaciones
{
  public function crear(PDO $pdo)
  {
    $errores = $this->_validarDatos($pdo);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "INSERT INTO personas (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, genero, cedula, nacionalidad, direccion, telefono_principal, telefono_secundario, email, tipo_persona, tipo_sangre, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->primer_nombre,
        $this->segundo_nombre,
        $this->primer_apellido,
        $this->segundo_apellido,
        $this->fecha_nacimiento,
        $this->genero,
        $this->cedula,
        $this->nacionalidad,
        $this->direccion,
        $this->telefono_principal,
        $this->telefono_secundario,
        $this->email,
        $this->tipo_persona,
        $this->tipo_sangre,
        $this->estado
      ]);
      $this->id_persona = $pdo->lastInsertId();
      return $this->id_persona;
    } catch (Exception $e) {
      if ($e->getCode() == '23000') {
        if (strpos($e->getMessage(), 'email') !== false) {
          return ['email' => ['El correo electrónico ya está en uso.']];
        } else if (strpos($e->getMessage(), 'cedula') !== false) {
          return ['cedula' => ['La cédula ya está en uso.']];
        }
      }
      return false;
    }
  }

  public function actualizar(PDO $pdo)
  {
    if (empty($this->id_persona)) return ['id_persona' => ['El ID de la persona es requerido.']];

    $errores = $this->_validarDatos($pdo);
    if ($errores !== true) {
      return $errores;
    }

    try {
      $sql = "UPDATE personas SET primer_nombre=?, segundo_nombre=?, primer_apellido=?, segundo_apellido=?, fecha_nacimiento=?, genero=?, cedula=?, nacionalidad=?, direccion=?, telefono_principal=?, telefono_secundario=?, email=?, tipo_persona=?, tipo_sangre=?, estado=? WHERE id_persona=?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->primer_nombre,
        $this->segundo_nombre,
        $this->primer_apellido,
        $this->segundo_apellido,
        $this->fecha_nacimiento,
        $this->genero,
        $this->cedula,
        $this->nacionalidad,
        $this->direccion,
        $this->telefono_principal,
        $this->telefono_secundario,
        $this->email,
        $this->tipo_persona,
        $this->tipo_sangre,
        $this->estado,
        $this->id_persona
      ]);
    } catch (Exception $e) {
      if ($e->getCode() == '23000') {
        if (strpos($e->getMessage(), 'email') !== false) {
          return ['email' => ['El correo electrónico ya está en uso.']];
        } else if (strpos($e->getMessage(), 'cedula') !== false) {
          return ['cedula' => ['La cédula ya está en uso.']];
        }
      }
      return false;
    }
  }

  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $stmt = $pdo->prepare("DELETE FROM personas WHERE id_persona = ?");
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      if ($e->getCode() == '23000') {
        return ['error_fk' => 'No se puede eliminar a la persona porque está asociada a otros registros (ej. un usuario).'];
      }
      return false;
    }
  }

  // Métodos adicionales para operaciones específicas
  public static function crearPersona(PDO $pdo, array $datosPersona)
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

  public static function actualizarPersona(PDO $pdo, $id_persona, array $datosPersona)
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

  public static function actualizarEstadoPersona(PDO $pdo, $id_persona, $estado)
  {
    try {
      $sql = "UPDATE personas SET estado = ? WHERE id_persona = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$estado, $id_persona]);
    } catch (Exception $e) {
      throw new Exception("Error al actualizar estado de persona: " . $e->getMessage());
    }
  }

  public static function cambiarEstadoPersona(PDO $pdo, $id_persona, $estado)
  {
    try {
      $sql = "UPDATE personas SET estado = ? WHERE id_persona = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$estado, $id_persona]);
    } catch (Exception $e) {
      throw new Exception("Error al cambiar estado de persona: " . $e->getMessage());
    }
  }
}
