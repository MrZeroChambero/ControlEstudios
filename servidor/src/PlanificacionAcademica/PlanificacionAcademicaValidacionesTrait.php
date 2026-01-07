<?php

namespace Micodigo\PlanificacionAcademica;

use PDO;
use Valitron\Validator;

trait PlanificacionAcademicaValidacionesTrait
{
  protected function validar(PDO $pdo)
  {
    $payload = $this->obtenerPayloadValidable();
    $validator = new Validator($payload);
    $validator->labels([
      'fk_personal' => 'Docente',
      'fk_aula' => 'Aula',
      'fk_componente' => 'Componente',
      'fk_momento' => 'Momento',
      'tipo' => 'Tipo',
      'estado' => 'Estado',
      'reutilizable' => 'Reutilizable',
    ]);

    $validator->rule('required', ['fk_personal', 'fk_aula', 'fk_componente', 'fk_momento']);
    $validator->rule('integer', ['fk_personal', 'fk_aula', 'fk_componente', 'fk_momento', 'id_planificacion']);
    $validator->rule('in', 'tipo', ['individual', 'aula']);
    $validator->rule('in', 'estado', ['activo', 'inactivo']);
    $validator->rule('in', 'reutilizable', ['si', 'no']);

    $errores = $validator->validate() ? [] : $validator->errors();
    $errores = $this->combinarErrores($errores, $this->validarForaneas($pdo));
    $errores = $this->combinarErrores($errores, $this->validarColecciones($pdo));
    $errores = $this->combinarErrores($errores, $this->validarUnicidad($pdo));

    return empty($errores) ? true : $errores;
  }

  private function validarForaneas(PDO $pdo): array
  {
    $mapa = [
      'fk_personal' => ['tabla' => 'personal', 'columna' => 'id_personal', 'nombre' => 'docente'],
      'fk_aula' => ['tabla' => 'aula', 'columna' => 'id_aula', 'nombre' => 'aula'],
      'fk_componente' => ['tabla' => 'componentes_aprendizaje', 'columna' => 'id_componente', 'nombre' => 'componente'],
      'fk_momento' => ['tabla' => 'momentos', 'columna' => 'id_momento', 'nombre' => 'momento'],
    ];

    $errores = [];
    foreach ($mapa as $campo => $config) {
      $valor = $this->{$campo};
      if ($valor === null) {
        continue;
      }
      if (!$this->existeRegistro($pdo, $config['tabla'], $config['columna'], $valor)) {
        $errores[$campo][] = 'El ' . $config['nombre'] . ' indicado no existe.';
      }
    }

    return $errores;
  }

  private function validarColecciones(PDO $pdo): array
  {
    $errores = [];

    if ($this->competencias) {
      $faltantes = $this->faltantesEnTabla($pdo, 'competencias', 'id_competencia', $this->competencias);
      if ($faltantes) {
        $errores['competencias'][] = 'Competencias inexistentes: ' . implode(', ', $faltantes);
      }
    }

    if ($this->tipo === 'individual') {
      if (!$this->estudiantes) {
        $errores['estudiantes'][] = 'Debe indicar al menos un estudiante inscrito.';
      } else {
        $faltantes = $this->faltantesEnTabla($pdo, 'inscripciones', 'id_inscripcion', $this->estudiantes);
        if ($faltantes) {
          $errores['estudiantes'][] = 'Inscripciones inexistentes: ' . implode(', ', $faltantes);
        }
      }
    } else {
      $this->estudiantes = [];
    }

    return $errores;
  }

  private function validarUnicidad(PDO $pdo): array
  {
    if ($this->fk_personal === null || $this->fk_aula === null || $this->fk_componente === null || $this->fk_momento === null) {
      return [];
    }

    $sql = 'SELECT id_planificacion FROM ' . PlanificacionAcademica::TABLA . ' WHERE fk_personal = :fk_personal AND fk_aula = :fk_aula AND fk_componente = :fk_componente AND fk_momento = :fk_momento AND tipo = :tipo';
    $parametros = [
      ':fk_personal' => $this->fk_personal,
      ':fk_aula' => $this->fk_aula,
      ':fk_componente' => $this->fk_componente,
      ':fk_momento' => $this->fk_momento,
      ':tipo' => $this->tipo,
    ];

    if ($this->id_planificacion) {
      $sql .= ' AND id_planificacion != :id';
      $parametros[':id'] = $this->id_planificacion;
    }

    $stmt = $pdo->prepare($sql . ' LIMIT 1');
    $stmt->execute($parametros);
    if ($stmt->fetch(PDO::FETCH_ASSOC)) {
      return ['fk_componente' => ['Ya existe una planificación con los mismos datos.']];
    }

    return [];
  }

  private function existeRegistro(PDO $pdo, string $tabla, string $columna, int $valor): bool
  {
    $stmt = $pdo->prepare("SELECT 1 FROM {$tabla} WHERE {$columna} = :valor LIMIT 1");
    $stmt->execute([':valor' => $valor]);
    return (bool)$stmt->fetchColumn();
  }

  private function faltantesEnTabla(PDO $pdo, string $tabla, string $columna, array $valores): array
  {
    if (!$valores) {
      return [];
    }
    $placeholders = implode(',', array_fill(0, count($valores), '?'));
    $sql = "SELECT {$columna} FROM {$tabla} WHERE {$columna} IN ({$placeholders})";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(array_values($valores));
    $existentes = $stmt->fetchAll(PDO::FETCH_COLUMN) ?: [];
    $faltantes = array_diff($valores, array_map('intval', $existentes));
    return array_values($faltantes);
  }

  private function combinarErrores(array $acumulados, array $nuevos): array
  {
    foreach ($nuevos as $campo => $mensajes) {
      foreach ((array)$mensajes as $mensaje) {
        $acumulados[$campo][] = $mensaje;
      }
    }
    return $acumulados;
  }
}
