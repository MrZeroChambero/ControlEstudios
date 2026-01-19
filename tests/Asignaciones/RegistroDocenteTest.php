<?php

use PHPUnit\Framework\TestCase;
use Micodigo\Aula\AulaAsignacionesValidacionesTrait;

require_once __DIR__ . '/../../servidor/src/Aula/AulaAsignacionesValidacionesTrait.php';

class RegistroDocenteTest extends TestCase
{
  use AulaAsignacionesValidacionesTrait;

  public function testValidarAsignacionDocenteValida()
  {
    $entrada = [
      'id_personal' => '5',
      'componentes' => ['1', '2'],
      'clases_totales' => '40',
    ];

    $resultado = $this->validarAsignacionDocente($entrada);
    $this->assertTrue($resultado['valido']);
    $this->assertSame(5, $resultado['datos']['id_personal']);
    $this->assertSame([1, 2], $resultado['datos']['componentes']);
    $this->assertSame(40, $resultado['datos']['clases_totales']);
  }

  public function testValidarAsignacionDocenteInvalida()
  {
    $entrada = [
      'id_personal' => null,
      'componentes' => [],
      'clases_totales' => -5,
    ];

    $resultado = $this->validarAsignacionDocente($entrada);
    $this->assertFalse($resultado['valido']);
    $this->assertArrayHasKey('id_personal', $resultado['errores']);
    $this->assertArrayHasKey('componentes', $resultado['errores']);
    $this->assertArrayHasKey('clases_totales', $resultado['errores']);
  }
}
