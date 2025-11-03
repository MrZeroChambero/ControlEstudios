<?php

namespace Micodigo\Personal;

use PDO;
use Exception;
use Valitron\Validator;

class PlantelPersonal
{
    public $id_plantel_personal;
    public $fk_plantel;
    public $fk_personal;
    public $estado;

    public function __construct(array $data = [])
    {
        $this->fk_plantel = $data['fk_plantel'] ?? null;
        $this->fk_personal = $data['fk_personal'] ?? null;
        $this->estado = $data['estado'] ?? null;
    }

    private function _validarDatos(array $data)
    {
        Validator::lang('es');
        $v = new Validator($data, [], 'es');

        $v->rules([
            'required' => [
                ['fk_plantel'],
                ['fk_personal'],
                ['estado']
            ],
            'in' => [
                ['estado', ['solo_cobra', 'solo_trabaja', 'cobra_y_trabaja', 'ninguno']]
            ]
        ]);

        if ($v->validate()) {
            return true;
        } else {
            return $v->errors();
        }
    }

    public function crear(PDO $pdo)
    {
        $data = get_object_vars($this);
        $errores = $this->_validarDatos($data);
        if ($errores !== true) {
            return $errores;
        }

        try {
            $sql = "INSERT INTO plantel_personal (fk_plantel, fk_personal, estado) VALUES (?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $this->fk_plantel,
                $this->fk_personal,
                $this->estado
            ]);
            $this->id_plantel_personal = $pdo->lastInsertId();
            return $this->id_plantel_personal;
        } catch (Exception $e) {
            return false;
        }
    }

    public function actualizar(PDO $pdo)
    {
        if (empty($this->id_plantel_personal)) {
            return ['id_plantel_personal' => ['El ID es requerido para la actualización.']];
        }

        $data = get_object_vars($this);
        $errores = $this->_validarDatos($data);
        if ($errores !== true) {
            return $errores;
        }

        try {
            $sql = "UPDATE plantel_personal SET fk_plantel=?, fk_personal=?, estado=? WHERE id_plantel_personal=?";
            $stmt = $pdo->prepare($sql);
            return $stmt->execute([
                $this->fk_plantel,
                $this->fk_personal,
                $this->estado,
                $this->id_plantel_personal
            ]);
        } catch (Exception $e) {
            return false;
        }
    }

    public static function eliminar(PDO $pdo, $id)
    {
        try {
            $sql = "DELETE FROM plantel_personal WHERE id_plantel_personal=?";
            $stmt = $pdo->prepare($sql);
            return $stmt->execute([$id]);
        } catch (Exception $e) {
            return false;
        }
    }

    public static function consultarPorPersonal(PDO $pdo, $fk_personal)
    {
        try {
            $sql = "SELECT * FROM plantel_personal WHERE fk_personal = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$fk_personal]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return [];
        }
    }
}
