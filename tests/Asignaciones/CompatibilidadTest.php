<?php

use PHPUnit\Framework\TestCase;
use Micodigo\Aula\AulaAsignacionesValidacionesTrait;

require_once __DIR__ . '/../../servidor/src/Aula/AulaAsignacionesValidacionesTrait.php';

class CompatibilidadTest extends TestCase
{
  use AulaAsignacionesValidacionesTrait;

  public function testDeterminarTipoDocenteDesdeCargo()
  {
    $this->assertSame('aula', $this->determinarTipoDocenteDesdeCargo('Docente de Aula'));
    $this->assertSame('especialista', $this->determinarTipoDocenteDesdeCargo('Docente Especialista'));
    $this->assertSame('cultura', $this->determinarTipoDocenteDesdeCargo('Docente de Cultura'));
    $this->assertSame('aula', $this->determinarTipoDocenteDesdeCargo('Docente'));
  }

  public function testDeterminarTipoComponenteDesdeEspecialista()
  {
    $this->assertSame('aula', $this->determinarTipoComponenteDesdeEspecialista(''));
    $this->assertSame('especialista', $this->determinarTipoComponenteDesdeEspecialista('Docente Especialista'));
    $this->assertSame('cultura', $this->determinarTipoComponenteDesdeEspecialista('Docente de Cultura'));
  }

  public function testValidarCompatibilidadDocenteComponente()
  {
    $this->assertTrue($this->validarCompatibilidadDocenteComponente('aula', 'aula'));
    $this->assertTrue($this->validarCompatibilidadDocenteComponente('aula', 'especialista'));
    $this->assertTrue($this->validarCompatibilidadDocenteComponente('aula', 'cultura'));
    $this->assertTrue($this->validarCompatibilidadDocenteComponente('especialista', 'especialista'));
    $this->assertFalse($this->validarCompatibilidadDocenteComponente('especialista', 'aula'));
    $this->assertFalse($this->validarCompatibilidadDocenteComponente('cultura', 'especialista'));
  }
}
