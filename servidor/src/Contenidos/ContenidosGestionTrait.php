<?php

namespace Micodigo\Contenidos;

use PDO;

trait ContenidosGestionTrait
{
  public function crear(PDO $conexion, array $datos): array
  {
    $datosDepurados = [
      'fk_componente' => isset($datos['fk_componente']) ? (int)$datos['fk_componente'] : null,
      'nombre_contenido' => $this->limpiarTexto($datos['nombre_contenido'] ?? null),
      'grado' => $this->normalizarGrado($datos['grado'] ?? null),
      'descripcion' => $this->limpiarTexto($datos['descripcion'] ?? null),
      'estado' => 'activo',
    ];

    $errores = $this->validarDatos($conexion, $datosDepurados);
    if (!empty($errores)) {
      return ['errores' => $errores];
    }

    $sql = 'INSERT INTO contenidos (fk_componente, nombre_contenido, grado, descripcion, estado)
                VALUES (?, ?, ?, ?, ?)';

    $exito = $this->ejecutarAccion($conexion, $sql, [
      $datosDepurados['fk_componente'],
      $datosDepurados['nombre_contenido'],
      $datosDepurados['grado'],
      $datosDepurados['descripcion'],
      $datosDepurados['estado'],
    ]);

    if (!$exito) {
      return ['errores' => ['general' => ['No fue posible registrar el contenido.']]];
    }

    $this->id_contenido = (int)$conexion->lastInsertId();

    return ['datos' => $this->consultarPorId($conexion, $this->id_contenido)];
  }

  public function actualizar(PDO $conexion, int $idContenido, array $datos): array
  {
    if (!$this->existePorId($conexion, $idContenido)) {
      return ['errores' => ['id_contenido' => ['El contenido solicitado no existe.']]];
    }

    $actual = $this->consultarPorId($conexion, $idContenido);
    if ($actual === null) {
      return ['errores' => ['id_contenido' => ['No fue posible recuperar el contenido solicitado.']]];
    }

    $datosFusionados = [
      'fk_componente' => array_key_exists('fk_componente', $datos)
        ? (int)$datos['fk_componente']
        : (int)$actual['fk_componente'],
      'nombre_contenido' => array_key_exists('nombre_contenido', $datos)
        ? $this->limpiarTexto($datos['nombre_contenido'])
        : $this->limpiarTexto($actual['nombre_contenido']),
      'grado' => array_key_exists('grado', $datos)
        ? $this->normalizarGrado($datos['grado'])
        : $this->normalizarGrado($actual['grado']),
      'descripcion' => array_key_exists('descripcion', $datos)
        ? $this->limpiarTexto($datos['descripcion'])
        : $this->limpiarTexto($actual['descripcion'] ?? null),
      'estado' => $actual['estado'],
    ];

    $errores = $this->validarDatos($conexion, $datosFusionados, $idContenido);
    if (!empty($errores)) {
      return ['errores' => $errores];
    }

    $sql = 'UPDATE contenidos
                SET fk_componente = ?, nombre_contenido = ?, grado = ?, descripcion = ?, estado = ?
                WHERE id_contenido = ?';

    $exito = $this->ejecutarAccion($conexion, $sql, [
      $datosFusionados['fk_componente'],
      $datosFusionados['nombre_contenido'],
      $datosFusionados['grado'],
      $datosFusionados['descripcion'],
      $datosFusionados['estado'],
      $idContenido,
    ]);

    if (!$exito) {
      return ['errores' => ['general' => ['El contenido no presentó cambios o no pudo actualizarse.']]];
    }

    return ['datos' => $this->consultarPorId($conexion, $idContenido)];
  }

  public function eliminar(PDO $conexion, int $idContenido): array
  {
    if (!$this->existePorId($conexion, $idContenido)) {
      return ['errores' => ['id_contenido' => ['El contenido solicitado no existe.']]];
    }

    $dependencias = $this->contarDependencias($conexion, $idContenido);
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

    $sql = 'DELETE FROM contenidos WHERE id_contenido = ?';
    $exito = $this->ejecutarAccion($conexion, $sql, [$idContenido]);

    if (!$exito) {
      return ['errores' => ['general' => ['No fue posible eliminar el contenido.']]];
    }

    return ['datos' => ['id_contenido' => $idContenido]];
  }

  public function cambiarEstado(PDO $conexion, int $idContenido, ?string $estadoSolicitado = null): array
  {
    $contenido = $this->consultarPorId($conexion, $idContenido);
    if ($contenido === null) {
      return ['errores' => ['id_contenido' => ['El contenido solicitado no existe.']]];
    }

    $estadoActual = $contenido['estado'];
    $nuevoEstado = $estadoSolicitado ?? ($estadoActual === 'activo' ? 'inactivo' : 'activo');

    if (!in_array($nuevoEstado, ['activo', 'inactivo'], true)) {
      return ['errores' => ['estado' => ['El estado recibido es inválido.']]];
    }

    if ($nuevoEstado === $estadoActual) {
      return ['datos' => $contenido];
    }

    $sql = 'UPDATE contenidos SET estado = ? WHERE id_contenido = ?';
    $exito = $this->ejecutarAccion($conexion, $sql, [$nuevoEstado, $idContenido]);

    if (!$exito) {
      return ['errores' => ['general' => ['No fue posible actualizar el estado del contenido.']]];
    }

    return ['datos' => $this->consultarPorId($conexion, $idContenido)];
  }
}
