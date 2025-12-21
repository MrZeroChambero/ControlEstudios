<?php

namespace Micodigo\DocumentosAcademicos;

use DateTimeImmutable;
use Micodigo\Persona\Persona;
use PDO;

trait DocumentosAcademicosUtilidadesTrait
{
  private function esDocumentoAcademicoCritico(?string $tipo): bool
  {
    return $this->normalizarTipoDocumentoClave($tipo ?? '') !== null;
  }

  private function normalizarTipoDocumentoClave(string $tipo): ?string
  {
    $valorOriginal = trim($tipo);
    $valor = function_exists('mb_strtolower') ? mb_strtolower($valorOriginal) : strtolower($valorOriginal);
    if ($valor === '') {
      return null;
    }

    if (str_contains($valor, 'prosec')) {
      return 'constancia_prosecucion';
    }

    if (str_contains($valor, 'certificado') && str_contains($valor, 'apr')) {
      return 'certificado_aprendizaje';
    }

    if (str_contains($valor, 'boleta')) {
      return 'boleta_promocion';
    }

    return null;
  }

  private function normalizarGradoCadena(?string $grado): ?int
  {
    if ($grado === null) {
      return null;
    }

    $textoOriginal = trim($grado);
    $texto = function_exists('mb_strtolower') ? mb_strtolower($textoOriginal) : strtolower($textoOriginal);
    if ($texto === '') {
      return null;
    }

    $texto = str_replace(['º', '°', '.', ','], ' ', $texto);
    $texto = preg_replace('/\s+/', ' ', $texto);

    if (str_starts_with($texto, 'educ') || str_starts_with($texto, 'prees')) {
      return 0;
    }

    if (preg_match('/^(\d+)/', $texto, $coincide)) {
      $numero = (int) $coincide[1];
      return ($numero >= 0 && $numero <= 6) ? $numero : null;
    }

    $mapa = [
      'primer' => 1,
      'primero' => 1,
      'segundo' => 2,
      'tercer' => 3,
      'tercero' => 3,
      'cuarto' => 4,
      'quinto' => 5,
      'sexto' => 6,
      '1er' => 1,
      '2do' => 2,
      '3er' => 3,
      '4to' => 4,
      '5to' => 5,
      '6to' => 6,
    ];

    foreach ($mapa as $clave => $numero) {
      if (str_contains($texto, $clave)) {
        return $numero;
      }
    }

    return null;
  }

  private function formatearEtiquetaGrado(?int $grado): ?string
  {
    if ($grado === null) {
      return null;
    }

    $map = [
      0 => 'Educ. Inicial',
      1 => 'Primero',
      2 => 'Segundo',
      3 => 'Tercero',
      4 => 'Cuarto',
      5 => 'Quinto',
      6 => 'Sexto',
    ];

    return $map[$grado] ?? null;
  }

  private function obtenerGradoInscripcionVigente(PDO $pdo, int $estudianteId): ?int
  {
    $sql = 'SELECT gs.grado
            FROM inscripciones i
            INNER JOIN aula a ON a.id_aula = i.fk_aula
            INNER JOIN grado_seccion gs ON gs.id_grado_seccion = a.fk_grado_seccion
            INNER JOIN anios_escolares an ON an.id_anio_escolar = a.fk_anio_escolar
            WHERE i.fk_estudiante = ?
              AND i.estado_inscripcion IN ("activo", "en_proceso")
              AND a.estado = "activo"
              AND an.estado IN ("activo", "incompleto")
            ORDER BY an.fecha_inicio DESC, i.id_inscripcion DESC
            LIMIT 1';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$estudianteId]);
    $grado = $stmt->fetchColumn();

    return $grado !== false ? (int) $grado : null;
  }

  public function estaEntregado(): bool
  {
    return $this->entregado === 'si';
  }

  private function obtenerFechaNacimientoEstudiante(PDO $pdo, int $estudianteId): ?string
  {
    $sql = 'SELECT p.fecha_nacimiento
            FROM estudiantes e
            INNER JOIN personas p ON p.id_persona = e.id_persona
            WHERE e.id_estudiante = ?
            LIMIT 1';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$estudianteId]);
    $fecha = $stmt->fetchColumn();

    return $fecha !== false ? $fecha : null;
  }

  private function obtenerFechaReferenciaAcademica(PDO $pdo): ?DateTimeImmutable
  {
    $sql = 'SELECT fecha_inicio
            FROM anios_escolares
            WHERE estado IN ("activo", "incompleto")
            ORDER BY fecha_inicio DESC
            LIMIT 1';

    $fecha = $pdo->query($sql)?->fetchColumn();
    if ($fecha === false || $fecha === null) {
      return null;
    }

    $fechaReferencia = DateTimeImmutable::createFromFormat('Y-m-d', (string) $fecha);

    return $fechaReferencia ?: null;
  }

  private function calcularGradosPermitidosPorEdad(PDO $pdo, int $estudianteId): array
  {
    $fechaNacimiento = $this->obtenerFechaNacimientoEstudiante($pdo, $estudianteId);
    if ($fechaNacimiento === null || $fechaNacimiento === '') {
      return [];
    }

    $persona = new Persona();
    $referencia = $this->obtenerFechaReferenciaAcademica($pdo) ?? new DateTimeImmutable();

    $permitidos = [];
    for ($grado = 1; $grado <= 6; $grado++) {
      $resultado = $persona->validarEdadPorGrado($fechaNacimiento, $grado, $referencia);
      if ($resultado === true) {
        $permitidos[] = $grado;
      }
    }

    return $permitidos;
  }

  private function calcularGradoMaximoPermitidoPorEdad(PDO $pdo, int $estudianteId): ?int
  {
    $permitidos = $this->calcularGradosPermitidosPorEdad($pdo, $estudianteId);
    return !empty($permitidos) ? max($permitidos) : null;
  }
}
