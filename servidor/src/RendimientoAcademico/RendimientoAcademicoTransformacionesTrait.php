<?php

namespace Micodigo\RendimientoAcademico;

use PDO;
use PDOException;
use RuntimeException;

trait RendimientoAcademicoTransformacionesTrait
{
  /**
   * Cachea los identificadores de literales por su código textual.
   * @var array<string, int>
   */
  protected array $cacheLiteralPorCodigo = [];

  /**
   * Cachea los códigos de literales por su identificador numérico.
   * @var array<int, string>
   */
  protected array $cacheLiteralPorId = [];

  /**
   * Mapea una letra simple (A-E) al literal institucional (A2-E2).
   */
  protected function normalizarLetraLiteral(string $valor): string
  {
    $letra = strtoupper(trim($valor));
    $mapa = [
      'A' => 'A2',
      'B' => 'B2',
      'C' => 'C2',
      'D' => 'D2',
      'E' => 'E2',
    ];

    if (!isset($mapa[$letra])) {
      throw new RuntimeException('Literal inválido. Solo se permiten A, B, C, D o E.');
    }

    return $mapa[$letra];
  }

  protected function literalIdDesdeCodigo(PDO $conexion, string $codigo): int
  {
    if (isset($this->cacheLiteralPorCodigo[$codigo])) {
      return $this->cacheLiteralPorCodigo[$codigo];
    }

    $sql = 'SELECT id_literal FROM literal WHERE literal = ? LIMIT 1';
    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$codigo]);
    $identificador = $sentencia->fetchColumn();

    if ($identificador === false) {
      $descripcion = sprintf('Desempeño %s', $codigo);
      try {
        $insertar = $conexion->prepare('INSERT INTO literal (literal, descripcion) VALUES (?, ?)');
        $insertar->execute([$codigo, $descripcion]);
        $identificador = $conexion->lastInsertId();
      } catch (PDOException $e) {
        $identificador = null;
      }

      if (!$identificador) {
        $sentencia = $conexion->prepare($sql);
        $sentencia->execute([$codigo]);
        $identificador = $sentencia->fetchColumn();
      }

      if ($identificador === false || $identificador === null) {
        throw new RuntimeException('No fue posible registrar el literal requerido.');
      }
    }

    $id = (int) $identificador;
    $this->cacheLiteralPorCodigo[$codigo] = $id;
    $this->cacheLiteralPorId[$id] = $codigo;

    return $id;
  }

  protected function literalCodigoDesdeId(PDO $conexion, int $id): ?string
  {
    if (isset($this->cacheLiteralPorId[$id])) {
      return $this->cacheLiteralPorId[$id];
    }

    $sql = 'SELECT literal FROM literal WHERE id_literal = ? LIMIT 1';
    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$id]);
    $codigo = $sentencia->fetchColumn();

    if ($codigo === false) {
      return null;
    }

    $codigo = (string) $codigo;
    $this->cacheLiteralPorId[$id] = $codigo;
    $this->cacheLiteralPorCodigo[$codigo] = $id;

    return $codigo;
  }

  protected function letraDesdeLiteralCodigo(string $codigo): string
  {
    return strtoupper($codigo[0] ?? '');
  }

  protected function mapearLetraALiteralId(PDO $conexion, string $letra): int
  {
    $codigo = $this->normalizarLetraLiteral($letra);
    return $this->literalIdDesdeCodigo($conexion, $codigo);
  }

  protected function mapearLiteralIdALetra(PDO $conexion, int $idLiteral): string
  {
    $codigo = $this->literalCodigoDesdeId($conexion, $idLiteral);
    if ($codigo === null) {
      return '';
    }

    return $this->letraDesdeLiteralCodigo($codigo);
  }

  protected function catalogoLiteralesEvaluacion(PDO $conexion): array
  {
    $codigos = ['A2', 'B2', 'C2', 'D2', 'E2'];
    $catalogo = [];

    foreach ($codigos as $codigo) {
      $id = $this->literalIdDesdeCodigo($conexion, $codigo);
      $catalogo[] = [
        'id_literal' => $id,
        'literal' => $codigo,
        'letra' => $this->letraDesdeLiteralCodigo($codigo),
      ];
    }

    return $catalogo;
  }
}
