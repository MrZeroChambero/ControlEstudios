<?php

namespace Micodigo\ComponentesAprendizaje;

use Micodigo\Config\Conexion;
use Valitron\Validator;
use Exception;

class ControladoraComponentes
{

    public function __construct()
    {
        Validator::lang('es');
    }

    private function addUniqueRule(Validator $v, string $field, string $table, string $column, ?int $ignoreId = null)
    {
        $v->addRule('unique', function ($field, $value, array $params) use ($table, $column, $ignoreId) {
            $pdo = Conexion::obtener();
            $sql = "SELECT COUNT(*) FROM {$table} WHERE {$column} = ?";
            $bindings = [$value];

            if ($ignoreId !== null) {
                $sql .= " AND id_componente != ?";
                $bindings[] = $ignoreId;
            }

            $stmt = $pdo->prepare($sql);
            $stmt->execute($bindings);
            return $stmt->fetchColumn() == 0;
        }, 'ya está en uso.');
    }

    public function listar()
    {
        try {
            $pdo = Conexion::obtener();
            $componentes = ComponentesAprendizaje::consultarTodos($pdo);
            header('Content-Type: application/json');
            echo json_encode(['back' => true, 'data' => $componentes, 'message' => 'Componentes de aprendizaje obtenidos exitosamente.']);
        } catch (Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['back' => false, 'message' => 'Error al obtener los componentes de aprendizaje.']);
        }
    }
    public function listar_select()
    {
        try {
            $pdo = Conexion::obtener();
            $componentes = ComponentesAprendizaje::consultarSelect($pdo);
            header('Content-Type: application/json');
            echo json_encode(['back' => true, 'data' => $componentes, 'message' => 'Componentes de aprendizaje obtenidos exitosamente.']);
        } catch (Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['back' => false, 'message' => 'Error al obtener los componentes de aprendizaje.']);
        }
    }
    

    public function crear()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        $v = new Validator($data);
        $this->addUniqueRule($v, 'nombre_componente', 'componentes_aprendizaje', 'nombre_componente');
        $v->rule('required', 'nombre_componente')->message('El nombre del componente es requerido');
        $v->rule('lengthMax', 'nombre_componente', 100)->message('El nombre del componente no debe exceder los 100 caracteres');

        if ($v->validate()) {
            try {
                $pdo = Conexion::obtener();
                $componente = new ComponentesAprendizaje($data['nombre_componente']);
                $id = $componente->crear($pdo);

                if ($id) {
                    http_response_code(201);
                    $componente->id_componente = $id;
                    header('Content-Type: application/json');
                    echo json_encode(['back' => true, 'data' => $componente, 'message' => 'Componente de aprendizaje creado exitosamente.']);
                } else {
                    http_response_code(500);
                    header('Content-Type: application/json');
                    echo json_encode(['back' => false, 'message' => 'Error al crear el componente de aprendizaje.']);
                }
            } catch (Exception $e) {
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode(['back' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(['back' => false, 'errors' => $v->errors(), 'message' => 'Datos inválidos.']);
        }
    }

    public function actualizar($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        $v = new Validator($data);
        $this->addUniqueRule($v, 'nombre_componente', 'componentes_aprendizaje', 'nombre_componente', $id);
        $v->rule('required', 'nombre_componente')->message('El nombre del componente es requerido');
        $v->rule('lengthMax', 'nombre_componente', 100)->message('El nombre del componente no debe exceder los 100 caracteres');

        if ($v->validate()) {
            try {
                $pdo = Conexion::obtener();
                $componente = ComponentesAprendizaje::consultarActualizar($pdo, $id);

                if ($componente) {
                    $componente->nombre_componente = $data['nombre_componente'];
                    if ($componente->actualizar($pdo)) {
                        header('Content-Type: application/json');
                        echo json_encode(['back' => true, 'data' => $componente, 'message' => 'Componente de aprendizaje actualizado exitosamente.']);
                    } else {
                        http_response_code(500);
                        header('Content-Type: application/json');
                        echo json_encode(['back' => false, 'message' => 'Error al actualizar el componente de aprendizaje.']);
                    }
                } else {
                    http_response_code(404);
                    header('Content-Type: application/json');
                    echo json_encode(['back' => false, 'message' => 'Componente de aprendizaje no encontrado.']);
                }
            } catch (Exception $e) {
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode(['back' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(['back' => false, 'errors' => $v->errors(), 'message' => 'Datos inválidos.']);
        }
    }

    public function eliminar($id)
    {
        try {
            $pdo = Conexion::obtener();
            if (ComponentesAprendizaje::eliminar($pdo, $id)) {
                header('Content-Type: application/json');
                echo json_encode(['back' => true, 'message' => 'Componente de aprendizaje eliminado exitosamente.']);
            } else {
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode(['back' => false, 'message' => 'Error al eliminar el componente de aprendizaje.']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['back' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
        }
    }

    public function cambiarEstado($id)
    {
        try {
            $pdo = Conexion::obtener();
            if (ComponentesAprendizaje::cambiarEstado($pdo, $id)) {
                header('Content-Type: application/json');
                echo json_encode(['back' => true, 'message' => 'Estado del componente de aprendizaje cambiado exitosamente.']);
            } else {
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode(['back' => false, 'message' => 'Error al cambiar el estado del componente de aprendizaje.']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['back' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
        }
    }
}
