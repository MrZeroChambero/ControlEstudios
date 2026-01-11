<?php

namespace Micodigo\RendimientoAcademico;

use PDO;
use RuntimeException;

trait RendimientoAcademicoContextoTrait
{
  protected function obtenerUsuarioSesion(PDO $conexion): array
  {
    $hash = $_COOKIE['session_token'] ?? null;
    if (!$hash) {
      throw new RuntimeException('Sesión no disponible. Inicie sesión nuevamente.');
    }

    $sql = <<<SQL
SELECT
  u.id_usuario,
  u.rol,
  u.fk_personal,
  u.nombre_usuario,
  p.estado AS estado_personal,
  per.primer_nombre,
  per.segundo_nombre,
  per.primer_apellido,
  per.segundo_apellido
FROM sesiones_usuario s
INNER JOIN usuarios u ON u.id_usuario = s.fk_usuario
LEFT JOIN personal p ON p.id_personal = u.fk_personal
LEFT JOIN personas per ON per.id_persona = p.fk_persona
WHERE s.hash_sesion = ?
LIMIT 1
SQL;

    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$hash]);
    $fila = $sentencia->fetch(PDO::FETCH_ASSOC);

    if (!$fila) {
      throw new RuntimeException('Sesión expirada o inválida.');
    }

    $nombreCompleto = $this->construirNombrePersona([
      'primer_nombre' => $fila['primer_nombre'] ?? '',
      'segundo_nombre' => $fila['segundo_nombre'] ?? '',
      'primer_apellido' => $fila['primer_apellido'] ?? '',
      'segundo_apellido' => $fila['segundo_apellido'] ?? '',
    ]);

    $rol = (string) ($fila['rol'] ?? '');

    return [
      'id_usuario' => (int) $fila['id_usuario'],
      'rol' => $rol,
      'rol_normalizado' => strtolower($rol),
      'id_personal' => isset($fila['fk_personal']) ? (int) $fila['fk_personal'] : null,
      'estado_personal' => $fila['estado_personal'] ?? null,
      'nombre_usuario' => $fila['nombre_usuario'] ?? null,
      'nombre_completo' => $nombreCompleto !== '' ? $nombreCompleto : ($fila['nombre_usuario'] ?? null),
    ];
  }

  protected function usuarioEsDirector(array $usuario): bool
  {
    return ($usuario['rol_normalizado'] ?? '') === 'director';
  }

  protected function usuarioEsDocente(array $usuario): bool
  {
    return ($usuario['rol_normalizado'] ?? '') === 'docente';
  }

  protected function usuarioEsSecretario(array $usuario): bool
  {
    return ($usuario['rol_normalizado'] ?? '') === 'secretaria';
  }

  protected function usuarioPuedeSupervisarTodasLasAulas(array $usuario): bool
  {
    return $this->usuarioEsDirector($usuario) || $this->usuarioEsSecretario($usuario);
  }

  protected function obtenerAnioEscolarActivo(PDO $conexion): ?array
  {
    $sql = "SELECT id_anio_escolar, fecha_inicio, fecha_fin, limite_inscripcion, estado\n            FROM anios_escolares\n           WHERE estado = 'activo'\n           ORDER BY id_anio_escolar DESC\n           LIMIT 1";

    $fila = $conexion->query($sql)->fetch(PDO::FETCH_ASSOC);
    return $fila ? $this->normalizarAnioEscolar($fila) : null;
  }

  protected function obtenerAnioPorId(PDO $conexion, int $anioId): ?array
  {
    $sql = "SELECT id_anio_escolar, fecha_inicio, fecha_fin, limite_inscripcion, estado\n            FROM anios_escolares\n           WHERE id_anio_escolar = ?\n           LIMIT 1";
    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$anioId]);
    $fila = $sentencia->fetch(PDO::FETCH_ASSOC);

    return $fila ? $this->normalizarAnioEscolar($fila) : null;
  }

  protected function normalizarAnioEscolar(array $fila): array
  {
    return [
      'id_anio_escolar' => (int) $fila['id_anio_escolar'],
      'fecha_inicio' => $fila['fecha_inicio'] ?? null,
      'fecha_fin' => $fila['fecha_fin'] ?? null,
      'limite_inscripcion' => $fila['limite_inscripcion'] ?? null,
      'estado' => $fila['estado'] ?? null,
    ];
  }

  protected function obtenerMomentoActivo(PDO $conexion, int $anioId): ?array
  {
    $sql = "SELECT id_momento, fk_anio_escolar, nombre_momento, fecha_inicio, fecha_fin, estado_momento\n            FROM momentos\n           WHERE fk_anio_escolar = ? AND estado_momento = 'activo'\n           ORDER BY id_momento DESC\n           LIMIT 1";
    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$anioId]);
    $fila = $sentencia->fetch(PDO::FETCH_ASSOC);

    return $fila ? $this->normalizarMomento($fila) : null;
  }

  protected function obtenerMomentoPorId(PDO $conexion, int $momentoId): ?array
  {
    $sql = "SELECT id_momento, fk_anio_escolar, nombre_momento, fecha_inicio, fecha_fin, estado_momento\n            FROM momentos\n           WHERE id_momento = ?\n           LIMIT 1";
    $sentencia = $conexion->prepare($sql);
    $sentencia->execute([$momentoId]);
    $fila = $sentencia->fetch(PDO::FETCH_ASSOC);

    return $fila ? $this->normalizarMomento($fila) : null;
  }

  protected function normalizarMomento(array $fila): array
  {
    return [
      'id_momento' => (int) $fila['id_momento'],
      'fk_anio_escolar' => (int) $fila['fk_anio_escolar'],
      'nombre_momento' => $fila['nombre_momento'] ?? null,
      'fecha_inicio' => $fila['fecha_inicio'] ?? null,
      'fecha_fin' => $fila['fecha_fin'] ?? null,
      'estado_momento' => $fila['estado_momento'] ?? null,
    ];
  }

  protected function construirContextoOperativo(PDO $conexion, ?int $momentoId = null, ?int $anioId = null): array
  {
    $usuario = $this->obtenerUsuarioSesion($conexion);

    $anio = null;
    if ($anioId !== null) {
      $anio = $this->obtenerAnioPorId($conexion, $anioId);
      if ($anio === null) {
        throw new RuntimeException('El año escolar seleccionado no existe.');
      }
    } else {
      $anio = $this->obtenerAnioEscolarActivo($conexion);
    }

    $momento = null;
    if ($momentoId !== null) {
      $momento = $this->obtenerMomentoPorId($conexion, $momentoId);
      if ($momento === null) {
        throw new RuntimeException('El momento escolar indicado no existe.');
      }
      if ($anio !== null && (int) $momento['fk_anio_escolar'] !== (int) $anio['id_anio_escolar']) {
        throw new RuntimeException('El momento escolar no pertenece al año seleccionado.');
      }
      if ($momento['estado_momento'] !== 'activo') {
        throw new RuntimeException('El momento escolar indicado no está activo para evaluaciones.');
      }
      if ($anio === null) {
        $anio = $this->obtenerAnioPorId($conexion, (int) $momento['fk_anio_escolar']);
      }
    } elseif ($anio !== null) {
      $momento = $this->obtenerMomentoActivo($conexion, (int) $anio['id_anio_escolar']);
    }

    return [
      'usuario' => $usuario,
      'anio' => $anio,
      'momento' => $momento,
    ];
  }

  protected function asegurarContextoValido(array $contexto): void
  {
    if (empty($contexto['anio'])) {
      throw new RuntimeException('No existe un año escolar activo configurado.');
    }

    if (empty($contexto['momento'])) {
      throw new RuntimeException('No existe un momento escolar activo para el año vigente.');
    }
  }

  protected function construirNombrePersona(array $datos): string
  {
    $partes = [
      $datos['primer_nombre'] ?? '',
      $datos['segundo_nombre'] ?? '',
      $datos['primer_apellido'] ?? '',
      $datos['segundo_apellido'] ?? '',
    ];

    $partes = array_filter(array_map('trim', $partes), static fn($valor) => $valor !== '');
    if (!$partes) {
      return '';
    }

    return preg_replace('/\s+/', ' ', implode(' ', $partes));
  }
}
