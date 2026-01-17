<?php

namespace Micodigo\Horarios;

use PDO;
use Valitron\Validator;
use function Micodigo\Horarios\Config\obtenerBloquePorCodigo;
use function Micodigo\Horarios\Config\esBloqueClase;
use const Micodigo\Horarios\Config\BLOQUES_DEPENDENCIAS;

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

    $this->codigo_bloque = null;

    if ($datos['hora_inicio'] === null || $datos['hora_fin'] === null) {
      $errores['horario'][] = 'Las horas de inicio y fin son obligatorias.';
    } else {
      if ($datos['hora_fin'] <= $datos['hora_inicio']) {
        $errores['horario'][] = 'La hora de finalización debe ser mayor a la hora de inicio.';
      }

      $codigoBloque = $this->obtenerCodigoBloqueDesdeHoras($datos['hora_inicio'], $datos['hora_fin']);
      if ($codigoBloque === null) {
        $errores['horario'][] = 'Selecciona un bloque válido del cronograma preconfigurado (03, 04, 05, 06, 08 o 09).';
      } else {
        $this->codigo_bloque = $codigoBloque;
        if (!esBloqueClase($codigoBloque)) {
          $errores['horario'][] = 'Solo se permiten bloques de tipo "clase" para registrar Componentes de Aprendizaje.';
        }
      }

      if (!$this->duracionBloqueValida($datos['hora_inicio'], $datos['hora_fin'])) {
        $errores['horario'][] = 'Respeta las duraciones oficiales (40-80 min) o la extensión autorizada del bloque 05.';
      }

      if (!$this->validarHorarioLaboral($datos['hora_inicio'], $datos['hora_fin'])) {
        $errores['horario'][] = 'El horario debe estar entre las 07:00 y las 12:00.';
      }
    }

    if ($datos['grupo'] === 'subgrupo' && empty($datos['estudiantes'])) {
      $errores['estudiantes'][] = 'Debe seleccionar al menos un estudiante para un subgrupo.';
    }

    if ($datos['grupo'] !== 'subgrupo' && !empty($datos['estudiantes'])) {
      $errores['grupo'][] = 'Para registrar subgrupos, el tipo de grupo debe ser "subgrupo".';
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

    $codigoBloque = $this->codigo_bloque ?? $this->obtenerCodigoBloqueDesdeHoras($datos['hora_inicio'], $datos['hora_fin']);
    $bloqueDuplicado = null;

    if ($codigoBloque !== null && $datos['fk_aula'] !== null && $datos['dia_semana'] !== null) {
      $bloqueDuplicado = $this->consultarBloquePorCodigo(
        $conexion,
        (int) $datos['fk_aula'],
        $datos['dia_semana'],
        $codigoBloque,
        $ignorarId
      );

      if ($bloqueDuplicado !== null) {
        $bloqueConfig = obtenerBloquePorCodigo($codigoBloque) ?? [];
        $etiqueta = sprintf(
          '%s (%s - %s)',
          $codigoBloque,
          $bloqueConfig['inicio'] ?? '—',
          $bloqueConfig['fin'] ?? '—'
        );
        $errores['horario'][] = sprintf('El bloque %s ya está asignado en este día. Selecciona otro bloque disponible.', $etiqueta);
      }
    }

    if ($bloqueDuplicado === null && $datos['fk_aula'] !== null && $datos['dia_semana'] !== null && $datos['hora_inicio'] !== null && $datos['hora_fin'] !== null) {
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

    if (
      $codigoBloque !== null &&
      $datos['fk_aula'] !== null &&
      $datos['dia_semana'] !== null &&
      $datos['fk_componente'] !== null
    ) {
      $erroresDependencias = $this->validarDependenciasBloque(
        $conexion,
        $codigoBloque,
        $datos,
        $ignorarId
      );

      if (!empty($erroresDependencias)) {
        $errores = array_merge_recursive($errores, $erroresDependencias);
      }
    }

    return $errores;
  }

  protected function validarDependenciasBloque(PDO $conexion, string $codigoBloque, array $datos, ?int $ignorarId): array
  {
    $errores = [];

    foreach (BLOQUES_DEPENDENCIAS as $principal => $extensiones) {
      $aulaId = (int) $datos['fk_aula'];
      $dia = $datos['dia_semana'];

      if ($codigoBloque === $principal) {
        foreach ($extensiones as $extension) {
          $relacionado = $this->consultarBloquePorCodigo($conexion, $aulaId, $dia, $extension, $ignorarId);
          if ($relacionado !== null && (int) $relacionado['fk_componente'] !== (int) $datos['fk_componente']) {
            $errores['fk_componente'][] = sprintf(
              'El bloque %s y su extensión %s deben compartir el mismo Componente de Aprendizaje.',
              $principal,
              $extension
            );
            break;
          }
        }
      } elseif (in_array($codigoBloque, (array) $extensiones, true)) {
        $principalRegistrado = $this->consultarBloquePorCodigo($conexion, $aulaId, $dia, $principal, $ignorarId);
        if ($principalRegistrado === null) {
          $errores['horario'][] = sprintf('Registra primero el bloque %s antes de su extensión %s.', $principal, $codigoBloque);
        } elseif ((int) $principalRegistrado['fk_componente'] !== (int) $datos['fk_componente']) {
          $errores['fk_componente'][] = sprintf(
            'El bloque %s debe utilizar el mismo Componente de Aprendizaje que el bloque %s.',
            $codigoBloque,
            $principal
          );
        }
      }
    }

    return $errores;
  }
}
