<?php

namespace Micodigo\Aula;

use Micodigo\Config\Conexion;
use Exception;
use RuntimeException;

trait OperacionesControladorAula
{
  public function obtenerResumenAulas()
  {
    try {
      $conexion = Conexion::obtener();
      $anio = $this->obtenerAnioActivoOIncompleto($conexion);
      $catalogo = $this->obtenerCatalogoGrados($conexion);

      $anioId = $anio['id_anio_escolar'] ?? null;
      $resumen = $this->construirResumenAulas($conexion, $anioId ? (int) $anioId : null, $catalogo);

      $mensaje = $resumen['anio'] !== null
        ? 'Resumen de aulas obtenido correctamente.'
        : 'No hay un anio escolar activo o incompleto. Configure uno antes de aperturar las secciones.';

      $this->enviarRespuestaJson(200, true, $mensaje, $resumen);
    } catch (RuntimeException $excepcion) {
      $this->enviarRespuestaJson(409, false, $excepcion->getMessage(), null);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'No se pudo obtener la informacion de las aulas.', null);
    }
  }

  public function aperturarAulas()
  {
    try {
      $entrada = $this->leerEntradaJson();
      $this->validarEntradaGeneral($entrada);

      $conexion = Conexion::obtener();
      $catalogo = $this->obtenerCatalogoGrados($conexion);

      $anioSolicitado = isset($entrada['anio_id']) ? (int) $entrada['anio_id'] : null;
      $anio = $anioSolicitado
        ? $this->obtenerAnioPorId($conexion, $anioSolicitado)
        : $this->obtenerAnioActivoOIncompleto($conexion);

      $this->asegurarAnioDisponible($anio);
      $anioId = (int) $anio['id_anio_escolar'];

      $validacion = $this->validarConfiguracionSecciones($entrada['configuracion'] ?? [], $catalogo);

      if (!$validacion['valido']) {
        $this->enviarRespuestaJson(
          422,
          false,
          'La configuracion proporcionada contiene errores.',
          null,
          $validacion['errores'] ?? []
        );
        return;
      }

      $this->sincronizarAulasConConfiguracion($conexion, $anioId, $validacion['datos'], $catalogo);

      $resumen = $this->construirResumenAulas($conexion, $anioId, $catalogo);
      $this->enviarRespuestaJson(200, true, 'Secciones habilitadas correctamente.', $resumen);
    } catch (RuntimeException $excepcion) {
      $this->enviarRespuestaJson(422, false, $excepcion->getMessage(), null);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'No fue posible aperturar las aulas solicitadas.', null);
    }
  }

  public function actualizarCuposAula($id)
  {
    try {
      $entrada = $this->leerEntradaJson();
      $validacion = $this->validarCuposAula($entrada['cupos'] ?? null);

      if (!$validacion['valido']) {
        $this->enviarRespuestaJson(422, false, 'El valor de cupos no es valido.', null, $validacion['errores'] ?? []);
        return;
      }

      $conexion = Conexion::obtener();
      $aula = $this->obtenerAulaPorId($conexion, (int) $id);

      if ($aula === null) {
        $this->enviarRespuestaJson(404, false, 'El aula especificada no existe.', null);
        return;
      }

      $this->aplicarActualizacionCupos($conexion, (int) $id, $validacion['valor']);

      $catalogo = $this->obtenerCatalogoGrados($conexion);
      $resumen = $this->construirResumenAulas($conexion, $aula['fk_anio_escolar'], $catalogo);

      $this->enviarRespuestaJson(200, true, 'Cupos actualizados correctamente.', $resumen);
    } catch (RuntimeException $excepcion) {
      $this->enviarRespuestaJson(422, false, $excepcion->getMessage(), null);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'No fue posible actualizar los cupos del aula.', null);
    }
  }

  public function listarAulas()
  {
    try {
      $pdo = Conexion::obtener();
      $aulas = self::consultarTodasLasAulas($pdo);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $aulas, 'message' => 'Aulas obtenidas exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al listar aulas.', 'error_details' => $e->getMessage()]);
    }
  }

  public function listarAulasSelect()
  {
    try {
      $pdo = Conexion::obtener();
      $aulas = self::consultarAulasParaSelect($pdo);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $aulas, 'message' => 'Aulas para select obtenidas exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al listar aulas para select.', 'error_details' => $e->getMessage()]);
    }
  }

  public function crearAula()
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);
      if (json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON invalido: ' . json_last_error_msg());

      $data['nombre'] = $this->limpiarTexto($data['nombre'] ?? null);
      $v = $this->crearValidadorAula($data);
      if (!$v->validate()) {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'errors' => $v->errors()]);
        return;
      }

      $pdo = Conexion::obtener();
      $id = self::crearAulaBD($pdo, $data);
      $nueva = self::consultarAulaPorId($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $nueva, 'message' => 'Aula creada exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al crear aula.', 'error_details' => $e->getMessage()]);
    }
  }

  public function obtenerAula($id)
  {
    try {
      $pdo = Conexion::obtener();
      $aula = self::consultarAulaPorId($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $aula, 'message' => 'Aula obtenida exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al obtener aula.', 'error_details' => $e->getMessage()]);
    }
  }

  public function actualizarAula($id)
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);
      if (json_last_error() !== JSON_ERROR_NONE) throw new Exception('JSON invalido: ' . json_last_error_msg());

      $data['nombre'] = $this->limpiarTexto($data['nombre'] ?? null);
      $v = $this->crearValidadorAula($data);
      if (!$v->validate()) {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode(['back' => false, 'errors' => $v->errors()]);
        return;
      }

      $pdo = Conexion::obtener();
      $ok = self::actualizarAulaBD($pdo, $id, $data);
      $actualizada = self::consultarAulaPorId($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => true, 'data' => $actualizada, 'message' => 'Aula actualizada exitosamente.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al actualizar aula.', 'error_details' => $e->getMessage()]);
    }
  }

  public function cambiarEstadoAula($id)
  {
    try {
      $entrada = $this->leerEntradaJson();
      $validacion = $this->validarEstadoDeseado($entrada['estado'] ?? null);

      if (!$validacion['valido']) {
        $this->enviarRespuestaJson(422, false, 'El estado solicitado no es valido.', null, $validacion['errores'] ?? []);
        return;
      }

      $conexion = Conexion::obtener();
      $aula = $this->verificarReglasCambioEstado($conexion, (int) $id, $validacion['valor']);

      $this->aplicarCambioEstado($conexion, (int) $id, $validacion['valor']);

      $catalogo = $this->obtenerCatalogoGrados($conexion);
      $resumen = $this->construirResumenAulas($conexion, $aula['fk_anio_escolar'], $catalogo);

      $mensaje = $validacion['valor'] === 'activo'
        ? 'Aula activada correctamente.'
        : 'Aula desactivada correctamente.';

      $this->enviarRespuestaJson(200, true, $mensaje, $resumen);
    } catch (RuntimeException $excepcion) {
      $this->enviarRespuestaJson(422, false, $excepcion->getMessage(), null);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'No se pudo actualizar el estado del aula.', null);
    }
  }

  public function eliminarAula($id)
  {
    try {
      $pdo = Conexion::obtener();
      $ok = self::eliminarAulaBD($pdo, $id);
      header('Content-Type: application/json');
      echo json_encode(['back' => (bool)$ok, 'message' => 'Aula eliminada.']);
    } catch (Exception $e) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['back' => false, 'message' => 'Error al eliminar aula.', 'error_details' => $e->getMessage()]);
    }
  }

  public function obtenerGestionDocentes()
  {
    try {
      $conexion = Conexion::obtener();
      $resumen = $this->obtenerResumenGestionGeneral($conexion);
      $mensaje = $resumen['anio'] !== null
        ? 'Resumen de asignaciones obtenido correctamente.'
        : 'No existe un año escolar activo o incompleto. Configure uno para gestionar las asignaciones.';

      $this->enviarRespuestaJson(200, true, $mensaje, $resumen);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'No fue posible obtener la gestion de aulas.', null);
    }
  }

  public function asignarDocenteTitular($id)
  {
    try {
      $entrada = $this->leerEntradaJson();
      $conexion = Conexion::obtener();

      $this->registrarDocenteTitular($conexion, (int) $id, $entrada);
      $resumen = $this->obtenerResumenGestionGeneral($conexion);

      $this->enviarRespuestaJson(200, true, 'Docente titular asignado correctamente.', $resumen);
    } catch (RuntimeException $excepcion) {
      $errores = $this->decodificarErrores($excepcion->getMessage());
      if ($errores !== null) {
        $this->enviarRespuestaJson(422, false, 'La informacion enviada no es valida.', null, $errores);
        return;
      }

      $this->enviarRespuestaJson(409, false, $excepcion->getMessage(), null);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'No fue posible asignar el docente titular.', null);
    }
  }

  public function eliminarDocenteTitular($id)
  {
    try {
      $conexion = Conexion::obtener();
      $this->eliminarDocenteTitularAsignacion($conexion, (int) $id);
      $resumen = $this->obtenerResumenGestionGeneral($conexion);

      $this->enviarRespuestaJson(200, true, 'Docente titular removido correctamente.', $resumen);
    } catch (RuntimeException $excepcion) {
      $this->enviarRespuestaJson(404, false, $excepcion->getMessage(), null);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'No fue posible remover el docente titular.', null);
    }
  }

  public function asignarEspecialista($id)
  {
    try {
      $entrada = $this->leerEntradaJson();
      $conexion = Conexion::obtener();

      $this->registrarEspecialista($conexion, (int) $id, $entrada);
      $resumen = $this->obtenerResumenGestionGeneral($conexion);

      $this->enviarRespuestaJson(200, true, 'Especialista asignado correctamente.', $resumen);
    } catch (RuntimeException $excepcion) {
      $errores = $this->decodificarErrores($excepcion->getMessage());
      if ($errores !== null) {
        $this->enviarRespuestaJson(422, false, 'La informacion enviada no es valida.', null, $errores);
        return;
      }

      $this->enviarRespuestaJson(409, false, $excepcion->getMessage(), null);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'No fue posible asignar el especialista.', null);
    }
  }

  public function eliminarEspecialista($id, $componenteId)
  {
    try {
      $conexion = Conexion::obtener();
      $this->eliminarEspecialistaAsignacion($conexion, (int) $id, (int) $componenteId);
      $resumen = $this->obtenerResumenGestionGeneral($conexion);

      $this->enviarRespuestaJson(200, true, 'Especialista removido correctamente.', $resumen);
    } catch (RuntimeException $excepcion) {
      $this->enviarRespuestaJson(404, false, $excepcion->getMessage(), null);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, false, 'No fue posible remover el especialista asignado.', null);
    }
  }

  private function decodificarErrores(string $mensaje): ?array
  {
    $decodificado = json_decode($mensaje, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($decodificado)) {
      return null;
    }

    return $decodificado;
  }
}
