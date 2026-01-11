<?php

namespace Micodigo\ComponentesAprendizaje;

use Micodigo\Config\Conexion;
use Micodigo\Utils\RespuestaJson;
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
            RespuestaJson::exito($componentes, 'Componentes de aprendizaje consultados correctamente.');
        } catch (Exception | PDOException $excepcion) {
            RespuestaJson::error('Ocurrió un problema al listar los componentes.', 500, null, $excepcion);
        }
    }

    public function listarSelect(): void
    {
        try {
            $conexion = Conexion::obtener();
            $modelo = new ComponentesAprendizaje();
            $componentes = $modelo->consultarParaSelect($conexion);
            RespuestaJson::exito($componentes, 'Componentes activos obtenidos correctamente.');
        } catch (Exception | PDOException $excepcion) {
            RespuestaJson::error('Ocurrió un problema al obtener los componentes para selección.', 500, null, $excepcion);
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
                RespuestaJson::error('La información enviada no es válida.', 422, $resultado['errores']);
                return;
            }

            RespuestaJson::exito($resultado['datos'], 'Componente de aprendizaje creado correctamente.', 201);
        } catch (Exception | PDOException $excepcion) {
            RespuestaJson::error('Ocurrió un problema al registrar el componente.', 500, null, $excepcion);
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
                RespuestaJson::error('No fue posible actualizar el componente.', $codigo, $resultado['errores']);
                return;
            }

            RespuestaJson::exito($resultado['datos'], 'Componente de aprendizaje actualizado correctamente.');
        } catch (Exception | PDOException $excepcion) {
            RespuestaJson::error('Ocurrió un problema al actualizar el componente.', 500, null, $excepcion);
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
                RespuestaJson::error('No fue posible eliminar el componente.', $codigo, $resultado['errores']);
                return;
            }

            RespuestaJson::exito($resultado['datos'], 'Componente de aprendizaje eliminado correctamente.');
        } catch (Exception | PDOException $excepcion) {
            RespuestaJson::error('Ocurrió un problema al eliminar el componente.', 500, null, $excepcion);
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
                RespuestaJson::error('No fue posible cambiar el estado del componente.', $codigo, $resultado['errores']);
                return;
            }

            $mensaje = $resultado['datos']['estado_componente'] === 'activo'
                ? 'El componente se activó correctamente.'
                : 'El componente se desactivó correctamente.';

            RespuestaJson::exito($resultado['datos'], $mensaje);
        } catch (Exception | PDOException $excepcion) {
            RespuestaJson::error('Ocurrió un problema al cambiar el estado del componente.', 500, null, $excepcion);
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
}
