<?php

namespace Micodigo\Parentesco;

use PDO;

class TiposParentesco
{
  /**
   * Obtiene los tipos permitidos de un archivo JSON configurable.
   * Si no existe o está vacío, retorna la lista por defecto.
   */
  public static function obtenerTiposPermitidos(PDO $pdo = null): array
  {
    $default = ['madre', 'padre', 'abuelo', 'tio', 'hermano', 'otro', 'abuela', 'hermana', 'tia'];
    $path = __DIR__ . '/../sql/tipos_parentesco.json';
    try {
      if (is_file($path)) {
        $raw = file_get_contents($path);
        $data = json_decode($raw, true);
        if (is_array($data) && !empty($data)) {
          // Normalizar a minúsculas y quitar duplicados
          $tipos = array_values(array_unique(array_map(fn($t) => strtolower(trim($t)), $data)));
          return $tipos;
        }
      }
    } catch (\Throwable $e) {
      // Ignorar y retornar por defecto
    }
    return $default;
  }
}
