<?php

namespace Micodigo\Sql;

use Micodigo\Config\Conexion;
use PDO;
use InvalidArgumentException;

/**
 * Clase BaseDatos
 * Métodos (en español) para operaciones comunes:
 *  - consultarTabla
 *  - consultarPor
 *  - consultarRelaciones
 *  - consultarRelacionesPor
 *  - insertar
 *  - eliminar
 *  - actualizar
 *
 * Usa Micodigo\Config\Conexion::obtener() para obtener PDO.
 */
class BaseDatos
{
  /**
   * @var PDO
   */
  protected $pdo;

  public function __construct(PDO $pdo = null)
  {
    if ($pdo instanceof PDO) {
      $this->pdo = $pdo;
    } else {
      $this->pdo = Conexion::obtener();
    }
    $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  }

  // 1) Consultar una tabla completa (columnas opcionales, opciones: order, limit, offset)
  public function consultarTabla(string $tabla, array $columnas = ['*'], array $opciones = []): array
  {
    $cols = $this->formatearColumnas($columnas);
    $sql = "SELECT {$cols} FROM " . $this->cotizarIdentificador($tabla);
    $sql .= $this->construirOpciones($opciones);
    $stmt = $this->pdo->query($sql);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  // 2) Consultar por uno o varios parámetros en una tabla
  // $where = ['id' => 1, 'status' => ['A','B'], 'col' => null]
  public function consultarPor(string $tabla, array $where, array $columnas = ['*'], array $opciones = []): array
  {
    [$whereSql, $params] = $this->construirWhere($where);
    $cols = $this->formatearColumnas($columnas);
    $sql = "SELECT {$cols} FROM " . $this->cotizarIdentificador($tabla) . " WHERE {$whereSql}";
    $sql .= $this->construirOpciones($opciones);
    $stmt = $this->pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  // 3) Consultar varias tablas relacionadas (joins)
  // $joins = [
  //   ['type'=>'INNER','table'=>'otra','alias'=>'o','on'=>'t.id = o.t_id'],
  // ]
  public function consultarRelaciones(string $tablaBase, array $joins, array $columnas = ['*'], array $opciones = []): array
  {
    $cols = $this->formatearColumnas($columnas);
    $sql = "SELECT {$cols} FROM " . $this->cotizarIdentificador($tablaBase) . " t";
    foreach ($joins as $j) {
      $type = strtoupper($j['type'] ?? 'INNER');
      $table = $this->cotizarIdentificador($j['table']);
      $alias = isset($j['alias']) ? ' ' . $this->cotizarIdentificador($j['alias']) : '';
      $on = $j['on'] ?? '';
      $sql .= " {$type} JOIN {$table}{$alias} ON {$on}";
    }
    $sql .= $this->construirOpciones($opciones);
    $stmt = $this->pdo->query($sql);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  // 4) Consultar varias tablas relacionadas por uno o varios parámetros
  public function consultarRelacionesPor(string $tablaBase, array $joins, array $where, array $columnas = ['*'], array $opciones = []): array
  {
    [$whereSql, $params] = $this->construirWhere($where);
    $cols = $this->formatearColumnas($columnas);
    $sql = "SELECT {$cols} FROM " . $this->cotizarIdentificador($tablaBase) . " t";
    foreach ($joins as $j) {
      $type = strtoupper($j['type'] ?? 'INNER');
      $table = $this->cotizarIdentificador($j['table']);
      $alias = isset($j['alias']) ? ' ' . $this->cotizarIdentificador($j['alias']) : '';
      $on = $j['on'] ?? '';
      $sql .= " {$type} JOIN {$table}{$alias} ON {$on}";
    }
    $sql .= " WHERE {$whereSql}";
    $sql .= $this->construirOpciones($opciones);
    $stmt = $this->pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  // 5) Insertar datos en una tabla. Devuelve lastInsertId (string) o false
  public function insertar(string $tabla, array $datos)
  {
    if (empty($datos)) {
      throw new InvalidArgumentException('Datos de inserción vacíos.');
    }
    $cols = array_keys($datos);
    $ph = array_map(fn($c) => ':' . $c, $cols);
    $sql = "INSERT INTO " . $this->cotizarIdentificador($tabla)
      . " (" . implode(', ', array_map([$this, 'cotizarIdentificador'], $cols)) . ") "
      . "VALUES (" . implode(', ', $ph) . ")";
    $stmt = $this->pdo->prepare($sql);
    $stmt->execute($datos);
    return $this->pdo->lastInsertId();
  }

  // 6) Eliminar por uno o varios parámetros. Devuelve filas afectadas
  public function eliminar(string $tabla, array $where): int
  {
    if (empty($where)) {
      throw new InvalidArgumentException('DELETE requiere cláusula WHERE.');
    }
    [$whereSql, $params] = $this->construirWhere($where);
    $sql = "DELETE FROM " . $this->cotizarIdentificador($tabla) . " WHERE {$whereSql}";
    $stmt = $this->pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->rowCount();
  }

  // 7) Actualizar por uno o varios parámetros. Devuelve filas afectadas
  public function actualizar(string $tabla, array $datos, array $where): int
  {
    if (empty($datos)) {
      throw new InvalidArgumentException('UPDATE requiere datos a modificar.');
    }
    if (empty($where)) {
      throw new InvalidArgumentException('UPDATE requiere cláusula WHERE.');
    }
    $setParts = [];
    $params = [];
    foreach ($datos as $col => $val) {
      $ph = ':u_' . $col;
      $setParts[] = $this->cotizarIdentificador($col) . " = {$ph}";
      $params['u_' . $col] = $val;
    }
    [$whereSql, $whereParams] = $this->construirWhere($where);
    foreach ($whereParams as $k => $v) {
      $params[$k] = $v;
    }
    $sql = "UPDATE " . $this->cotizarIdentificador($tabla) . " SET " . implode(', ', $setParts) . " WHERE {$whereSql}";
    $stmt = $this->pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->rowCount();
  }

  /* Métodos auxiliares */

  // Construye WHERE y parámetros. Soporta arrays (IN) y NULL.
  protected function construirWhere(array $where): array
  {
    $partes = [];
    $params = [];
    foreach ($where as $col => $val) {
      $limpia = preg_replace('/[^a-zA-Z0-9_]/', '_', $col);
      if (is_array($val)) {
        $holders = [];
        foreach ($val as $i => $v) {
          $ph = ":w_{$limpia}_{$i}";
          $holders[] = $ph;
          $params["w_{$limpia}_{$i}"] = $v;
        }
        $partes[] = $this->cotizarIdentificador($col) . " IN (" . implode(', ', $holders) . ")";
      } elseif ($val === null) {
        $partes[] = $this->cotizarIdentificador($col) . " IS NULL";
      } else {
        $ph = ":w_{$limpia}";
        $partes[] = $this->cotizarIdentificador($col) . " = {$ph}";
        $params["w_{$limpia}"] = $val;
      }
    }
    $clausula = implode(' AND ', $partes) ?: '1';
    return [$clausula, $params];
  }

  protected function formatearColumnas(array $columnas): string
  {
    if ($columnas === ['*']) return '*';
    return implode(', ', array_map([$this, 'cotizarIdentificador'], $columnas));
  }

  protected function construirOpciones(array $opciones): string
  {
    $sql = '';
    if (!empty($opciones['order'])) {
      $sql .= ' ORDER BY ' . $opciones['order'];
    }
    if (!empty($opciones['limit'])) {
      $sql .= ' LIMIT ' . (int)$opciones['limit'];
    }
    if (!empty($opciones['offset'])) {
      $sql .= ' OFFSET ' . (int)$opciones['offset'];
    }
    return $sql;
  }

  // Protege identificadores simples (soporta tabla.col y alias). Devuelve con backticks.
  protected function cotizarIdentificador(string $identificador): string
  {
    $identificador = trim($identificador);
    if (stripos($identificador, ' as ') !== false) {
      $parts = preg_split('/\s+as\s+/i', $identificador);
      return $this->cotizarIdentificador($parts[0]) . ' AS ' . $this->cotizarIdentificador($parts[1]);
    }
    if (strpos($identificador, '.') !== false) {
      $parts = explode('.', $identificador);
      return implode('.', array_map(fn($p) => '`' . str_replace('`', '', $p) . '`', $parts));
    }
    return '`' . str_replace('`', '', $identificador) . '`';
  }
}
