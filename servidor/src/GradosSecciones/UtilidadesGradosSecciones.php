<?php

namespace Micodigo\GradosSecciones;

trait UtilidadesGradosSecciones
{
  private function nombreEstadoGradoSeccion(string $estado = null): ?string
  {
    $map = [
      'activo' => 'Grado/Sección Activo',
      'inactivo' => 'Grado/Sección Inactivo'
    ];
    return $estado !== null && isset($map[$estado]) ? $map[$estado] : null;
  }

  private function obtenerFiltrosListadoGradosSecciones(): array
  {
    $filtros = [];

    $estado = $this->limpiarTexto($_GET['estado'] ?? null);
    if ($estado !== null) {
      $filtros['estado'] = strtolower($estado);
    }

    $grados = $this->sanitizarFiltroMultiple($_GET['grados'] ?? null);
    if (!empty($grados)) {
      $filtros['grados'] = $grados;
    }

    $secciones = $this->sanitizarFiltroMultiple($_GET['secciones'] ?? null);
    if (!empty($secciones)) {
      $filtros['secciones'] = $secciones;
    }

    return $filtros;
  }

  private function sanitizarFiltroMultiple($valor): array
  {
    if ($valor === null) return [];

    if (is_string($valor)) {
      $valor = explode(',', $valor);
    } elseif (!is_array($valor)) {
      $valor = [(string)$valor];
    }

    $resultado = [];
    foreach ($valor as $item) {
      $item = $this->limpiarTexto($item ?? null);
      if ($item === null) continue;
      $resultado[] = $item;
    }

    return array_values(array_unique($resultado));
  }
}
