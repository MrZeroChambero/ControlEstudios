<?php

namespace Micodigo\DocumentosAcademicos;

use Valitron\Validator;
use PDO;

trait DocumentosAcademicosValidacionesTrait
{
  private function validar(PDO $pdo)
  {
    if (is_string($this->tipo_documento)) {
      $this->tipo_documento = trim($this->tipo_documento);
    }
    if (is_string($this->grado)) {
      $this->grado = trim($this->grado);
    }
    if ($this->grado === '') {
      $this->grado = null;
    }

    $v = new Validator([
      'fk_estudiante' => $this->fk_estudiante,
      'tipo_documento' => $this->tipo_documento,
      'grado' => $this->grado,
      'entregado' => $this->entregado,
    ]);
    $v->rules([
      'required' => [['fk_estudiante'], ['tipo_documento']],
      'integer' => [['fk_estudiante']],
      'in' => [[
        'tipo_documento',
        [
          'Tarjeta Vacunación',
          'Carta Residencia',
          'Partida Nacimiento',
          'Constancia Act. Extracurricular',
          'Boleta',
          'Constancia Prosecución',
          'Certificado Aprendizaje',
        ],
      ], ['entregado', ['si', 'no']], ['grado', ['Educ. Inicial', 'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto', null]]],
    ]);
    if (!$v->validate()) return $v->errors();
    $st = $pdo->prepare('SELECT id_estudiante FROM estudiantes WHERE id_estudiante=?');
    $st->execute([$this->fk_estudiante]);
    if (!$st->fetch()) return ['fk_estudiante' => ['Estudiante no existe']];

    $gradoNormalizado = $this->normalizarGradoCadena($this->grado);
    if ($gradoNormalizado !== null && $gradoNormalizado >= 1) {
      $gradosPermitidosEdad = $this->calcularGradosPermitidosPorEdad($pdo, (int) $this->fk_estudiante);
      if (empty($gradosPermitidosEdad)) {
        return ['grado' => ['No se puede asociar un grado porque no fue posible determinar los grados permitidos según la edad registrada del estudiante. Verifique la fecha de nacimiento y el año escolar activo.']];
      }

      if (!in_array($gradoNormalizado, $gradosPermitidosEdad, true)) {
        $etiquetaSolicitada = $this->formatearEtiquetaGrado($gradoNormalizado) ?? ($gradoNormalizado . '°');
        $etiquetasPermitidas = array_map(
          function (int $grado) {
            return $this->formatearEtiquetaGrado($grado) ?? ($grado . '°');
          },
          $gradosPermitidosEdad
        );

        return ['grado' => [sprintf(
          'El grado indicado (%s) no coincide con los grados permitidos según la edad del estudiante (%s).',
          $etiquetaSolicitada,
          implode(', ', $etiquetasPermitidas)
        )]];
      }
    }

    if ($this->grado !== null) {
      if ($gradoNormalizado === null) {
        return ['grado' => ['El grado suministrado no es válido.']];
      }
      $gradoEtiqueta = $this->formatearEtiquetaGrado($gradoNormalizado);
      if ($gradoEtiqueta === null) {
        return ['grado' => ['El grado indicado no está soportado.']];
      }
      $this->grado = $gradoEtiqueta;
    }

    $esCritico = $this->esDocumentoAcademicoCritico($this->tipo_documento);
    if ($esCritico) {
      if ($gradoNormalizado === null) {
        return ['grado' => ['Debe asociar un grado válido a los documentos académicos críticos.']];
      }

      $gradoAspirado = $this->obtenerGradoInscripcionVigente($pdo, (int) $this->fk_estudiante);
      if ($gradoAspirado !== null && $gradoAspirado === $gradoNormalizado) {
        return ['grado' => ['No puede registrar documentos del mismo grado que está cursando o aspirando actualmente.']];
      }

      $sqlDuplicado = 'SELECT id_documento
                       FROM documentos_academicos
                       WHERE fk_estudiante = ?
                         AND LOWER(tipo_documento) = LOWER(?)
                         AND grado = ?';
      $paramsDuplicado = [$this->fk_estudiante, $this->tipo_documento, $this->grado];
      if (!empty($this->id_documento)) {
        $sqlDuplicado .= ' AND id_documento != ?';
        $paramsDuplicado[] = $this->id_documento;
      }

      $stmtDuplicado = $pdo->prepare($sqlDuplicado);
      $stmtDuplicado->execute($paramsDuplicado);
      if ($stmtDuplicado->fetchColumn()) {
        return ['tipo_documento' => ['El documento crítico para ese grado ya fue cargado.']];
      }
    }

    return true;
  }
}
