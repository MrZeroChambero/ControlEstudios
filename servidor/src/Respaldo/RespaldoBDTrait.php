<?php

namespace Micodigo\Respaldo;

use Exception;
use PDO;

trait RespaldoBDTrait
{
  protected function obtenerRegistrosBD(): array
  {
    $sql = 'SELECT r.id_respaldos, r.direccion, r.fecha, r.fk_usuario, u.nombre_usuario
            FROM respaldos r
            LEFT JOIN usuarios u ON u.id_usuario = r.fk_usuario
            ORDER BY r.fecha DESC, r.id_respaldos DESC';

    $stmt = $this->pdo->query($sql);
    if ($stmt === false) {
      throw new Exception('No se pudo consultar la tabla de respaldos.');
    }

    return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
  }

  protected function obtenerRegistroPorDireccion(string $direccion): ?array
  {
    $sql = 'SELECT r.id_respaldos, r.direccion, r.fecha, r.fk_usuario, u.nombre_usuario
            FROM respaldos r
            LEFT JOIN usuarios u ON u.id_usuario = r.fk_usuario
            WHERE r.direccion = ?
            LIMIT 1';

    $stmt = $this->pdo->prepare($sql);
    if ($stmt === false || !$stmt->execute([$direccion])) {
      throw new Exception('No se pudo consultar el respaldo especificado.');
    }

    $registro = $stmt->fetch(PDO::FETCH_ASSOC);
    return $registro ?: null;
  }

  protected function registrarRespaldoBD(string $nombre, int $usuarioId, int $timestamp): array
  {
    $fechaLocal = $this->formatearFechaParaBD($timestamp);

    $existente = $this->obtenerRegistroPorDireccion($nombre);

    if ($existente) {
      $sql = 'UPDATE respaldos SET fecha = ?, fk_usuario = ? WHERE id_respaldos = ?';
      $stmt = $this->pdo->prepare($sql);
      if ($stmt === false || !$stmt->execute([$fechaLocal, $usuarioId, $existente['id_respaldos']])) {
        throw new Exception('No se pudo actualizar el registro de respaldo existente.');
      }
      return $this->obtenerRegistroPorDireccion($nombre) ?? $existente;
    }

    $sqlInsert = 'INSERT INTO respaldos (direccion, fecha, fk_usuario) VALUES (?, ?, ?)';
    $stmtInsert = $this->pdo->prepare($sqlInsert);
    if ($stmtInsert === false || !$stmtInsert->execute([$nombre, $fechaLocal, $usuarioId])) {
      throw new Exception('No se pudo registrar la información del respaldo en la base de datos.');
    }

    return $this->obtenerRegistroPorDireccion($nombre) ?? [
      'direccion' => $nombre,
      'fecha' => $fechaLocal,
      'fk_usuario' => $usuarioId,
      'nombre_usuario' => null,
    ];
  }

  protected function formatearFechaParaBD(int $timestamp): string
  {
    $offset = $this->obtenerOffsetHorario();
    return gmdate('Y-m-d', $timestamp + $offset);
  }
}
