<?php

namespace Micodigo\ConsultasMedicas;

use Micodigo\Utils\RespuestaJson;

class ConsultasMedicas
{
  private function parseJsonInput(): array
  {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return $data ?? [];
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
      RespuestaJson::exito($rows, 'Consultas listadas.');
    } catch (\Exception $e) {
      RespuestaJson::error('Error al listar las consultas médicas.', 500, null, $e);
    }
  }

  public function listarPorEstudiante(int $id_estudiante): void
  {
    try {
      $pdo = $this->obtenerPDO();
      $stmt = $pdo->prepare("SELECT id_consulta, fk_estudiante, tipo_consulta, fecha_consulta AS fecha, motivo AS descripcion, observaciones AS tratamiento FROM consultas_medicas WHERE fk_estudiante = ? ORDER BY fecha_consulta DESC, id_consulta DESC");
      $stmt->execute([$id_estudiante]);
      $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);
      RespuestaJson::exito($rows, 'Consultas del estudiante obtenidas.');
    } catch (\Exception $e) {
      RespuestaJson::error('Error al listar las consultas del estudiante.', 500, null, $e);
    }
  }

  public function crear(): void
  {
    try {
      $data = $this->parseJsonInput();
      $errores = $this->validar($data, true);
      if ($errores) {
        RespuestaJson::error('Errores de validación.', 400, $errores);
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
      RespuestaJson::exito($row, 'Consulta creada.', 201);
    } catch (\Exception $e) {
      RespuestaJson::error('Error al crear la consulta médica.', 500, null, $e);
    }
  }

  public function actualizar(int $id_consulta): void
  {
    try {
      $data = $this->parseJsonInput();
      $errores = $this->validar($data, false);
      if ($errores) {
        RespuestaJson::error('Errores de validación.', 400, $errores);
        return;
      }
      $pdo = $this->obtenerPDO();
      $existe = $this->obtenerPorId($pdo, $id_consulta);
      if (!$existe) {
        RespuestaJson::error('Consulta no encontrada.', 404);
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
      RespuestaJson::exito($row, 'Consulta actualizada.');
    } catch (\Exception $e) {
      RespuestaJson::error('Error al actualizar la consulta médica.', 500, null, $e);
    }
  }

  public function eliminar(int $id_consulta): void
  {
    try {
      $pdo = $this->obtenerPDO();
      $stmt = $pdo->prepare("DELETE FROM consultas_medicas WHERE id_consulta = ?");
      $stmt->execute([$id_consulta]);
      RespuestaJson::exito(['id_consulta' => $id_consulta], 'Consulta eliminada.');
    } catch (\Exception $e) {
      RespuestaJson::error('Error al eliminar la consulta médica.', 500, null, $e);
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
