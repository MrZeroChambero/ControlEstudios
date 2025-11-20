<?php

namespace Micodigo\CondicionesSalud;

use Micodigo\Config\Conexion;
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

  private function json($arr, int $code = 200)
  {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($arr, JSON_UNESCAPED_UNICODE);
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
      return $this->json(['status' => 'success', 'message' => 'Condiciones obtenidas.', 'back' => true, 'data' => $data]);
    } catch (\Exception $e) {
      return $this->json(['status' => 'error', 'message' => 'Error listando condiciones.', 'back' => true, 'errors' => [$e->getMessage()]], 500);
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
      return $this->json(['status' => 'error', 'message' => 'Validación fallida.', 'back' => true, 'errors' => $errors], 422);
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
      return $this->json(['status' => 'success', 'message' => 'Condición creada.', 'back' => true, 'data' => ['id_condicion' => (int)$id]]);
    } catch (\Exception $e) {
      return $this->json(['status' => 'error', 'message' => 'Error creando condición.', 'back' => true, 'errors' => [$e->getMessage()]], 500);
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
      return $this->json(['status' => 'error', 'message' => 'Sin campos para actualizar.', 'back' => true], 400);
    }
    $vals[] = $id;
    try {
      $pdo = $this->pdo();
      $sql = 'UPDATE condiciones_salud SET ' . implode(', ', $sets) . ' WHERE id_condicion = ?';
      $stmt = $pdo->prepare($sql);
      $ok = $stmt->execute($vals);
      return $this->json(['status' => 'success', 'message' => 'Condición actualizada.', 'back' => true, 'data' => ['updated' => $ok]]);
    } catch (\Exception $e) {
      return $this->json(['status' => 'error', 'message' => 'Error actualizando condición.', 'back' => true, 'errors' => [$e->getMessage()]], 500);
    }
  }

  // DELETE /condiciones-salud/{id}
  public function eliminarCondicion($id)
  {
    try {
      $pdo = $this->pdo();
      $stmt = $pdo->prepare('DELETE FROM condiciones_salud WHERE id_condicion = ?');
      $ok = $stmt->execute([$id]);
      return $this->json(['status' => 'success', 'message' => 'Condición eliminada.', 'back' => true, 'data' => ['deleted' => $ok]]);
    } catch (\Exception $e) {
      return $this->json(['status' => 'error', 'message' => 'Error eliminando condición.', 'back' => true, 'errors' => [$e->getMessage()]], 500);
    }
  }
}
