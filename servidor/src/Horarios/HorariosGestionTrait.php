<?php

namespace Micodigo\Horarios;

use PDO;
use Exception;

trait HorariosGestionTrait
{
  public function listar(PDO $conexion, array $criterios = []): array
  {
    return ['datos' => $this->consultarHorarios($conexion, $criterios)];
  }

  public function obtenerCatalogos(PDO $conexion, array $opciones = []): array
  {
    $anioId = isset($opciones['fk_anio_escolar']) ? (int) $opciones['fk_anio_escolar'] : null;
    $aulaId = isset($opciones['fk_aula']) ? (int) $opciones['fk_aula'] : null;

    $catalogos = [
      'aulas' => $this->consultarCatalogoAulas($conexion, $anioId),
      'momentos' => $this->consultarCatalogoMomentos($conexion, $anioId),
    ];

    if ($aulaId !== null && $aulaId > 0) {
      $catalogos['componentes'] = $this->consultarCatalogoComponentes($conexion, $aulaId);
      $catalogos['personal'] = $this->consultarCatalogoPersonal($conexion, $aulaId);
      $catalogos['estudiantes'] = $this->consultarCatalogoEstudiantes($conexion, $aulaId);
    }

    return ['datos' => $catalogos];
  }

  public function crear(PDO $conexion, array $datos, array $contexto = []): array
  {
    $modelo = new self($datos);
    $errores = $modelo->validarHorario($conexion, $contexto, null);
    if (!empty($errores)) {
      return ['errores' => $errores];
    }

    try {
      $conexion->beginTransaction();

      $sql = 'INSERT INTO horarios (fk_aula, fk_momento, fk_componente, fk_personal, grupo, dia_semana, hora_inicio, hora_fin)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

      $params = [
        $modelo->fk_aula,
        $modelo->fk_momento,
        $modelo->fk_componente,
        $modelo->fk_personal,
        $modelo->grupo,
        $modelo->dia_semana,
        $modelo->hora_inicio,
        $modelo->hora_fin,
      ];

      $this->ejecutarAccion($conexion, $sql, $params);
      $modelo->id_horario = (int) $conexion->lastInsertId();

      if ($modelo->grupo === 'subgrupo') {
        $this->sincronizarSubgrupoInterno($conexion, $modelo->id_horario, $modelo->estudiantes);
      }

      $conexion->commit();
    } catch (Exception $excepcion) {
      if ($conexion->inTransaction()) {
        $conexion->rollBack();
      }
      return ['errores' => ['general' => [$excepcion->getMessage()]]];
    }

    $registro = $modelo->consultarHorarioPorId($conexion, $modelo->id_horario);
    return ['datos' => $registro];
  }

  public function actualizar(PDO $conexion, int $idHorario, array $datos, array $contexto = []): array
  {
    $actual = $this->consultarHorarioPorId($conexion, $idHorario);
    if ($actual === null) {
      return ['errores' => ['id_horario' => ['El horario solicitado no existe.']]];
    }

    $estudiantesActuales = array_map(function (array $item): int {
      return (int) ($item['id_estudiante'] ?? 0);
    }, $actual['estudiantes'] ?? []);

    $datosFusionados = [
      'id_horario' => $idHorario,
      'fk_aula' => array_key_exists('fk_aula', $datos) ? $datos['fk_aula'] : $actual['fk_aula'],
      'fk_momento' => array_key_exists('fk_momento', $datos) ? $datos['fk_momento'] : $actual['fk_momento'],
      'fk_componente' => array_key_exists('fk_componente', $datos) ? $datos['fk_componente'] : $actual['fk_componente'],
      'fk_personal' => array_key_exists('fk_personal', $datos) ? $datos['fk_personal'] : $actual['fk_personal'],
      'grupo' => array_key_exists('grupo', $datos) ? $datos['grupo'] : $actual['grupo'],
      'dia_semana' => array_key_exists('dia_semana', $datos) ? $datos['dia_semana'] : $actual['dia_semana'],
      'hora_inicio' => array_key_exists('hora_inicio', $datos) ? $datos['hora_inicio'] : $actual['hora_inicio'],
      'hora_fin' => array_key_exists('hora_fin', $datos) ? $datos['hora_fin'] : $actual['hora_fin'],
      'estudiantes' => array_key_exists('estudiantes', $datos) ? $datos['estudiantes'] : $estudiantesActuales,
    ];

    $modelo = new self($datosFusionados);
    $errores = $modelo->validarHorario($conexion, $contexto, $idHorario);
    if (!empty($errores)) {
      return ['errores' => $errores];
    }

    try {
      $conexion->beginTransaction();

      $sql = 'UPDATE horarios
              SET fk_aula = ?,
                  fk_momento = ?,
                  fk_componente = ?,
                  fk_personal = ?,
                  grupo = ?,
                  dia_semana = ?,
                  hora_inicio = ?,
                  hora_fin = ?
              WHERE id_horario = ?';

      $params = [
        $modelo->fk_aula,
        $modelo->fk_momento,
        $modelo->fk_componente,
        $modelo->fk_personal,
        $modelo->grupo,
        $modelo->dia_semana,
        $modelo->hora_inicio,
        $modelo->hora_fin,
        $idHorario,
      ];

      $this->ejecutarAccion($conexion, $sql, $params);

      if ($modelo->grupo === 'subgrupo') {
        $this->sincronizarSubgrupoInterno($conexion, $idHorario, $modelo->estudiantes);
      } else {
        $sentencia = $conexion->prepare('DELETE FROM grupos_estudiantiles WHERE fk_horario = ?');
        $sentencia->execute([$idHorario]);
      }

      $conexion->commit();
    } catch (Exception $excepcion) {
      if ($conexion->inTransaction()) {
        $conexion->rollBack();
      }
      return ['errores' => ['general' => [$excepcion->getMessage()]]];
    }

    $registro = $modelo->consultarHorarioPorId($conexion, $idHorario);
    return ['datos' => $registro];
  }

