<?php

namespace Micodigo\Respaldo;

use Micodigo\Config\Conexion;
use PDO;

class Respaldo
{
  use RespaldoAtributosTrait;
  use RespaldoUtilidadesTrait;
  use RespaldoValidacionesTrait;
  use RespaldoConsultasTrait;
  use RespaldoGestionTrait;
  use RespaldoBDTrait;

  protected PDO $pdo;

  public function __construct()
  {
    $this->configurarParametros(Conexion::obtenerParametros());
    $this->establecerDirectorioRespaldos(__DIR__ . DIRECTORY_SEPARATOR . 'RespaldosSql');
    $this->pdo = Conexion::obtener();
  }
}
