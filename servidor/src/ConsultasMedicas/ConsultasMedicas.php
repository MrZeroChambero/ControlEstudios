<?php

namespace Micodigo\ConsultasMedicas;

class ConsultasMedicas
{
  private function parseJsonInput(): array
  {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return $data ?? [];
  }

  private function sendJson(int $code, string $status, string $message, $data = null, $errors = null): void
  {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    $resp = ['status' => $status, 'message' => $message, 'back' => $status === 'success'];
    if ($data !== null) $resp['data'] = $data;
    if ($errors !== null) $resp['errors'] = $errors;
    echo json_encode($resp, JSON_UNESCAPED_UNICODE);
  }

  private function obtenerPDO(): \PDO
  {
    return \Micodigo\Config\Conexion::obtener();
  }

  public function listarTodas(): void
  {
    try {
      $pdo = $this->obtenerPDO();
      $stmt = $pdo->query("SELECT id_consulta, fk_estudiante, tipo_consulta, fecha_consulta AS fecha, motivo AS descripcion, observaciones AS tratamiento FROM consultas_medicas ORDER BY fecha_consulta DESC, id_consulta DESC");
      $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);
      $this->sendJson(200, 'success', 'Consultas listadas.', $rows);
    } catch (\Exception $e) {
      $this->sendJson(500, 'error', 'Error al listar: ' . $e->getMessage());
    }
  }

  public function listarPorEstudiante(int $id_estudiante): void
  {
    try {
      $pdo = $this->obtenerPDO();
      $stmt = $pdo->prepare("SELECT id_consulta, fk_estudiante, tipo_consulta, fecha_consulta AS fecha, motivo AS descripcion, observaciones AS tratamiento FROM consultas_medicas WHERE fk_estudiante = ? ORDER BY fecha_consulta DESC, id_consulta DESC");
      $stmt->execute([$id_estudiante]);
      $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);
      $this->sendJson(200, 'success', 'Consultas del estudiante obtenidas.', $rows);
    } catch (\Exception $e) {
      $this->sendJson(500, 'error', 'Error al listar por estudiante: ' . $e->getMessage());
    }
  }

  public function crear(): void
  {
    try {
      $data = $this->parseJsonInput();
      $errores = $this->validar($data, true);
      if ($errores) {
        $this->sendJson(400, 'error', 'Errores de validación.', null, $errores);
        return;
      }
      $pdo = $this->obtenerPDO();
      $stmt = $pdo->prepare("INSERT INTO consultas_medicas (fk_estudiante, tipo_consulta, motivo, tiene_informe_medico, fecha_consulta, observaciones) VALUES (?,?,?,?,?,?)");
      $stmt->execute([
        $data['fk_estudiante'],
        $data['tipo_consulta'],
        $data['descripcion'] ?? null,
        $data['tiene_informe_medico'] ?? 0,
        $data['fecha'] ?? date('Y-m-d'),
        $data['tratamiento'] ?? null,
      ]);
      $id = $pdo->lastInsertId();
      $row = $this->obtenerPorId($pdo, $id);
      $this->sendJson(201, 'success', 'Consulta creada.', $row);
    } catch (\Exception $e) {
      $this->sendJson(500, 'error', 'Error al crear: ' . $e->getMessage());
    }
  }

  public function actualizar(int $id_consulta): void
  {
    try {
      $data = $this->parseJsonInput();
      $errores = $this->validar($data, false);
      if ($errores) {
        $this->sendJson(400, 'error', 'Errores de validación.', null, $errores);
        return;
      }
      $pdo = $this->obtenerPDO();
      $existe = $this->obtenerPorId($pdo, $id_consulta);
      if (!$existe) {
        $this->sendJson(404, 'error', 'Consulta no encontrada.');
        return;
      }
      $stmt = $pdo->prepare("UPDATE consultas_medicas SET tipo_consulta = ?, motivo = ?, tiene_informe_medico = ?, fecha_consulta = ?, observaciones = ? WHERE id_consulta = ?");
      $stmt->execute([
        $data['tipo_consulta'] ?? $existe['tipo_consulta'],
        $data['descripcion'] ?? $existe['motivo'],
        $data['tiene_informe_medico'] ?? $existe['tiene_informe_medico'],
        $data['fecha'] ?? $existe['fecha_consulta'],
        $data['tratamiento'] ?? $existe['observaciones'],
        $id_consulta
      ]);
      $row = $this->obtenerPorId($pdo, $id_consulta);
      $this->sendJson(200, 'success', 'Consulta actualizada.', $row);
    } catch (\Exception $e) {
      $this->sendJson(500, 'error', 'Error al actualizar: ' . $e->getMessage());
    }
  }

  public function eliminar(int $id_consulta): void
  {
    try {
      $pdo = $this->obtenerPDO();
      $stmt = $pdo->prepare("DELETE FROM consultas_medicas WHERE id_consulta = ?");
      $stmt->execute([$id_consulta]);
      $this->sendJson(200, 'success', 'Consulta eliminada.', ['id_consulta' => $id_consulta]);
    } catch (\Exception $e) {
      $this->sendJson(500, 'error', 'Error al eliminar: ' . $e->getMessage());
    }
  }

  private function validar(array $data, bool $crear): array
  {
    $err = [];
    if ($crear) {
      if (empty($data['fk_estudiante'])) $err['fk_estudiante'] = 'Requerido';
      if (empty($data['tipo_consulta'])) $err['tipo_consulta'] = 'Requerido';
    }
    if (isset($data['tipo_consulta']) && !in_array($data['tipo_consulta'], ['control', 'urgencia', 'especialista'], true)) {
      $err['tipo_consulta'] = 'Valor no permitido';
    }
    if (isset($data['fecha']) && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['fecha'])) {
      $err['fecha'] = 'Formato inválido YYYY-MM-DD';
    }
    return $err;
  }

  private function obtenerPorId(\PDO $pdo, $id): ?array
  {
    $stmt = $pdo->prepare("SELECT id_consulta, fk_estudiante, tipo_consulta, fecha_consulta AS fecha, motivo AS descripcion, observaciones AS tratamiento, tiene_informe_medico FROM consultas_medicas WHERE id_consulta = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(\PDO::FETCH_ASSOC);
    return $row ?: null;
  }
}
