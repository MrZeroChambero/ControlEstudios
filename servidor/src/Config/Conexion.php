<?php

namespace Micodigo\Config;

class Conexion
{
  // Propiedad para almacenar la conexión PDO
  private static $pdo = null;

  // Método para obtener la instancia de PDO
  public static function obtener()
  {
    // Si ya hay una conexión, la devuelve para evitar crear otra
    if (self::$pdo !== null) {
      return self::$pdo;
    }

    // Datos de conexión
    $host = 'localhost';
    $dbname = 'escuela';
    $username = 'root';
    $password = '';

    try {
      $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
      $options = [
        \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
        \PDO::ATTR_EMULATE_PREPARES   => false,
        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
      ];

      // Ahora sí, creamos la conexión
      self::$pdo = new \PDO($dsn, $username, $password, $options);
      return self::$pdo;
    } catch (\PDOException $e) {
      http_response_code(500);
      echo json_encode(['msg' => 'Error de conexión a la base de datos: ' . $e->getMessage()]);
      exit;
    }
  }
}
