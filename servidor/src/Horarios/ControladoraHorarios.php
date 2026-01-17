<?php

namespace Micodigo\Horarios;

use Micodigo\Config\Conexion;
use Micodigo\Login\Login;
use Micodigo\Utils\RespuestaJson;
use PDO;
use Exception;
use PDOException;
use const Micodigo\Horarios\Config\BLOQUES_HORARIO;
use const Micodigo\Horarios\Config\BLOQUES_DEPENDENCIAS;
use const Micodigo\Horarios\Config\BLOQUES_CLASE;

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
      RespuestaJson::exito($resultado['datos'], 'Horarios consultados correctamente.');
    } catch (Exception | PDOException $excepcion) {
      RespuestaJson::error('No fue posible listar los horarios.', 500, null, $excepcion);
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
        'fk_momento' => isset($_GET['fk_momento']) ? (int) $_GET['fk_momento'] : null,
        'fk_componente' => isset($_GET['fk_componente']) ? (int) $_GET['fk_componente'] : null,
        'fk_personal' => isset($_GET['fk_personal']) ? (int) $_GET['fk_personal'] : null,
      ];

      $resultado = $modelo->obtenerCatalogos($conexion, $opciones);
      RespuestaJson::exito($resultado['datos'], 'Catálogos obtenidos correctamente.');
    } catch (Exception | PDOException $excepcion) {
      RespuestaJson::error('No fue posible obtener los catálogos de horarios.', 500, null, $excepcion);
    }
  }

  public function bloques(): void
  {
    try {
      $datos = [
        'bloques' => BLOQUES_HORARIO,
        'dependencias' => BLOQUES_DEPENDENCIAS,
        'bloques_clase' => BLOQUES_CLASE,
      ];
      RespuestaJson::exito($datos, 'Bloques de horario obtenidos correctamente.');
    } catch (Exception $excepcion) {
      RespuestaJson::error('No fue posible obtener los bloques de horario.', 500, null, $excepcion);
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
        RespuestaJson::error('Los datos enviados no son válidos.', 422, $resultado['errores']);
        return;
      }

      RespuestaJson::exito($resultado['datos'], 'Horario registrado correctamente.', 201);
    } catch (Exception | PDOException $excepcion) {
      RespuestaJson::error('No fue posible registrar el horario.', 500, null, $excepcion);
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
        RespuestaJson::error('No fue posible actualizar el horario.', $codigo, $resultado['errores']);
        return;
      }

      RespuestaJson::exito($resultado['datos'], 'Horario actualizado correctamente.');
    } catch (Exception | PDOException $excepcion) {
      RespuestaJson::error('No fue posible actualizar el horario.', 500, null, $excepcion);
    }
  }

  public function eliminar(int $idHorario): void
  {
    try {
      $conexion = Conexion::obtener();
      $modelo = new Horarios();
      $resultado = $modelo->eliminar($conexion, $idHorario);

      if (isset($resultado['errores'])) {
        RespuestaJson::error('No fue posible eliminar el horario.', 404, $resultado['errores']);
        return;
      }

      RespuestaJson::exito($resultado['datos'], 'Horario eliminado correctamente.');
    } catch (Exception | PDOException $excepcion) {
      RespuestaJson::error('No fue posible eliminar el horario.', 500, null, $excepcion);
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
        RespuestaJson::error('No fue posible actualizar el subgrupo.', $codigo, $resultado['errores']);
        return;
      }

      RespuestaJson::exito($resultado['datos'], 'Subgrupo actualizado correctamente.');
    } catch (Exception | PDOException $excepcion) {
      RespuestaJson::error('No fue posible sincronizar el subgrupo.', 500, null, $excepcion);
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
}
