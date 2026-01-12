<?php

namespace Micodigo\Respaldo;

use Exception;
use Micodigo\Config\Conexion;
use Micodigo\Login\Login;
use Micodigo\Utils\RespuestaJson;

class ControladoraRespaldo
{
  public function listar(): void
  {
    try {
      $modelo = new Respaldo();
      $usuario = $this->obtenerUsuarioAutenticado();
      $respaldos = $modelo->listarRespaldos($usuario['id_usuario'] ?? null);

      $this->enviarRespuestaJson(200, 'exito', 'Respaldos consultados correctamente.', [
        'respaldos' => $respaldos,
      ]);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'No se pudo obtener el listado de respaldos.', null, [
        'detalle' => [$excepcion->getMessage()],
      ]);
    }
  }

  public function crear(): void
  {
    try {
      $usuario = $this->obtenerUsuarioAutenticado();

      if (!$usuario || !isset($usuario['id_usuario'])) {
        $this->enviarRespuestaJson(403, 'error', 'No se pudo identificar al usuario autenticado.');
        return;
      }

      $modelo = new Respaldo();
      $respaldo = $modelo->crearRespaldo((int) $usuario['id_usuario']);

      $this->enviarRespuestaJson(201, 'exito', 'Respaldo generado correctamente.', [
        'respaldo' => $respaldo,
      ]);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'No se pudo generar el respaldo solicitado.', null, [
        'detalle' => [$excepcion->getMessage()],
      ]);
    }
  }

  private function obtenerUsuarioAutenticado(): ?array
  {
    if (!isset($_COOKIE['session_token'])) {
      return null;
    }

    try {
      $pdo = Conexion::obtener();
      $login = new Login($pdo);
      $usuario = $login->obtenerUsuarioPorHash($_COOKIE['session_token']);
      return $usuario ?: null;
    } catch (Exception $e) {
      error_log('[Respaldo] No se pudo obtener el usuario autenticado: ' . $e->getMessage());
      return null;
    }
  }

  public function restaurar(): void
  {
    try {
      $modelo = new Respaldo();
      $resultado = null;

      if (!empty($_FILES['archivo_sql']['tmp_name'] ?? null)) {
        $resultado = $modelo->restaurarDesdeCarga($_FILES['archivo_sql']);
      } else {
        $entrada = $this->obtenerCuerpo();
        $nombre = $entrada['nombre'] ?? ($_POST['nombre'] ?? null);

        if (!$nombre) {
          $this->enviarRespuestaJson(422, 'error', 'Debes indicar el respaldo a restaurar o adjuntar un archivo válido.');
          return;
        }

        $resultado = $modelo->restaurarDesdeNombre($nombre);
      }

      $this->enviarRespuestaJson(200, 'exito', 'La base de datos fue restaurada correctamente.', [
        'respaldo' => $resultado,
      ]);
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(500, 'error', 'No se pudo restaurar la base de datos.', null, [
        'detalle' => [$excepcion->getMessage()],
      ]);
    }
  }

  public function descargar(string $nombre): void
  {
    try {
      $modelo = new Respaldo();
      $ruta = $modelo->rutaRespaldo($nombre);

      if (!is_file($ruta)) {
        throw new Exception('El respaldo solicitado no existe.');
      }

      $tamano = filesize($ruta) ?: 0;

      header('Content-Type: application/sql');
      header('Content-Length: ' . $tamano);
      header('Content-Disposition: attachment; filename="' . $nombre . '"');
      header('Cache-Control: no-store, no-cache, must-revalidate');
      header('Pragma: no-cache');

      readfile($ruta);
      exit;
    } catch (Exception $excepcion) {
      $this->enviarRespuestaJson(404, 'error', 'No se pudo descargar el respaldo solicitado.', null, [
        'detalle' => [$excepcion->getMessage()],
      ]);
    }
  }

  private function obtenerCuerpo(): array
  {
    $contenido = file_get_contents('php://input');
    if (!$contenido) {
      return [];
    }

    $datos = json_decode($contenido, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
      return [];
    }

    return is_array($datos) ? $datos : [];
  }

  private function enviarRespuestaJson(int $codigoHttp, string $estado, string $mensaje, mixed $datos = null, ?array $errores = null): void
  {
    $extra = [
      'estado' => $estado,
      'exito' => $estado === 'exito',
    ];

    if ($estado === 'exito') {
      RespuestaJson::exito($datos, $mensaje, $codigoHttp, $extra);
      return;
    }

    RespuestaJson::error($mensaje, $codigoHttp, $errores, null, $extra);
  }
}