  public function eliminar(PDO $conexion, int $idHorario): array
  {
    $existe = $this->consultarHorarioPorId($conexion, $idHorario);
    if ($existe === null) {
      return ['errores' => ['id_horario' => ['El horario solicitado no existe.']]];
    }

    try {
      $conexion->beginTransaction();

      $sentencia = $conexion->prepare('DELETE FROM grupos_estudiantiles WHERE fk_horario = ?');
      $sentencia->execute([$idHorario]);

      $sentencia = $conexion->prepare('DELETE FROM horarios WHERE id_horario = ?');
      $sentencia->execute([$idHorario]);

      $conexion->commit();
    } catch (Exception $excepcion) {
      if ($conexion->inTransaction()) {
        $conexion->rollBack();
      }
      return ['errores' => ['general' => [$excepcion->getMessage()]]];
    }

    return ['datos' => ['id_horario' => $idHorario]];
  }

  public function sincronizarSubgrupo(PDO $conexion, int $idHorario, array $estudiantes, array $contexto = []): array
  {
    $horario = $this->consultarHorarioPorId($conexion, $idHorario);
    if ($horario === null) {
      return ['errores' => ['id_horario' => ['El horario solicitado no existe.']]];
    }

    $datos = [
      'id_horario' => $idHorario,
      'fk_aula' => $horario['fk_aula'],
      'fk_momento' => $horario['fk_momento'],
      'fk_componente' => $horario['fk_componente'],
      'fk_personal' => $horario['fk_personal'],
      'grupo' => $horario['grupo'],
      'dia_semana' => $horario['dia_semana'],
      'hora_inicio' => $horario['hora_inicio'],
      'hora_fin' => $horario['hora_fin'],
      'estudiantes' => $estudiantes,
    ];

    $modelo = new self($datos);
    $errores = $modelo->validarHorario($conexion, $contexto, $idHorario);
    if (!empty($errores)) {
      return ['errores' => $errores];
    }

    try {
      $this->sincronizarSubgrupoInterno($conexion, $idHorario, $modelo->estudiantes);
    } catch (Exception $excepcion) {
      return ['errores' => ['general' => [$excepcion->getMessage()]]];
    }

    return ['datos' => $modelo->consultarHorarioPorId($conexion, $idHorario)];
  }

  protected function sincronizarSubgrupoInterno(PDO $conexion, int $idHorario, array $estudiantes): void
  {
    $sentenciaEliminar = $conexion->prepare('DELETE FROM grupos_estudiantiles WHERE fk_horario = ?');
    $sentenciaEliminar->execute([$idHorario]);

    if (empty($estudiantes)) {
      return;
    }

    $sentenciaInsertar = $conexion->prepare('INSERT INTO grupos_estudiantiles (fk_horario, fk_estudiante) VALUES (?, ?)');
    foreach ($estudiantes as $idEstudiante) {
      $sentenciaInsertar->execute([$idHorario, (int) $idEstudiante]);
    }
  }

  protected function consultarCatalogoAulas(PDO $conexion, ?int $anioId): array
  {
    $parametros = [];
    $filtro = '';

    if ($anioId !== null && $anioId > 0) {
      $filtro = 'WHERE a.fk_anio_escolar = ?';
      $parametros[] = $anioId;
    }

    $sql = 'SELECT a.id_aula,
                   a.fk_anio_escolar,
                   a.fk_grado_seccion,
                   gs.grado,
                   gs.seccion
            FROM aula a
            LEFT JOIN grado_seccion gs ON gs.id_grado_seccion = a.fk_grado_seccion
            ' . $filtro . '
            ORDER BY a.fk_anio_escolar DESC, gs.grado ASC, gs.seccion ASC';

    $registros = $this->ejecutarConsulta($conexion, $sql, $parametros);

    return array_map(function (array $fila) {
      return [
        'id' => (int) $fila['id_aula'],
        'anio_escolar' => (int) $fila['fk_anio_escolar'],
        'grado' => $fila['grado'],
        'seccion' => $fila['seccion'],
        'descripcion' => sprintf('Grado %s - Sección %s', $fila['grado'], $fila['seccion']),
      ];
    }, $registros);
  }

