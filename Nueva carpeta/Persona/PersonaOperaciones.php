<?php

namespace Micodigo\Persona;

use PDO;
use Exception;

trait PersonaOperaciones
{
  public function crear(PDO $pdo)
  {
    $errores = $this->validar($pdo);
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
      // Manejar error de duplicado de cédula o email
      if ($e->getCode() == '23000') { // Error de integridad (duplicado)
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

    $errores = $this->validar($pdo);
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

  public static function consultarTodos(PDO $pdo, array $filtros = [])
  {
    $sql = "SELECT * FROM personas";
    $where = [];
    $params = [];

    if (!empty($filtros['tipo_persona'])) {
      $where[] = "tipo_persona = ?";
      $params[] = $filtros['tipo_persona'];
    }

    if (!empty($where)) {
      $sql .= " WHERE " . implode(" AND ", $where);
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public static function consultar(PDO $pdo, $id)
  {
    $stmt = $pdo->prepare("SELECT * FROM personas WHERE id_persona = ?");
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  public static function eliminar(PDO $pdo, $id)
  {
    try {
      $stmt = $pdo->prepare("DELETE FROM personas WHERE id_persona = ?");
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      // Manejar error de clave foránea
      if ($e->getCode() == '23000') {
        return ['error_fk' => 'No se puede eliminar a la persona porque está asociada a otros registros (ej. un usuario).'];
      }
      return false;
    }
  }
}
