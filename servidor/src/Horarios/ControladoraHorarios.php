<?php

namespace Micodigo\Horarios;

use Micodigo\Config\Conexion;
use Micodigo\Login\Login;
use PDO;
use Exception;
use PDOException;

require_once __DIR__ . '/Horarios.php';

class ControladoraHorarios
{
  public function listar(): void
  {
    try {
      $conexion = Conexion::obtener();
      $modelo = new Horarios();

      $criterios = [
        'fk_aula' => isset($_GET['fk_aula']) ? (int) $_GET['fk_aula'] : null,
        'fk_momento' => isset($_GET['fk_momento']) ? (int) $_GET['fk_momento'] : null,
        'dia_semana' => isset($_GET['dia_semana']) ? strtolower((string) $_GET['dia_semana']) : null,
      ];

      $resultado = $modelo->listar($conexion, $criterios);
      $this->enviarRespuestaJson(200, 'exito', 'Horarios consultados correctamente.', $resultado['datos']);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'No fue posible listar los horarios.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function catalogos(): void
  {
    try {
      $conexion = Conexion::obtener();
      $modelo = new Horarios();

      $opciones = [
        'fk_anio_escolar' => isset($_GET['fk_anio_escolar']) ? (int) $_GET['fk_anio_escolar'] : null,
        'fk_aula' => isset($_GET['fk_aula']) ? (int) $_GET['fk_aula'] : null,
      ];

      $resultado = $modelo->obtenerCatalogos($conexion, $opciones);
      $this->enviarRespuestaJson(200, 'exito', 'Catálogos obtenidos correctamente.', $resultado['datos']);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'No fue posible obtener los catálogos de horarios.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function crear(): void
  {
    try {
      $conexion = Conexion::obtener();
      $datos = $this->obtenerEntradaJson();
      $usuario = $this->obtenerUsuarioSesion($conexion);

      $modelo = new Horarios($datos);
      $resultado = $modelo->crear($conexion, $datos, ['rol' => $usuario['rol'] ?? '']);

      if (isset($resultado['errores'])) {
        $this->enviarRespuestaJson(422, 'error', 'Los datos enviados no son válidos.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(201, 'exito', 'Horario registrado correctamente.', $resultado['datos']);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'No fue posible registrar el horario.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function actualizar(int $idHorario): void
  {
    try {
      $conexion = Conexion::obtener();
      $datos = $this->obtenerEntradaJson();
      $usuario = $this->obtenerUsuarioSesion($conexion);

      $modelo = new Horarios();
      $resultado = $modelo->actualizar($conexion, $idHorario, $datos, ['rol' => $usuario['rol'] ?? '']);

      if (isset($resultado['errores'])) {
        $codigo = isset($resultado['errores']['id_horario']) ? 404 : 422;
        $this->enviarRespuestaJson($codigo, 'error', 'No fue posible actualizar el horario.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(200, 'exito', 'Horario actualizado correctamente.', $resultado['datos']);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'No fue posible actualizar el horario.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function eliminar(int $idHorario): void
  {
    try {
      $conexion = Conexion::obtener();
      $modelo = new Horarios();
      $resultado = $modelo->eliminar($conexion, $idHorario);

      if (isset($resultado['errores'])) {
        $this->enviarRespuestaJson(404, 'error', 'No fue posible eliminar el horario.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(200, 'exito', 'Horario eliminado correctamente.', $resultado['datos']);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'No fue posible eliminar el horario.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  public function sincronizarSubgrupo(int $idHorario): void
  {
    try {
      $conexion = Conexion::obtener();
      $datos = $this->obtenerEntradaJson();
      $usuario = $this->obtenerUsuarioSesion($conexion);

      $estudiantes = $datos['estudiantes'] ?? [];

      $modelo = new Horarios();
      $resultado = $modelo->sincronizarSubgrupo($conexion, $idHorario, $estudiantes, ['rol' => $usuario['rol'] ?? '']);

      if (isset($resultado['errores'])) {
        $codigo = isset($resultado['errores']['id_horario']) ? 404 : 422;
        $this->enviarRespuestaJson($codigo, 'error', 'No fue posible actualizar el subgrupo.', null, $resultado['errores']);
        return;
      }

      $this->enviarRespuestaJson(200, 'exito', 'Subgrupo actualizado correctamente.', $resultado['datos']);
    } catch (Exception | PDOException $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'No fue posible sincronizar el subgrupo.', null, ['detalle' => [$excepcion->getMessage()]]);
    }
  }

  private function obtenerUsuarioSesion(PDO $conexion): array
  {
    $token = $_COOKIE['session_token'] ?? null;
    if (!$token) {
      throw new Exception('Sesión no disponible.');
    }

    $login = new Login($conexion);
    $usuario = $login->obtenerUsuarioPorHash($token);

    if (!$usuario) {
      throw new Exception('No se pudo validar la sesión del usuario.');
    }

    return $usuario;
  }

  private function obtenerEntradaJson(): array
  {
    $cuerpo = file_get_contents('php://input');
    if ($cuerpo === false || $cuerpo === '') {
      return [];
    }

    $datos = json_decode($cuerpo, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
      throw new Exception('El cuerpo de la solicitud contiene JSON inválido: ' . json_last_error_msg());
    }

    return is_array($datos) ? $datos : [];
  }

  private function enviarRespuestaJson(int $codigoHttp, string $estado, string $mensaje, mixed $datos = null, ?array $errores = null): void
  {
    http_response_code($codigoHttp);
    header('Content-Type: application/json; charset=utf-8');

    $respuesta = [
      'estado' => $estado,
      'exito' => $estado === 'exito',
      'mensaje' => $mensaje,
    ];

    if ($datos !== null) {
      $respuesta['datos'] = $datos;
    }

    if ($errores !== null) {
      $respuesta['errores'] = $errores;
    }

    echo json_encode($respuesta, JSON_UNESCAPED_UNICODE);
  }
}
