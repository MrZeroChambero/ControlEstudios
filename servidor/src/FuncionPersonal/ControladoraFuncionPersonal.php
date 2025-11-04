<?php

namespace Micodigo\FuncionPersonal;

use Micodigo\Config\Conexion;
use Exception;

class ControladoraFuncionPersonal
{
  public function listar()
  {
    try {
      $pdo = Conexion::obtener();
      $funciones = FuncionPersonal::consultarTodos($pdo);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => true,
        'data' => $funciones,
        'message' => 'Funciones del personal obtenidas exitosamente.'
      ]);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error al obtener las funciones del personal.',
        'error_details' => $e->getMessage()
      ]);
    }
  }

  public function listarSelect()
  {
    try {
      $pdo = Conexion::obtener();
      $funciones = FuncionPersonal::consultarParaSelect($pdo);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => true,
        'data' => $funciones,
        'message' => 'Funciones del personal para select obtenidas exitosamente.'
      ]);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'back' => false,
        'message' => 'Error al obtener las funciones del personal para select.',
        'error_details' => $e->getMessage()
      ]);
    }
  }
}
