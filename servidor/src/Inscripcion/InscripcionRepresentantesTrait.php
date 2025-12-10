<?php

namespace Micodigo\Inscripcion;

use PDO;

trait InscripcionRepresentantesTrait
{
  use InscripcionFormatoNombreTrait;

  private function obtenerRepresentantesAsociados(PDO $conexion, int $estudianteId): array
  {
    $sql = 'SELECT par.id_parentesco,
                   par.tipo_parentesco,
                   rep.id_representante,
                   rep.profesion,
                   rep.lugar_trabajo,
                   p.primer_nombre,
                   p.segundo_nombre,
                   p.primer_apellido,
                   p.segundo_apellido,
                   p.cedula
            FROM parentesco par
            INNER JOIN representantes rep ON rep.id_representante = par.fk_representante
            INNER JOIN personas p ON p.id_persona = rep.fk_persona
            WHERE par.fk_estudiante = ?
              AND p.estado = "activo"
            ORDER BY par.tipo_parentesco, p.primer_nombre, p.primer_apellido';

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$estudianteId]);

    $lista = [];
    while ($fila = $sentencia->fetch(PDO::FETCH_ASSOC)) {
      $lista[] = [
        'id_representante' => (int) $fila['id_representante'],
        'tipo_parentesco' => $fila['tipo_parentesco'],
        'nombre_completo' => $this->construirNombreCompleto($fila),
        'cedula' => $fila['cedula'],
        'profesion' => $fila['profesion'],
        'lugar_trabajo' => $fila['lugar_trabajo'],
      ];
    }

    return $lista;
  }

  private function validarRepresentanteSeleccion(PDO $conexion, int $estudianteId, int $representanteId): array
  {
    $sql = 'SELECT par.tipo_parentesco,
                   rep.id_representante,
                   p.primer_nombre,
                   p.segundo_nombre,
                   p.primer_apellido,
                   p.segundo_apellido,
                   p.cedula
            FROM parentesco par
            INNER JOIN representantes rep ON rep.id_representante = par.fk_representante
            INNER JOIN personas p ON p.id_persona = rep.fk_persona
            WHERE par.fk_estudiante = ?
              AND rep.id_representante = ?
              AND p.estado = "activo"
            LIMIT 1';

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$estudianteId, $representanteId]);
    $fila = $sentencia->fetch(PDO::FETCH_ASSOC);

    if (!$fila) {
      return [
        'valido' => false,
        'errores' => ['representante' => ['El representante seleccionado no posee un parentesco registrado con el estudiante.']],
      ];
    }

    return [
      'valido' => true,
      'representante' => [
        'id' => (int) $representanteId,
        'tipo_parentesco' => $fila['tipo_parentesco'],
        'nombre_completo' => $this->construirNombreCompleto($fila),
        'cedula' => $fila['cedula'],
      ],
    ];
  }
}