  protected function consultarCatalogoMomentos(PDO $conexion, ?int $anioId): array
  {
    $parametros = [];
    $filtro = '';

    if ($anioId !== null && $anioId > 0) {
      $filtro = 'WHERE m.fk_anio_escolar = ?';
      $parametros[] = $anioId;
    }

    $sql = 'SELECT m.id_momento,
                   m.fk_anio_escolar,
                   m.nombre_momento,
                   m.estado_momento,
                   m.fecha_inicio,
                   m.fecha_fin
            FROM momentos m
            ' . $filtro . '
            ORDER BY m.fk_anio_escolar DESC, CAST(m.nombre_momento AS UNSIGNED), m.fecha_inicio';

    $registros = $this->ejecutarConsulta($conexion, $sql, $parametros);

    return array_map(function (array $fila) {
      return [
        'id' => (int) $fila['id_momento'],
        'anio_escolar' => (int) $fila['fk_anio_escolar'],
        'codigo' => $fila['nombre_momento'],
        'estado' => $fila['estado_momento'],
        'fecha_inicio' => $fila['fecha_inicio'],
        'fecha_fin' => $fila['fecha_fin'],
      ];
    }, $registros);
  }

  protected function consultarCatalogoComponentes(PDO $conexion, int $aulaId): array
  {
    $sql = 'SELECT DISTINCT i.fk_componente,
                            comp.nombre_componente,
                            comp.especialista
            FROM imparte i
            INNER JOIN componentes_aprendizaje comp ON comp.id_componente = i.fk_componente
            WHERE i.fk_aula = ?
            ORDER BY comp.nombre_componente';

    $registros = $this->ejecutarConsulta($conexion, $sql, [$aulaId]);

    return array_map(function (array $fila) {
      return [
        'id' => (int) $fila['fk_componente'],
        'nombre' => $fila['nombre_componente'],
        'especialista' => $fila['especialista'],
      ];
    }, $registros);
  }

  protected function consultarCatalogoPersonal(PDO $conexion, int $aulaId): array
  {
    $sql = 'SELECT DISTINCT i.fk_personal,
                            per.estado,
                            fun.tipo,
                            fun.nombre AS funcion,
                            personas.primer_nombre,
                            personas.segundo_nombre,
                            personas.primer_apellido,
                            personas.segundo_apellido
            FROM imparte i
            INNER JOIN personal per ON per.id_personal = i.fk_personal
            INNER JOIN funcion_personal fun ON fun.id_funcion_personal = per.fk_funcion
            INNER JOIN personas ON personas.id_persona = per.fk_persona
            WHERE i.fk_aula = ?
            ORDER BY personas.primer_apellido, personas.primer_nombre';

    $registros = $this->ejecutarConsulta($conexion, $sql, [$aulaId]);

    return array_map(function (array $fila) {
      return [
        'id' => (int) $fila['fk_personal'],
        'nombre' => trim($fila['primer_nombre'] . ' ' . ($fila['segundo_nombre'] ?? '') . ' ' . $fila['primer_apellido'] . ' ' . ($fila['segundo_apellido'] ?? '')),
        'tipo' => $fila['tipo'],
        'funcion' => $fila['funcion'],
      ];
    }, $registros);
  }

  protected function consultarCatalogoEstudiantes(PDO $conexion, int $aulaId): array
  {
    $sql = 'SELECT ins.fk_estudiante,
                   p.primer_nombre,
                   p.segundo_nombre,
                   p.primer_apellido,
                   p.segundo_apellido,
                   e.cedula_escolar
            FROM inscripciones ins
            INNER JOIN estudiantes e ON e.id_estudiante = ins.fk_estudiante
            INNER JOIN personas p ON p.id_persona = e.id_persona
            WHERE ins.fk_aula = ?
              AND ins.estado_inscripcion = "activo"
            ORDER BY p.primer_apellido, p.primer_nombre';

    $registros = $this->ejecutarConsulta($conexion, $sql, [$aulaId]);

    return array_map(function (array $fila) {
      return [
        'id' => (int) $fila['fk_estudiante'],
        'nombre' => trim($fila['primer_nombre'] . ' ' . ($fila['segundo_nombre'] ?? '') . ' ' . $fila['primer_apellido'] . ' ' . ($fila['segundo_apellido'] ?? '')),
        'cedula_escolar' => $fila['cedula_escolar'],
      ];
    }, $registros);
  }
}
