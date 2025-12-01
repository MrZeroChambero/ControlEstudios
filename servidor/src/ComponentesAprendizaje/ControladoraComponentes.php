<?php

namespace Micodigo\ComponentesAprendizaje;

use Micodigo\Config\Conexion;
use Exception;
use PDOException;

class ControladoraComponentes
{
    public function listar(): void
    {
        try {
            $conexion = Conexion::obtener();
            $modelo = new ComponentesAprendizaje();
            $componentes = $modelo->consultarComponentesCompletos($conexion);
            $this->enviarRespuestaJson(200, 'exito', 'Componentes de aprendizaje consultados correctamente.', $componentes);
        } catch (Exception | PDOException $excepcion) {
            $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al listar los componentes.', null, ['detalle' => [$excepcion->getMessage()]]);
        }
    }

    public function listarSelect(): void
    {
        try {
            $conexion = Conexion::obtener();
            $modelo = new ComponentesAprendizaje();
            $componentes = $modelo->consultarParaSelect($conexion);
            $this->enviarRespuestaJson(200, 'exito', 'Componentes activos obtenidos correctamente.', $componentes);
        } catch (Exception | PDOException $excepcion) {
            $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al obtener los componentes para selección.', null, ['detalle' => [$excepcion->getMessage()]]);
        }
    }

    public function crear(): void
    {
        try {
            $entrada = $this->obtenerEntradaJson();
            $conexion = Conexion::obtener();
            $modelo = new ComponentesAprendizaje($entrada);
            $resultado = $modelo->crear($conexion, $entrada);

            if (isset($resultado['errores'])) {
                $this->enviarRespuestaJson(422, 'error', 'La información enviada no es válida.', null, $resultado['errores']);
                return;
            }

            $this->enviarRespuestaJson(201, 'exito', 'Componente de aprendizaje creado correctamente.', $resultado['datos']);
        } catch (Exception | PDOException $excepcion) {
            $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al registrar el componente.', null, ['detalle' => [$excepcion->getMessage()]]);
        }
    }

    public function actualizar(int $idComponente): void
    {
        try {
            $entrada = $this->obtenerEntradaJson();
            $conexion = Conexion::obtener();
            $modelo = new ComponentesAprendizaje();
            $resultado = $modelo->actualizar($conexion, $idComponente, $entrada);

            if (isset($resultado['errores'])) {
                $codigo = isset($resultado['errores']['id_componente']) ? 404 : 422;
                $this->enviarRespuestaJson($codigo, 'error', 'No fue posible actualizar el componente.', null, $resultado['errores']);
                return;
            }

            $this->enviarRespuestaJson(200, 'exito', 'Componente de aprendizaje actualizado correctamente.', $resultado['datos']);
        } catch (Exception | PDOException $excepcion) {
            $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al actualizar el componente.', null, ['detalle' => [$excepcion->getMessage()]]);
        }
    }

    public function eliminar(int $idComponente): void
    {
        try {
            $conexion = Conexion::obtener();
            $modelo = new ComponentesAprendizaje();
            $resultado = $modelo->eliminar($conexion, $idComponente);

            if (isset($resultado['errores'])) {
                $codigo = isset($resultado['errores']['relaciones']) ? 409 : 404;
                $this->enviarRespuestaJson($codigo, 'error', 'No fue posible eliminar el componente.', null, $resultado['errores']);
                return;
            }

            $this->enviarRespuestaJson(200, 'exito', 'Componente de aprendizaje eliminado correctamente.', $resultado['datos']);
        } catch (Exception | PDOException $excepcion) {
            $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al eliminar el componente.', null, ['detalle' => [$excepcion->getMessage()]]);
        }
    }

    public function cambiarEstado(int $idComponente): void
    {
        try {
            $entrada = $this->obtenerEntradaJson();
            $estadoSolicitado = $entrada['estado_componente'] ?? null;

            $conexion = Conexion::obtener();
            $modelo = new ComponentesAprendizaje();
            $resultado = $modelo->cambiarEstado($conexion, $idComponente, $estadoSolicitado);

            if (isset($resultado['errores'])) {
                $codigo = isset($resultado['errores']['id_componente']) ? 404 : 422;
                $this->enviarRespuestaJson($codigo, 'error', 'No fue posible cambiar el estado del componente.', null, $resultado['errores']);
                return;
            }

            $mensaje = $resultado['datos']['estado_componente'] === 'activo'
                ? 'El componente se activó correctamente.'
                : 'El componente se desactivó correctamente.';

            $this->enviarRespuestaJson(200, 'exito', $mensaje, $resultado['datos']);
        } catch (Exception | PDOException $excepcion) {
            $this->enviarRespuestaJson(500, 'error', 'Ocurrió un problema al cambiar el estado del componente.', null, ['detalle' => [$excepcion->getMessage()]]);
        }
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
