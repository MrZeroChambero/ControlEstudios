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

    $parametros = self::obtenerParametros();
    $host = $parametros['host'];
    $dbname = $parametros['dbname'];
    $username = $parametros['username'];
    $password = $parametros['password'];

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

  public static function obtenerParametros(): array
  {
    // Allow overriding via environment variables for Docker / CI
    $envHost = getenv('DB_HOST');
    $envName = getenv('DB_NAME') ?: getenv('DB_DATABASE');
    $envUser = getenv('DB_USER') ?: getenv('DB_USERNAME');
    $envPass = getenv('DB_PASS') ?: getenv('DB_PASSWORD');

    return [
      'host' => $envHost ?: 'localhost',
      'dbname' => $envName ?: 'escuela',
      'username' => $envUser ?: 'root',
      'password' => $envPass ?: '',
    ];
  }
}
