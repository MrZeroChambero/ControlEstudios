<?php

namespace Micodigo\Respaldo;

trait RespaldoAtributosTrait
{
  protected string $host = 'localhost';
  protected string $baseDatos = 'escuela';
  protected string $usuario = 'root';
  protected string $contrasena = '';
  protected string $directorioRespaldos;

  protected function configurarParametros(array $parametros): void
  {
    $this->host = $parametros['host'] ?? 'localhost';
    $this->baseDatos = $parametros['dbname'] ?? 'escuela';
    $this->usuario = $parametros['username'] ?? 'root';
    $this->contrasena = $parametros['password'] ?? '';
  }

  protected function establecerDirectorioRespaldos(string $ruta): void
  {
    $this->directorioRespaldos = rtrim($ruta, DIRECTORY_SEPARATOR);
  }
}
