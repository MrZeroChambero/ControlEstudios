<?php

namespace Micodigo\CondicionesSalud;

use Micodigo\Config\Conexion;
use Micodigo\Utils\RespuestaJson;
use Valitron\Validator;

class CondicionesSalud
{
  public function __construct(array $data = [])
  {
    Validator::lang('es');
  }

  private function pdo()
  {
    return Conexion::obtener();
  }

  // GET /condiciones-salud/estudiante/{id} y alias
  public function listarCondicionesEstudiante($id)
  {
    try {
      $pdo = $this->pdo();
      $sql = "SELECT c.id_condicion, c.fk_estudiante, c.fk_patologia, p.nombre_patologia, c.observaciones
              FROM condiciones_salud c
              LEFT JOIN patologias p ON p.id_patologia = c.fk_patologia
              WHERE c.fk_estudiante = ?
              ORDER BY c.id_condicion DESC";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$id]);
      $data = $stmt->fetchAll(\PDO::FETCH_ASSOC);
      RespuestaJson::exito($data, 'Condiciones obtenidas.');
    } catch (\Exception $e) {
      RespuestaJson::error('Error listando condiciones.', 500, null, $e);
    }
  }

  // POST /condiciones-salud
  public function crearCondicion()
  {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $required = ['fk_estudiante', 'fk_patologia'];
    $errors = [];
    foreach ($required as $r) if (empty($input[$r])) $errors[$r] = 'Requerido';
    if ($errors) {
      RespuestaJson::error('Validación fallida.', 422, $errors);
      return;
    }
    try {
      $pdo = $this->pdo();
      $sql = "INSERT INTO condiciones_salud (fk_estudiante, fk_patologia, observaciones) VALUES (?,?,?)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        $input['fk_estudiante'],
        $input['fk_patologia'],
        $input['observaciones'] ?? null
      ]);
      $id = $pdo->lastInsertId();
      RespuestaJson::exito(['id_condicion' => (int) $id], 'Condición creada.', 201);
    } catch (\Exception $e) {
      RespuestaJson::error('Error creando condición.', 500, null, $e);
    }
  }

  // PUT /condiciones-salud/{id}
  public function actualizarCondicion($id)
  {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $permitidos = ['fk_patologia', 'observaciones'];
    $sets = [];
    $vals = [];
    foreach ($permitidos as $c) {
      if (array_key_exists($c, $input)) {
        $sets[] = "$c = ?";
        $vals[] = $input[$c] === '' ? null : $input[$c];
      }
    }
    if (empty($sets)) {
      RespuestaJson::error('Sin campos para actualizar.', 400);
      return;
    }
    $vals[] = $id;
    try {
      $pdo = $this->pdo();
      $sql = 'UPDATE condiciones_salud SET ' . implode(', ', $sets) . ' WHERE id_condicion = ?';
      $stmt = $pdo->prepare($sql);
      $ok = $stmt->execute($vals);
      RespuestaJson::exito(['updated' => (bool) $ok], 'Condición actualizada.');
    } catch (\Exception $e) {
      RespuestaJson::error('Error actualizando condición.', 500, null, $e);
    }
  }

  // DELETE /condiciones-salud/{id}
  public function eliminarCondicion($id)
  {
    try {
      $pdo = $this->pdo();
      $stmt = $pdo->prepare('DELETE FROM condiciones_salud WHERE id_condicion = ?');
      $ok = $stmt->execute([$id]);
      if (!$ok) {
        RespuestaJson::error('No fue posible eliminar la condición de salud.', 500);
        return;
      }

      RespuestaJson::exito(['deleted' => true], 'Condición eliminada.');
    } catch (\Exception $e) {
      RespuestaJson::error('Error eliminando condición.', 500, null, $e);
    }
  }
}
