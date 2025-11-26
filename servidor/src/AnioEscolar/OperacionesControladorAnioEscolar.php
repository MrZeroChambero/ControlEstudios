<?php

namespace Micodigo\AnioEscolar;

use Micodigo\Config\Conexion;
use Exception;

trait OperacionesControladorAnioEscolar
{
  public function listarAnios()
  {
    try {
      $pdo = Conexion::obtener();
      $datos = self::consultarTodosLosAnios($pdo);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $datos, 'message' => 'Años escolares obtenidos exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al listar años escolares.', 'error_details' => $e->getMessage()]);
    }
  }

  public function crearAnio()
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);
      if (json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());

      $data['nombre'] = $this->limpiarTexto($data['nombre'] ?? null);
      $v = $this->crearValidadorAnio($data);
      if (!$v->validate()) {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'errors' => $v->errors()]);
        return;
      }

      $pdo = Conexion::obtener();

      // Validaciones adicionales: duración <= 365 y sin solapamiento
      $duracion = ValidacionesAnioEscolar::calcularDuracionDias($data['fecha_inicio'], $data['fecha_fin']);
      if ($duracion <= 0 || $duracion > 365) {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'message' => 'La duración del año escolar debe ser entre 1 y 365 días.']);
        return;
      }

      if (ValidacionesAnioEscolar::verificarSolapamiento($pdo, $data['fecha_inicio'], $data['fecha_fin'], null)) {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'message' => 'El rango de fechas se solapa con otro año escolar existente.']);
        return;
      }

      // Si el año se crea como 'incompleto', generamos automáticamente 3 momentos de 70 días
      $estado = $data['estado'] ?? 'incompleto';
      if ($estado === 'incompleto') {
        $resultado = self::crearAnioConMomentosBD($pdo, $data);
        header('Content-Type: application/json');
        echo json_encode(['back' => true, 'data' => $resultado, 'message' => 'Año escolar creado con momentos (incompleto).']);
        return;
      }

      // Si no es incompleto, creación normal
      $id = self::crearAnioBD($pdo, $data);
      $nuevo = self::consultarAnioPorId($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $nuevo, 'message' => 'Año escolar creado exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al crear año escolar.', 'error_details' => $e->getMessage()]);
    }
  }

  // Cambia estado a 'activo' (apertura) para un año escolar
  public function aperturarAnio($id)
  {
    try {
      $pdo = Conexion::obtener();

      // Obtener momentos del año
      $momentos = \Micodigo\MomentoAcademico\MomentoAcademico::consultarMomentosPorAnio($pdo, $id);

      // Obtener aulas asociadas al año
      $stmtA = $pdo->prepare("SELECT * FROM aula WHERE fk_anio_escolar = ? AND estado = 'activo'");
      $stmtA->execute([$id]);
      $aulas = $stmtA->fetchAll(\PDO::FETCH_ASSOC);

      // Obtener áreas activas
      $stmtAreas = $pdo->prepare("SELECT id_area_aprendizaje, fk_funcion FROM areas_aprendizaje WHERE estado = 'activo'");
      $stmtAreas->execute();
      $areas = $stmtAreas->fetchAll(\PDO::FETCH_ASSOC);

      $resumen = ['creadas' => 0, 'omitidas' => 0, 'errores' => [], 'avisos' => []];

      $pdo->beginTransaction();

      foreach ($aulas as $aula) {
        $idAula = $aula['id_aula'] ?? $aula['id'] ?? null;
        $fkGuia = $aula['fk_guia'] ?? null;
        if (!$idAula) {
          $resumen['avisos'][] = "Aula sin id válida, se omite.";
          continue;
        }

        if (empty($momentos)) {
          $resumen['avisos'][] = "No hay momentos registrados para el año {$id}.";
          break;
        }

        foreach ($areas as $area) {
          $idArea = $area['id_area_aprendizaje'];
          $fkFuncionArea = $area['fk_funcion'];

          // 1) Crear imparticiones por guía (Integral) si existe guía
          if ($fkGuia) {
            foreach ($momentos as $mom) {
              $idMom = $mom['id_momento'];
              // comprobar duplicado
              $chk = $pdo->prepare("SELECT COUNT(*) FROM imparticion_clases WHERE fk_aula = ? AND fk_docente = ? AND fk_momento = ? AND fk_area_aprendizaje = ? AND tipo_docente = ?");
              $chk->execute([$idAula, $fkGuia, $idMom, $idArea, 'Integral']);
              $cnt = (int)$chk->fetchColumn();
              if ($cnt > 0) {
                $resumen['omitidas']++;
                continue;
              }

              $ins = $pdo->prepare("INSERT INTO imparticion_clases (fk_aula, fk_docente, fk_momento, fk_area_aprendizaje, tipo_docente) VALUES (?, ?, ?, ?, ?)");
              $ins->execute([$idAula, $fkGuia, $idMom, $idArea, 'Integral']);
              $resumen['creadas']++;
            }
          } else {
            $resumen['avisos'][] = "Aula {$idAula} no tiene guía asignado; no se crearán imparticiones 'Integral' para ella.";
          }

          // 2) Buscar especialista para el área
          $fkEspecialista = null;
          if ($fkFuncionArea) {
            $stmtP = $pdo->prepare("SELECT id_personal FROM personal WHERE fk_funcion = ? AND estado = 'activo' LIMIT 1");
            $stmtP->execute([$fkFuncionArea]);
            $rowP = $stmtP->fetch(\PDO::FETCH_ASSOC);
            if ($rowP) $fkEspecialista = $rowP['id_personal'];
          }

          if ($fkEspecialista) {
            foreach ($momentos as $mom) {
              $idMom = $mom['id_momento'];
              $chk = $pdo->prepare("SELECT COUNT(*) FROM imparticion_clases WHERE fk_aula = ? AND fk_docente = ? AND fk_momento = ? AND fk_area_aprendizaje = ? AND tipo_docente = ?");
              $chk->execute([$idAula, $fkEspecialista, $idMom, $idArea, 'Especialista']);
              $cnt = (int)$chk->fetchColumn();
              if ($cnt > 0) {
                $resumen['omitidas']++;
                continue;
              }

              $ins = $pdo->prepare("INSERT INTO imparticion_clases (fk_aula, fk_docente, fk_momento, fk_area_aprendizaje, tipo_docente) VALUES (?, ?, ?, ?, ?)");
              $ins->execute([$idAula, $fkEspecialista, $idMom, $idArea, 'Especialista']);
              $resumen['creadas']++;
            }
          } else {
            $resumen['avisos'][] = "No se encontró especialista activo para el área {$idArea} (aula {$idAula}).";
          }
        }
      }

      // Finalmente actualizar estado del año
      $ok = self::actualizarAnioBD($pdo, $id, ['nombre' => null, 'fecha_inicio' => null, 'fecha_fin' => null, 'estado' => 'activo']);
      if (!$ok) {
        $pdo->rollBack();
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'message' => 'No se pudo actualizar el estado del año escolar.']);
        return;
      }

      $pdo->commit();

      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $resumen, 'message' => 'Año escolar aperturado y asignaciones creadas.']);
    } catch (Exception $e) {
      if ($pdo && $pdo->inTransaction()) $pdo->rollBack();
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al aperturar año escolar.', 'error_details' => $e->getMessage()]);
    }
  }

  public function obtenerAnio($id)
  {
    try {
      $pdo = Conexion::obtener();
      $dato = self::consultarAnioPorId($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $dato, 'message' => 'Año escolar obtenido.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al obtener año escolar.', 'error_details' => $e->getMessage()]);
    }
  }

  public function actualizarAnio($id)
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);
      if (json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON inválido: ' . json_last_error_msg());

      $data['nombre'] = $this->limpiarTexto($data['nombre'] ?? null);
      $v = $this->crearValidadorAnio($data);
      if (!$v->validate()) {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'errors' => $v->errors()]);
        return;
      }

      $pdo = Conexion::obtener();
      $ok = self::actualizarAnioBD($pdo, $id, $data);
      $actualizado = self::consultarAnioPorId($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $actualizado, 'message' => 'Año escolar actualizado.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al actualizar año escolar.', 'error_details' => $e->getMessage()]);
    }
  }

  public function eliminarAnio($id)
  {
    try {
      $pdo = Conexion::obtener();
      $ok = self::eliminarAnioBD($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => (bool)$ok, 'message' => 'Año escolar eliminado.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al eliminar año escolar.', 'error_details' => $e->getMessage()]);
    }
  }
}
