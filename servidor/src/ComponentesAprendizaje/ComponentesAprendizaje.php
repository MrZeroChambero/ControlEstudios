<?php

namespace Micodigo\ComponentesAprendizaje;

use Micodigo\Config\Conexion;
use Valitron\Validator;
use Exception;
use PDO;

class ComponentesAprendizaje
{
    public $id_componente;
    public $nombre_componente;
    public $estado;

    public function __construct(string $nombre_componente, string $estado = 'activo')
    {
        $this->nombre_componente = $nombre_componente;
        $this->estado = 'activo';
    }

    public function crear(PDO $pdo): int|false
    {
        try {
            $sql = "INSERT INTO componentes_aprendizaje (nombre_componente, estado) VALUES (?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$this->nombre_componente, $this->estado]);

            return (int)$pdo->lastInsertId();
        } catch (Exception $e) {
            echo $e->getMessage();
            return false;
        }
    }

    public function actualizar(PDO $pdo): bool
    {
        if (empty($this->id_componente)) {
            return false;
        }

        try {
            $sql = "UPDATE componentes_aprendizaje SET nombre_componente = ? WHERE id_componente = ?";
            $stmt = $pdo->prepare($sql);
            return $stmt->execute([$this->nombre_componente, $this->id_componente]);
        } catch (Exception $e) {
            return false;
        }
    }

    public static function eliminar(PDO $pdo, int $id): bool
    {
        try {
            $sql = "DELETE FROM componentes_aprendizaje WHERE id_componente = ?";
            $stmt = $pdo->prepare($sql);
            return $stmt->execute([$id]);
        } catch (Exception $e) {
            return false;
        }
    }

    public static function consultarTodos(PDO $pdo): array
    {
        try {
            $sql = "SELECT id_componente, nombre_componente, estado FROM componentes_aprendizaje";
            $stmt = $pdo->query($sql);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw $e;
        }
    }
    public static function consultarSelect(PDO $pdo): array
    {
        try {
            $sql = "SELECT id_componente, nombre_componente, estado FROM componentes_aprendizaje where estado='activo' order by nombre_componente";
            $stmt = $pdo->query($sql);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw $e;
        }
    }

    public static function consultar(PDO $pdo, int $id)
    {
        try {
            $sql = "SELECT * FROM componentes_aprendizaje WHERE id_componente = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return false;
        }
    }

    public static function consultarActualizar(PDO $pdo, $id)
    {
        try {
            $sql = "SELECT * FROM componentes_aprendizaje WHERE id_componente = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$id]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($data) {
                $componente = new self(
                    $data['nombre_componente'],
                    $data['estado']
                );
                $componente->id_componente = $data['id_componente'];
                return $componente;
            }
            return false;
        } catch (Exception $e) {
            return false;
        }
    }

    public static function verificarID(PDO $pdo, int $id): bool
    {
        try {
            $sql = "SELECT COUNT(*) FROM componentes_aprendizaje WHERE id_componente = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$id]);
            return $stmt->fetchColumn() > 0;
        } catch (Exception $e) {
            return false;
        }
    }

    public static function cambiarEstado(PDO $pdo, int $id): bool
    {
        try {
            $sql = "UPDATE componentes_aprendizaje SET estado = !estado WHERE id_componente = ?";
            $stmt = $pdo->prepare($sql);
            return $stmt->execute([$id]);
        } catch (Exception $e) {
            return false;
        }
    }
}
