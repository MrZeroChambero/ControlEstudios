<?php

namespace Micodigo\Respaldo;

use Exception;

trait RespaldoValidacionesTrait
{
  protected function validarNombreArchivo(string $nombre): void
  {
    $this->asegurarExtensionSql($nombre);

    if (!preg_match('/^[0-9]{2}-[0-9]{2}-[0-9]{4}_[0-9]{2}-[0-9]{2}-[0-9]{2}\.sql$/', $nombre)) {
      throw new Exception('El nombre del respaldo no cumple con el formato esperado.');
    }
  }

  protected function validarCarga(array $archivo): void
  {
    $error = $archivo['error'] ?? UPLOAD_ERR_NO_FILE;
    if ($error !== UPLOAD_ERR_OK) {
      throw new Exception('No se pudo recibir el archivo proporcionado.');
    }

    $this->asegurarExtensionSql($archivo['name'] ?? '');

    if (($archivo['size'] ?? 0) <= 0) {
      throw new Exception('El archivo recibido está vacío.');
    }
  }
}
