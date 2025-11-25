<?php

namespace Micodigo\Representate;

use Exception;
use PDO;

trait ConsultasRepresentante
{
  public static function consultarTodos($pdo)
  {
    try {
      $sql = "SELECT rep.*, p.estado, p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido, p.cedula, p.fecha_nacimiento,
               TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad
              FROM representantes rep
              INNER JOIN personas p ON rep.fk_persona = p.id_persona
              ORDER BY p.primer_nombre, p.primer_apellido";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar representantes: " . $e->getMessage());
    }
  }

  public static function consultarPersonasParaRepresentante($pdo)
  {
    try {
      $sql = "SELECT 
    p.*, 
    TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad,
    CASE 
        WHEN r.id_representante IS NOT NULL THEN 'Sí'
        ELSE 'No'
    END AS tiene_representante,
    r.id_representante,
    rep.oficio,
    rep.nivel_educativo,
    rep.profesion,
    rep.lugar_trabajo
FROM personas p
LEFT JOIN estudiantes e ON p.id_persona = e.id_persona
LEFT JOIN parentesco par ON e.id_estudiante = par.fk_estudiante
LEFT JOIN representantes r ON par.fk_representante = r.id_representante
LEFT JOIN representantes rep ON r.id_representante = rep.id_representante
WHERE TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) >= 16
  AND p.tipo_persona != 'representante'  -- Excluye representantes
  AND (p.tipo_persona != 'personal'      -- Incluye todos los no-personal
       OR (p.tipo_persona = 'personal'   -- O si es personal...
           AND NOT EXISTS (               -- ...verifica que NO tenga representante
               SELECT 1 
               FROM representantes rep_check 
               WHERE rep_check.fk_persona = p.id_persona
           )
       )
  )
ORDER BY p.primer_nombre, p.primer_apellido";
      $stmt = $pdo->prepare($sql);
      $stmt->execute();
      return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al consultar personas candidatas a representante: " . $e->getMessage());
    }
  }

  public static function obtenerRepresentantePorId($pdo, $id_representante)
  {
    try {
      $sql = "SELECT rep.*, p.*,
                       TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad
              FROM representantes rep
              INNER JOIN personas p ON rep.fk_persona = p.id_persona
              WHERE rep.id_representante = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id_representante]);
      return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
      throw new Exception("Error al obtener representante completo: " . $e->getMessage());
    }
  }
}
