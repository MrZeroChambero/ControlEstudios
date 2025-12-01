<?php

namespace Micodigo\ComponentesAprendizaje;

use PDO;

trait ComponentesAprendizajeGestionTrait
{
  public function crear(PDO $conexion, array $datos): array
  {
    $datosDepurados = [
      'fk_area' => isset($datos['fk_area']) ? (int)$datos['fk_area'] : null,
      'nombre_componente' => $this->limpiarTexto($datos['nombre_componente'] ?? null),
      'especialista' => $this->limpiarTexto($datos['especialista'] ?? null),
      'evalua' => $datos['evalua'] ?? 'no',
      'estado_componente' => 'activo',
    ];

    $errores = $this->validarDatos($conexion, $datosDepurados);
    if (!empty($errores)) {
      return ['errores' => $errores];
    }

    $sql = 'INSERT INTO componentes_aprendizaje (fk_area, nombre_componente, especialista, evalua, estado_componente)
                VALUES (?, ?, ?, ?, ?)';

    $exito = $this->ejecutarAccion($conexion, $sql, [
      $datosDepurados['fk_area'],
      $datosDepurados['nombre_componente'],
      $datosDepurados['especialista'],
      $datosDepurados['evalua'],
      $datosDepurados['estado_componente'],
    ]);

    if (!$exito) {
      return ['errores' => ['general' => ['No fue posible registrar el componente de aprendizaje.']]];
    }

    $this->id_componente = (int)$conexion->lastInsertId();

    return ['datos' => $this->consultarPorId($conexion, $this->id_componente)];
  }

  public function actualizar(PDO $conexion, int $idComponente, array $datos): array
  {
    if (!$this->existePorId($conexion, $idComponente)) {
      return ['errores' => ['id_componente' => ['El componente solicitado no existe.']]];
    }

    $actual = $this->consultarPorId($conexion, $idComponente);
    if ($actual === null) {
      return ['errores' => ['id_componente' => ['No fue posible recuperar el componente solicitado.']]];
    }

    $datosFusionados = [
      'fk_area' => array_key_exists('fk_area', $datos) ? (int)$datos['fk_area'] : (int)$actual['fk_area'],
      'nombre_componente' => array_key_exists('nombre_componente', $datos)
        ? $this->limpiarTexto($datos['nombre_componente'])
        : $this->limpiarTexto($actual['nombre_componente']),
      'especialista' => array_key_exists('especialista', $datos)
        ? $this->limpiarTexto($datos['especialista'])
        : $this->limpiarTexto($actual['especialista']),
      'evalua' => array_key_exists('evalua', $datos) ? $datos['evalua'] : $actual['evalua'],
      'estado_componente' => $actual['estado_componente'],
    ];

    $errores = $this->validarDatos($conexion, $datosFusionados, $idComponente);
    if (!empty($errores)) {
      return ['errores' => $errores];
    }

    $sql = 'UPDATE componentes_aprendizaje
                SET fk_area = ?, nombre_componente = ?, especialista = ?, evalua = ?, estado_componente = ?
                WHERE id_componente = ?';

    $exito = $this->ejecutarAccion($conexion, $sql, [
      $datosFusionados['fk_area'],
      $datosFusionados['nombre_componente'],
      $datosFusionados['especialista'],
      $datosFusionados['evalua'],
      $datosFusionados['estado_componente'],
      $idComponente,
    ]);

    if (!$exito) {
      return ['errores' => ['general' => ['El componente no presentó cambios o no pudo actualizarse.']]];
    }

    return ['datos' => $this->consultarPorId($conexion, $idComponente)];
  }

  public function eliminar(PDO $conexion, int $idComponente): array
  {
    if (!$this->existePorId($conexion, $idComponente)) {
      return ['errores' => ['id_componente' => ['El componente solicitado no existe.']]];
    }

    $dependencias = $this->contarDependencias($conexion, $idComponente);
    if (!empty($dependencias)) {
      $errores = [];
      foreach ($dependencias as $dependencia) {
        $errores[] = sprintf(
          'Existen %d registro(s) asociado(s) en la tabla %s.',
          $dependencia['cantidad'],
          $dependencia['tabla']
        );
      }

      return ['errores' => ['relaciones' => $errores]];
    }

    $sql = 'DELETE FROM componentes_aprendizaje WHERE id_componente = ?';
    $exito = $this->ejecutarAccion($conexion, $sql, [$idComponente]);

    if (!$exito) {
      return ['errores' => ['general' => ['No fue posible eliminar el componente.']]];
    }

    return ['datos' => ['id_componente' => $idComponente]];
  }

  public function cambiarEstado(PDO $conexion, int $idComponente, ?string $estadoSolicitado = null): array
  {
    $componente = $this->consultarPorId($conexion, $idComponente);
    if ($componente === null) {
      return ['errores' => ['id_componente' => ['El componente solicitado no existe.']]];
    }

    $estadoActual = $componente['estado_componente'];
    $nuevoEstado = $estadoSolicitado ?? ($estadoActual === 'activo' ? 'inactivo' : 'activo');

    if (!in_array($nuevoEstado, ['activo', 'inactivo'], true)) {
      return ['errores' => ['estado_componente' => ['El estado recibido es inválido.']]];
    }

    if ($nuevoEstado === $estadoActual) {
      return ['datos' => $componente];
    }

    $sql = 'UPDATE componentes_aprendizaje SET estado_componente = ? WHERE id_componente = ?';
    $exito = $this->ejecutarAccion($conexion, $sql, [$nuevoEstado, $idComponente]);

    if (!$exito) {
      return ['errores' => ['general' => ['No fue posible actualizar el estado del componente.']]];
    }

    return ['datos' => $this->consultarPorId($conexion, $idComponente)];
  }
}
