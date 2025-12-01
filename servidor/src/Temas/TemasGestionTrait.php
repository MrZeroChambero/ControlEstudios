<?php

namespace Micodigo\Temas;

use PDO;

trait TemasGestionTrait
{
  public function crear(PDO $conexion, array $datos): array
  {
    $datosDepurados = [
      'fk_contenido' => isset($datos['fk_contenido']) ? (int)$datos['fk_contenido'] : null,
      'nombre_tema' => $this->limpiarTexto($datos['nombre_tema'] ?? null),
      'estado' => 'activo',
    ];

    $errores = $this->validarDatos($conexion, $datosDepurados);
    if (!empty($errores)) {
      return ['errores' => $errores];
    }

    $sql = 'INSERT INTO temas (fk_contenido, nombre_tema, estado) VALUES (?, ?, ?)';
    $exito = $this->ejecutarAccion($conexion, $sql, [
      $datosDepurados['fk_contenido'],
      $datosDepurados['nombre_tema'],
      $datosDepurados['estado'],
    ]);

    if (!$exito) {
      return ['errores' => ['general' => ['No fue posible registrar el tema.']]];
    }

    $this->id_tema = (int)$conexion->lastInsertId();

    return ['datos' => $this->consultarPorId($conexion, $this->id_tema)];
  }

  public function actualizar(PDO $conexion, int $idTema, array $datos): array
  {
    if (!$this->existePorId($conexion, $idTema)) {
      return ['errores' => ['id_tema' => ['El tema solicitado no existe.']]];
    }

    $actual = $this->consultarPorId($conexion, $idTema);
    if ($actual === null) {
      return ['errores' => ['id_tema' => ['No fue posible recuperar el tema solicitado.']]];
    }

    $datosFusionados = [
      'fk_contenido' => array_key_exists('fk_contenido', $datos)
        ? (int)$datos['fk_contenido']
        : (int)$actual['fk_contenido'],
      'nombre_tema' => array_key_exists('nombre_tema', $datos)
        ? $this->limpiarTexto($datos['nombre_tema'])
        : $this->limpiarTexto($actual['nombre_tema']),
      'estado' => $actual['estado'],
    ];

    $errores = $this->validarDatos($conexion, $datosFusionados, $idTema);
    if (!empty($errores)) {
      return ['errores' => $errores];
    }

    $sql = 'UPDATE temas SET fk_contenido = ?, nombre_tema = ?, estado = ? WHERE id_tema = ?';
    $exito = $this->ejecutarAccion($conexion, $sql, [
      $datosFusionados['fk_contenido'],
      $datosFusionados['nombre_tema'],
      $datosFusionados['estado'],
      $idTema,
    ]);

    if (!$exito) {
      return ['errores' => ['general' => ['El tema no presentó cambios o no pudo actualizarse.']]];
    }

    return ['datos' => $this->consultarPorId($conexion, $idTema)];
  }

  public function eliminar(PDO $conexion, int $idTema): array
  {
    if (!$this->existePorId($conexion, $idTema)) {
      return ['errores' => ['id_tema' => ['El tema solicitado no existe.']]];
    }

    $sql = 'DELETE FROM temas WHERE id_tema = ?';
    $exito = $this->ejecutarAccion($conexion, $sql, [$idTema]);

    if (!$exito) {
      return ['errores' => ['general' => ['No fue posible eliminar el tema.']]];
    }

    return ['datos' => ['id_tema' => $idTema]];
  }

  public function cambiarEstado(PDO $conexion, int $idTema, ?string $estadoSolicitado = null): array
  {
    $tema = $this->consultarPorId($conexion, $idTema);
    if ($tema === null) {
      return ['errores' => ['id_tema' => ['El tema solicitado no existe.']]];
    }

    if (!$this->contenidoActivo($conexion, (int)$tema['fk_contenido'])) {
      return ['errores' => ['fk_contenido' => ['El contenido asociado debe estar activo para modificar el tema.']]];
    }

    $estadoActual = $tema['estado'];
    $nuevoEstado = $estadoSolicitado ?? ($estadoActual === 'activo' ? 'inactivo' : 'activo');

    if (!in_array($nuevoEstado, ['activo', 'inactivo'], true)) {
      return ['errores' => ['estado' => ['El estado recibido es inválido.']]];
    }

    if ($nuevoEstado === $estadoActual) {
      return ['datos' => $tema];
    }

    $sql = 'UPDATE temas SET estado = ? WHERE id_tema = ?';
    $exito = $this->ejecutarAccion($conexion, $sql, [$nuevoEstado, $idTema]);

    if (!$exito) {
      return ['errores' => ['general' => ['No fue posible actualizar el estado del tema.']]];
    }

    return ['datos' => $this->consultarPorId($conexion, $idTema)];
  }
}
