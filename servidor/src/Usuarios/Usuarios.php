<?php

namespace Micodigo\Usuarios;

use Micodigo\Config\Conexion;
use Micodigo\PreguntasSeguridad\PreguntasSeguridad;
use PDO;
use Exception;

class Usuarios
{
  public $id_usuario;
  public $fk_personal;
  public $nombre_usuario;
  public $contrasena_hash;
  public $estado;
  public $rol;
  public $ultimo_login;
  public $intentos_fallidos;
  public $fecha_bloqueo;

  public function __construct($fk_personal = null, $nombre_usuario = null, $contrasena_hash = null, $rol = null)
  {
    $this->fk_personal = $fk_personal;
    $this->nombre_usuario = $nombre_usuario;
    $this->contrasena_hash = $contrasena_hash;
    $this->rol = $rol;
    $this->estado = 'activo';
  }

  public static function consultarTodos($pdo)
  {
    try {
      $sql = "SELECT u.*, 
                           p.fk_persona,
                           per.primer_nombre, 
                           per.segundo_nombre, 
                           per.primer_apellido, 
                           per.segundo_apellido,
                           per.cedula,
                           car.nombre_cargo
                    FROM usuarios u
                    INNER JOIN personal p ON u.fk_personal = p.id_personal
                    INNER JOIN personas per ON p.fk_persona = per.id_persona
                    LEFT JOIN cargos car ON p.fk_cargo = car.id_cargo
                    ORDER BY u.nombre_usuario";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar usuarios: " . $e->getMessage());
    }
  }

  public static function consultarParaSelect($pdo)
  {
    try {
      $sql = "SELECT id_usuario, nombre_usuario FROM usuarios WHERE estado = 'activo' ORDER BY nombre_usuario";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar usuarios para select: " . $e->getMessage());
    }
  }

  public static function consultarActualizar($pdo, $id)
  {
    try {
      $sql = "SELECT u.*, 
                           p.fk_persona,
                           per.primer_nombre, 
                           per.segundo_nombre, 
                           per.primer_apellido, 
                           per.segundo_apellido,
                           per.cedula,
                           car.nombre_cargo
                    FROM usuarios u
                    INNER JOIN personal p ON u.fk_personal = p.id_personal
                    INNER JOIN personas per ON p.fk_persona = per.id_persona
                    LEFT JOIN cargos car ON p.fk_cargo = car.id_cargo
                    WHERE u.id_usuario = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

      if ($resultado) {
        $usuario = new Usuarios();
        $usuario->id_usuario = $resultado['id_usuario'];
        $usuario->fk_personal = $resultado['fk_personal'];
        $usuario->nombre_usuario = $resultado['nombre_usuario'];
        $usuario->contrasena_hash = $resultado['contrasena_hash'];
        $usuario->estado = $resultado['estado'];
        $usuario->rol = $resultado['rol'];
        $usuario->ultimo_login = $resultado['ultimo_login'];
        $usuario->intentos_fallidos = $resultado['intentos_fallidos'];
        $usuario->fecha_bloqueo = $resultado['fecha_bloqueo'];
        // Datos de la persona y cargo para mostrar
        $usuario->nombre_completo = $resultado['primer_nombre'] . ' ' .
          ($resultado['segundo_nombre'] ? $resultado['segundo_nombre'] . ' ' : '') .
          $resultado['primer_apellido'] . ' ' .
          ($resultado['segundo_apellido'] ? $resultado['segundo_apellido'] : '');
        $usuario->cedula = $resultado['cedula'];
        $usuario->cargo = $resultado['nombre_cargo'];
        return $usuario;
      }
      return null;
    } catch (Exception $e) {
      throw new Exception("Error al consultar usuario para actualizar: " . $e->getMessage());
    }
  }

  public function crear($pdo)
  {
    try {
      $sql = "INSERT INTO usuarios (fk_personal, nombre_usuario, contrasena_hash, estado, rol) 
                    VALUES (?, ?, ?, ?, ?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $this->fk_personal,
        $this->nombre_usuario,
        $this->contrasena_hash,
        $this->estado,
        $this->rol
      ]);
      return $pdo->lastInsertId();
    } catch (Exception $e) {
      throw new Exception("Error al crear usuario: " . $e->getMessage());
    }
  }

  public function actualizar($pdo)
  {
    try {
      $sql = "UPDATE usuarios 
                    SET nombre_usuario = ?, contrasena_hash = ?, estado = ?, rol = ?
                    WHERE id_usuario = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([
        $this->nombre_usuario,
        $this->contrasena_hash,
        $this->estado,
        $this->rol,
        $this->id_usuario
      ]);
    } catch (Exception $e) {
      throw new Exception("Error al actualizar usuario: " . $e->getMessage());
    }
  }

  public static function eliminar($pdo, $id)
  {
    try {
      $sql = "DELETE FROM usuarios WHERE id_usuario = ?";
      $stmt = $pdo->prepare($sql);
      return $stmt->execute([$id]);
    } catch (Exception $e) {
      throw new Exception("Error al eliminar usuario: " . $e->getMessage());
    }
  }

  public static function cambiarEstado($pdo, $id)
  {
    try {
      $sql = "SELECT estado FROM usuarios WHERE id_usuario = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

      if ($resultado) {
        $nuevoEstado = $resultado['estado'] === 'activo' ? 'inactivo' : 'activo';

        $sql = "UPDATE usuarios SET estado = ? WHERE id_usuario = ?";
        $stmt = $pdo->prepare($sql);
        return $stmt->execute([$nuevoEstado, $id]);
      }
      return false;
    } catch (Exception $e) {
      throw new Exception("Error al cambiar estado del usuario: " . $e->getMessage());
    }
  }

  // Verificar si el nombre de usuario ya existe (excepto para el mismo usuario en actualización)
  public static function verificarNombreUsuario($pdo, $nombre_usuario, $id_usuario = null)
  {
    try {
      $sql = "SELECT COUNT(*) as count FROM usuarios WHERE nombre_usuario = ?";
      $params = [$nombre_usuario];
      if ($id_usuario !== null) {
        $sql .= " AND id_usuario != ?";
        $params[] = $id_usuario;
      }
      $stmt = $pdo->prepare($sql);
      $stmt->execute($params);
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
      return $resultado['count'] > 0;
    } catch (Exception $e) {
      throw new Exception("Error al verificar nombre de usuario: " . $e->getMessage());
    }
  }

  // Verificar si el personal ya tiene usuario
  public static function verificarPersonalTieneUsuario($pdo, $id_personal, $id_usuario = null)
  {
    try {
      $sql = "SELECT COUNT(*) as count FROM usuarios WHERE fk_personal = ? AND estado = 'activo'";
      $params = [$id_personal];
      if ($id_usuario !== null) {
        $sql .= " AND id_usuario != ?";
        $params[] = $id_usuario;
      }
      $stmt = $pdo->prepare($sql);
      $stmt->execute($params);
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
      return $resultado['count'] > 0;
    } catch (Exception $e) {
      throw new Exception("Error al verificar si personal tiene usuario: " . $e->getMessage());
    }
  }

  // Contar cantidad de directores activos
  public static function contarDirectores($pdo)
  {
    try {
      $sql = "SELECT COUNT(*) as count 
                      FROM usuarios 
                      WHERE rol = 'Director' AND estado = 'activo'";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
      return $resultado['count'];
    } catch (Exception $e) {
      throw new Exception("Error al contar directores: " . $e->getMessage());
    }
  }

  // Consultar personal activo para select (que no tenga usuario, esté activo y sea de tipo Docente, Especialista o Administrativo)
  public static function consultarPersonalActivoParaSelect($pdo)
  {
    try {
      $sql = "SELECT 
                    p.id_personal,
                    per.primer_nombre, 
                    per.segundo_nombre, 
                    per.primer_apellido, 
                    per.segundo_apellido,
                    per.cedula,
                    car.nombre_cargo,
                    fp.nombre as funcion,
                    fp.tipo as tipo_funcion
                FROM personal p
                INNER JOIN personas per ON p.fk_persona = per.id_persona
                LEFT JOIN cargos car ON p.fk_cargo = car.id_cargo
                LEFT JOIN funcion_personal fp ON p.fk_funcion = fp.id_funcion_personal
                WHERE p.estado = 'activo'
                AND fp.tipo IN ('Docente', 'Especialista', 'Administrativo')
                AND p.id_personal NOT IN (
                    SELECT u.fk_personal 
                    FROM usuarios u 
                    WHERE u.estado = 'activo'
                )
                ORDER BY per.primer_nombre, per.primer_apellido";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar personal activo para select: " . $e->getMessage());
    }
  }

  // Verificar si el personal tiene una función permitida
  public static function verificarFuncionPermitida($pdo, $id_personal)
  {
    try {
      $sql = "SELECT COUNT(*) as count 
                FROM personal p
                INNER JOIN funcion_personal fp ON p.fk_funcion = fp.id_funcion_personal
                WHERE p.id_personal = ? 
                AND fp.tipo IN ('Docente', 'Especialista', 'Administrativo')";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id_personal]);
      $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
      return $resultado['count'] > 0;
    } catch (Exception $e) {
      throw new Exception("Error al verificar función permitida: " . $e->getMessage());
    }
  }

  // Consultar información completa del usuario para vista
  public static function consultarCompleto($pdo, $id)
  {
    try {
      // Consulta principal del usuario
      $sql = "SELECT 
                    u.*,
                    p.id_personal,
                    per.id_persona,
                    per.primer_nombre, 
                    per.segundo_nombre, 
                    per.primer_apellido, 
                    per.segundo_apellido,
                    per.fecha_nacimiento,
                    per.genero,
                    per.cedula,
                    per.nacionalidad,
                    per.direccion,
                    per.telefono_principal,
                    per.telefono_secundario,
                    per.email,
                    per.tipo_sangre,
                    car.nombre_cargo,
                    fp.nombre as funcion_personal,
                    fp.tipo as tipo_funcion,
                    p.fecha_contratacion,
                    p.nivel_academico,
                    p.horas_trabajo,
                    p.rif,
                    p.etnia_religion,
                    p.cantidad_hijas,
                    p.cantidad_hijos_varones
                FROM usuarios u
                INNER JOIN personal p ON u.fk_personal = p.id_personal
                INNER JOIN personas per ON p.fk_persona = per.id_persona
                LEFT JOIN cargos car ON p.fk_cargo = car.id_cargo
                LEFT JOIN funcion_personal fp ON p.fk_funcion = fp.id_funcion_personal
                WHERE u.id_usuario = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

      if (!$usuario) {
        return null;
      }

      // Consultar estudiantes representados si es representante
      $sqlEstudiantes = "SELECT 
                    est.id_estudiante,
                    est_per.primer_nombre,
                    est_per.segundo_nombre,
                    est_per.primer_apellido,
                    est_per.segundo_apellido,
                    est_per.cedula,
                    est.cedula_escolar,
                    gs.grado,
                    gs.seccion,
                    TIMESTAMPDIFF(YEAR, est_per.fecha_nacimiento, CURDATE()) as edad
                  FROM parentesco par
                  INNER JOIN representantes rep ON par.fk_representante = rep.id_representante
                  INNER JOIN estudiantes est ON par.fk_estudiante = est.id_estudiante
                  INNER JOIN personas est_per ON est.id_persona = est_per.id_persona
                  LEFT JOIN inscripciones ins ON est.id_estudiante = ins.fk_estudiante 
                    AND ins.estado_inscripcion = 'activo'
                  LEFT JOIN aula a ON ins.fk_aula = a.id_aula
                  LEFT JOIN grado_seccion gs ON a.fk_grado_seccion = gs.id_grado_seccion
                  WHERE rep.fk_persona = ?";
      $stmtEst = $pdo->prepare($sqlEstudiantes);
      $stmtEst->execute([$usuario['id_persona']]);
      $usuario['estudiantes_representados'] = $stmtEst->fetchAll(PDO::FETCH_ASSOC);

      $preguntasSeguridad = new PreguntasSeguridad();
      $usuario['preguntas_seguridad'] = $preguntasSeguridad->listarPorUsuario($pdo, (int) $usuario['id_usuario']);

      return $usuario;
    } catch (Exception $e) {
      throw new Exception("Error al consultar usuario completo: " . $e->getMessage());
    }
  }

  // Consultar cargos para select
  public static function consultarCargosParaSelect($pdo)
  {
    try {
      $sql = "SELECT id_cargo, nombre_cargo FROM cargos ORDER BY nombre_cargo";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar cargos para select: " . $e->getMessage());
    }
  }
}
