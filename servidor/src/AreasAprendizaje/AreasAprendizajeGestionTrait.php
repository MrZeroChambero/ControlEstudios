<?php

namespace Micodigo\AreasAprendizaje;

use PDO;

trait AreasAprendizajeGestionTrait
{
  public function crear(PDO $conexion, array $datos): array
  {
    $datosDepurados = [
      'nombre_area' => $this->limpiarNombre($datos['nombre_area'] ?? null),
      'estado_area' => $datos['estado_area'] ?? 'activo'
    ];

    $errores = $this->validarDatos($conexion, $datosDepurados);
    if (!empty($errores)) {
      return ['errores' => $errores];
    }

    $sql = 'INSERT INTO areas_aprendizaje (nombre_area, estado_area) VALUES (?, ?)';
    $exito = $this->ejecutarAccion($conexion, $sql, [
      $datosDepurados['nombre_area'],
      $datosDepurados['estado_area']
    ]);

    if (!$exito) {
      return ['errores' => ['general' => ['No fue posible registrar el área de aprendizaje.']]];
    }

    $this->id_area_aprendizaje = (int)$conexion->lastInsertId();
    $this->nombre_area = $datosDepurados['nombre_area'];
    $this->estado_area = $datosDepurados['estado_area'];

    return ['datos' => $this->consultarPorId($conexion, $this->id_area_aprendizaje)];
  }

  public function actualizar(PDO $conexion, int $idArea, array $datos): array
  {
    if (!$this->existePorId($conexion, $idArea)) {
      return ['errores' => ['id_area_aprendizaje' => ['El área solicitada no existe.']]];
    }

    $areaActual = $this->consultarPorId($conexion, $idArea);
    if ($areaActual === null) {
      return ['errores' => ['id_area_aprendizaje' => ['No fue posible recuperar el área solicitada.']]];
    }

    $datosFusionados = [
      'nombre_area' => array_key_exists('nombre_area', $datos)
        ? $this->limpiarNombre($datos['nombre_area'])
        : $areaActual['nombre_area'],
      'estado_area' => array_key_exists('estado_area', $datos)
        ? $datos['estado_area']
        : $areaActual['estado_area']
    ];

    $errores = $this->validarDatos($conexion, $datosFusionados, $idArea);
    if (!empty($errores)) {
      return ['errores' => $errores];
    }

    $sql = 'UPDATE areas_aprendizaje SET nombre_area = ?, estado_area = ? WHERE id_area_aprendizaje = ?';
    $exito = $this->ejecutarAccion($conexion, $sql, [
      $datosFusionados['nombre_area'],
      $datosFusionados['estado_area'],
      $idArea
    ]);

    if (!$exito) {
      return ['errores' => ['general' => ['El área no presentó cambios o no pudo actualizarse.']]];
    }

    return ['datos' => $this->consultarPorId($conexion, $idArea)];
  }

  public function eliminar(PDO $conexion, int $idArea): array
  {
    if (!$this->existePorId($conexion, $idArea)) {
      return ['errores' => ['id_area_aprendizaje' => ['El área solicitada no existe.']]];
    }

    $totalComponentes = $this->contarComponentesAsociados($conexion, $idArea);
    if ($totalComponentes > 0) {
      return ['errores' => ['relaciones' => ['El área posee componentes asociados y no puede eliminarse.']]];
    }

    $sql = 'DELETE FROM areas_aprendizaje WHERE id_area_aprendizaje = ?';
    $exito = $this->ejecutarAccion($conexion, $sql, [$idArea]);

    if (!$exito) {
      return ['errores' => ['general' => ['No fue posible eliminar el área.']]];
    }

    return ['datos' => ['id_area_aprendizaje' => $idArea]];
  }

  public function cambiarEstado(PDO $conexion, int $idArea, ?string $estadoSolicitado = null): array
  {
    $area = $this->consultarPorId($conexion, $idArea);
    if ($area === null) {
      return ['errores' => ['id_area_aprendizaje' => ['El área solicitada no existe.']]];
    }

    $estadoActual = $area['estado_area'];
    $nuevoEstado = $estadoSolicitado ?? ($estadoActual === 'activo' ? 'inactivo' : 'activo');

    if (!in_array($nuevoEstado, ['activo', 'inactivo'], true)) {
      return ['errores' => ['estado_area' => ['El estado recibido es inválido.']]];
    }

    if ($nuevoEstado === $estadoActual) {
      return ['datos' => $area];
    }

    $sql = 'UPDATE areas_aprendizaje SET estado_area = ? WHERE id_area_aprendizaje = ?';
    $exito = $this->ejecutarAccion($conexion, $sql, [$nuevoEstado, $idArea]);

    if (!$exito) {
      return ['errores' => ['general' => ['No fue posible actualizar el estado del área.']]];
    }

    return ['datos' => $this->consultarPorId($conexion, $idArea)];
  }
}
