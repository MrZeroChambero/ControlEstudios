<?php

namespace Micodigo\Horarios;

use PDO;
use Valitron\Validator;

trait HorariosValidacionesTrait
{
  protected function validarHorario(PDO $conexion, array $contexto = [], ?int $ignorarId = null): array
  {
    $datos = $this->obtenerDatosHorario();
    $errores = $this->validarDatosBasicos($datos);

    if (!empty($errores)) {
      return $errores;
    }

    $negocio = $this->validarReglasNegocio($conexion, $datos, $contexto, $ignorarId);
    if (!empty($negocio)) {
      $errores = array_merge_recursive($errores, $negocio);
    }

    return $errores;
  }

  protected function validarDatosBasicos(array $datos): array
  {
    $validator = new Validator($datos, [], 'es');

    $validator->rule('required', ['fk_aula', 'fk_momento', 'fk_componente', 'fk_personal', 'grupo', 'dia_semana', 'hora_inicio', 'hora_fin']);
    $validator->rule('integer', ['fk_aula', 'fk_momento', 'fk_componente', 'fk_personal']);
    $validator->rule('in', 'grupo', self::GRUPOS_VALIDOS);
    $validator->rule('in', 'dia_semana', self::DIAS_VALIDOS);

    if (!$validator->validate()) {
      $erroresValidador = $validator->errors();

      if (!empty($erroresValidador['dia_semana'])) {
        $erroresValidador['dia_semana'] = ['Seleccione un día hábil (lunes a viernes).'];
      }

      return $erroresValidador;
    }

    $errores = [];

    if ($datos['hora_inicio'] === null || $datos['hora_fin'] === null) {
      $errores['horario'][] = 'Las horas de inicio y fin son obligatorias.';
    } else {
      if ($datos['hora_fin'] <= $datos['hora_inicio']) {
        $errores['horario'][] = 'La hora de finalización debe ser mayor a la hora de inicio.';
      }

      if (!$this->duracionBloqueValida($datos['hora_inicio'], $datos['hora_fin'])) {
        $errores['horario'][] = 'La duración del bloque debe estar entre 40 y 80 minutos.';
      }

      if (!$this->validarHorarioLaboral($datos['hora_inicio'], $datos['hora_fin'])) {
        $errores['horario'][] = 'El horario debe estar entre las 07:00 y las 12:00.';
      }
    }

    if ($datos['grupo'] === 'subgrupo' && empty($datos['estudiantes'])) {
      $errores['estudiantes'][] = 'Debe seleccionar al menos un estudiante para un subgrupo.';
    }

    return $errores;
  }

  protected function validarReglasNegocio(PDO $conexion, array $datos, array $contexto, ?int $ignorarId): array
  {
    $errores = [];

    $aula = null;
    if ($datos['fk_aula'] !== null) {
      $aula = $this->consultarAulaActiva($conexion, (int) $datos['fk_aula']);
      if ($aula === null) {
        $errores['fk_aula'][] = 'El aula seleccionada no existe o no está activa.';
      }
    }

    $momento = null;
    if ($datos['fk_momento'] !== null) {
      $momento = $this->consultarMomentoActivo($conexion, (int) $datos['fk_momento']);
      if ($momento === null) {
        $errores['fk_momento'][] = 'El momento seleccionado no existe o no está activo.';
      }
    }

    if ($aula !== null && $momento !== null && (int) $aula['fk_anio_escolar'] !== (int) $momento['fk_anio_escolar']) {
      $errores['fk_momento'][] = 'El momento no pertenece al mismo año escolar del aula.';
    }

    $asignacion = null;
    if ($datos['fk_aula'] !== null && $datos['fk_personal'] !== null && $datos['fk_momento'] !== null && $datos['fk_componente'] !== null) {
      $asignacion = $this->consultarAsignacionDocente(
        $conexion,
        (int) $datos['fk_aula'],
        (int) $datos['fk_momento'],
        (int) $datos['fk_componente'],
        (int) $datos['fk_personal']
      );

      if ($asignacion === null) {
        $errores['fk_personal'][] = 'El personal seleccionado no tiene asignada esta combinación de aula, momento y componente.';
      } else {
        $this->establecerTipoDocente($asignacion['tipo_docente'] ?? null);
      }
    }

    $rol = strtolower($contexto['rol'] ?? '');
    if ($datos['grupo'] === 'completo' && $rol !== 'director') {
      $errores['grupo'][] = 'Solo un usuario director puede crear o modificar horarios grupales.';
    }

    if ($datos['grupo'] === 'subgrupo' && $aula !== null) {
      $faltantes = $this->validarEstudiantesEnAula($conexion, (int) $datos['fk_aula'], $datos['estudiantes']);
      if (!empty($faltantes)) {
        $errores['estudiantes'][] = 'Hay estudiantes que no pertenecen al aula seleccionada: ' . implode(', ', $faltantes) . '.';
      }
    }

    if ($asignacion !== null) {
      $tipoDocente = strtolower($asignacion['tipo_docente'] ?? '');

      if ($tipoDocente === 'especialista' && $datos['grupo'] === 'subgrupo') {
        if ($this->existeHorarioEspecialistaGrupo(
          $conexion,
          (int) $datos['fk_aula'],
          (int) $datos['fk_componente'],
          $datos['dia_semana'],
          $ignorarId
        )) {
          $errores['grupo'][] = 'Este componente de especialista ya está configurado para trabajarse en grupo.';
        }
      }

      if ($tipoDocente === 'especialista' && $datos['grupo'] === 'completo') {
        if ($this->existeHorarioEspecialistaSubgrupo(
          $conexion,
          (int) $datos['fk_aula'],
          (int) $datos['fk_componente'],
          $ignorarId
        )) {
          $errores['grupo'][] = 'El componente está configurado en subgrupos y no puede volverse grupal.';
        }
      }
    }

    if ($datos['fk_aula'] !== null && $datos['dia_semana'] !== null && $datos['hora_inicio'] !== null && $datos['hora_fin'] !== null) {
      if ($this->existeConflictoAula(
        $conexion,
        (int) $datos['fk_aula'],
        $datos['dia_semana'],
        (float) $datos['hora_inicio'],
        (float) $datos['hora_fin'],
        $ignorarId
      )) {
        $errores['horario'][] = 'Ya existe un horario registrado para el aula en el día y rango indicado.';
      }
    }

    if ($datos['fk_personal'] !== null && $datos['dia_semana'] !== null && $datos['hora_inicio'] !== null && $datos['hora_fin'] !== null) {
      if ($this->existeConflictoPersonal(
        $conexion,
        (int) $datos['fk_personal'],
        $datos['dia_semana'],
        (float) $datos['hora_inicio'],
        (float) $datos['hora_fin'],
        $ignorarId
      )) {
        $errores['fk_personal'][] = 'El personal seleccionado ya tiene un horario que se solapa con el indicado.';
      }
    }

    if ($datos['grupo'] === 'subgrupo' && !empty($datos['estudiantes']) && $datos['dia_semana'] !== null && $datos['hora_inicio'] !== null && $datos['hora_fin'] !== null) {
      $conflictos = $this->buscarConflictosEstudiantes(
        $conexion,
        $datos['estudiantes'],
        $datos['dia_semana'],
        (float) $datos['hora_inicio'],
        (float) $datos['hora_fin'],
        $ignorarId
      );

      if (!empty($conflictos)) {
        $errores['estudiantes'][] = 'Los estudiantes ya tienen actividades en el mismo rango horario: ' . implode(', ', $conflictos) . '.';
      }
    }

    return $errores;
  }
}
