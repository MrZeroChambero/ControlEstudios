<?php

namespace Micodigo\Cargo;

use Micodigo\Config\Conexion;
use Micodigo\Utils\RespuestaJson;
use Valitron\Validator;
use Exception;

class ControladoraCargo
{
  public function __construct()
  {
    Validator::lang('es');
  }

  private function limpiarTexto($texto)
  {
    if ($texto === null) return null;
    $texto = trim($texto);
    $texto = preg_replace('/\s+/', ' ', $texto);
    return $texto === '' ? null : $texto;
  }

  // Listar todos los cargos
  public function listarCargos()
  {
    try {
      $pdo = Conexion::obtener();
      $cargos = Cargo::consultarTodos($pdo);

      RespuestaJson::exito($cargos, 'Cargos obtenidos exitosamente.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al obtener los cargos.', 500, null, $e);
    }
  }

  // Obtener cargo por ID
  public function obtenerCargo($id_cargo)
  {
    try {
      $pdo = Conexion::obtener();
      $cargo = Cargo::obtenerPorId($pdo, $id_cargo);

      if ($cargo) {
        RespuestaJson::exito($cargo, 'Cargo obtenido exitosamente.');
        return;
      }

      RespuestaJson::error('Cargo no encontrado.', 404);
    } catch (Exception $e) {
      RespuestaJson::error('Error al obtener el cargo.', 500, null, $e);
    }
  }

  // Crear nuevo cargo
  public function crearCargo()
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);

      if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error en el formato JSON: ' . json_last_error_msg());
      }

      $data['nombre_cargo'] = $this->limpiarTexto($data['nombre_cargo'] ?? '');
      $data['codigo'] = $this->limpiarTexto($data['codigo'] ?? '');

      $errores = [];

      if (empty($data['nombre_cargo'])) {
        $errores['nombre_cargo'] = 'El nombre del cargo es requerido';
      }

      if (empty($data['tipo'])) {
        $errores['tipo'] = 'El tipo de cargo es requerido';
      }

      if (!empty($data['tipo']) && !in_array($data['tipo'], ['Docente', 'Administrativo', 'Obrero'])) {
        $errores['tipo'] = 'El tipo de cargo debe ser Docente, Administrativo u Obrero';
      }

      if (!empty($data['nombre_cargo']) && strlen($data['nombre_cargo']) > 100) {
        $errores['nombre_cargo'] = 'El nombre del cargo no puede exceder 100 caracteres';
      }

      if (!empty($data['codigo']) && strlen($data['codigo']) > 15) {
        $errores['codigo'] = 'El codigo no puede exceder 15 caracteres';
      }

      if (!empty($errores)) {
        RespuestaJson::error('Datos invalidos en la solicitud.', 400, $errores);
        return;
      }

      $pdo = Conexion::obtener();

      if (Cargo::verificarNombreExistente($pdo, $data['nombre_cargo'])) {
        RespuestaJson::error(
          'El nombre del cargo ya esta registrado.',
          400,
          ['nombre_cargo' => 'El nombre del cargo ya existe']
        );
        return;
      }

      if (!empty($data['codigo']) && Cargo::verificarCodigoExistente($pdo, $data['codigo'])) {
        RespuestaJson::error(
          'El codigo ya esta registrado.',
          400,
          ['codigo' => 'El codigo ya existe']
        );
        return;
      }

      $cargoData = [
        'nombre_cargo' => $data['nombre_cargo'],
        'tipo' => $data['tipo'],
        'codigo' => $data['codigo'] ?? null
      ];

      $id_cargo = Cargo::crear($pdo, $cargoData);

      if (!$id_cargo) {
        throw new Exception('No se pudo crear el cargo en la base de datos');
      }

      $cargoCreado = Cargo::obtenerPorId($pdo, $id_cargo);
      RespuestaJson::exito($cargoCreado, 'Cargo creado exitosamente.', 201);
    } catch (Exception $e) {
      RespuestaJson::error('Error en el servidor al crear el cargo.', 500, null, $e);
    }
  }

  // Actualizar cargo
  public function actualizarCargo($id_cargo)
  {
    try {
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);

      if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error en el formato JSON: ' . json_last_error_msg());
      }

      $data['nombre_cargo'] = $this->limpiarTexto($data['nombre_cargo'] ?? '');
      $data['codigo'] = $this->limpiarTexto($data['codigo'] ?? '');

      $errores = [];

      if (empty($data['nombre_cargo'])) {
        $errores['nombre_cargo'] = 'El nombre del cargo es requerido';
      }

      if (empty($data['tipo'])) {
        $errores['tipo'] = 'El tipo de cargo es requerido';
      }

      if (!empty($data['tipo']) && !in_array($data['tipo'], ['Docente', 'Administrativo', 'Obrero'])) {
        $errores['tipo'] = 'El tipo de cargo debe ser Docente, Administrativo u Obrero';
      }

      if (!empty($data['nombre_cargo']) && strlen($data['nombre_cargo']) > 100) {
        $errores['nombre_cargo'] = 'El nombre del cargo no puede exceder 100 caracteres';
      }

      if (!empty($data['codigo']) && strlen($data['codigo']) > 15) {
        $errores['codigo'] = 'El codigo no puede exceder 15 caracteres';
      }

      if (!empty($errores)) {
        RespuestaJson::error('Datos invalidos en la solicitud.', 400, $errores);
        return;
      }

      $pdo = Conexion::obtener();

      $cargoExistente = Cargo::obtenerPorId($pdo, $id_cargo);
      if (!$cargoExistente) {
        RespuestaJson::error('Cargo no encontrado.', 404);
        return;
      }

      if (Cargo::verificarNombreExistente($pdo, $data['nombre_cargo'], $id_cargo)) {
        RespuestaJson::error(
          'El nombre del cargo ya esta registrado.',
          400,
          ['nombre_cargo' => 'El nombre del cargo ya existe']
        );
        return;
      }

      if (!empty($data['codigo']) && Cargo::verificarCodigoExistente($pdo, $data['codigo'], $id_cargo)) {
        RespuestaJson::error(
          'El codigo ya esta registrado.',
          400,
          ['codigo' => 'El codigo ya existe']
        );
        return;
      }

      $cargoData = [
        'nombre_cargo' => $data['nombre_cargo'],
        'tipo' => $data['tipo'],
        'codigo' => $data['codigo'] ?? null
      ];

      $actualizado = Cargo::actualizar($pdo, $id_cargo, $cargoData);

      if (!$actualizado) {
        throw new Exception('No se pudo actualizar el cargo en la base de datos');
      }

      $cargoActualizado = Cargo::obtenerPorId($pdo, $id_cargo);
      RespuestaJson::exito($cargoActualizado, 'Cargo actualizado exitosamente.');
    } catch (Exception $e) {
      RespuestaJson::error('Error en el servidor al actualizar el cargo.', 500, null, $e);
    }
  }

  // Eliminar cargo
  public function eliminarCargo($id_cargo)
  {
    try {
      $pdo = Conexion::obtener();

      $cargoExistente = Cargo::obtenerPorId($pdo, $id_cargo);
      if (!$cargoExistente) {
        RespuestaJson::error('Cargo no encontrado.', 404);
        return;
      }

      if (Cargo::verificarUsoEnPersonal($pdo, $id_cargo)) {
        RespuestaJson::error(
          'No se puede eliminar el cargo porque esta asignado a personal activo.',
          400
        );
        return;
      }

      $eliminado = Cargo::eliminar($pdo, $id_cargo);

      if (!$eliminado) {
        throw new Exception('No se pudo eliminar el cargo de la base de datos');
      }

      RespuestaJson::exito([], 'Cargo eliminado exitosamente.');
    } catch (Exception $e) {
      RespuestaJson::error('Error en el servidor al eliminar el cargo.', 500, null, $e);
    }
  }

  // Listar cargos para select (solo campos básicos)
  public function listarCargosSelect()
  {
    try {
      $pdo = Conexion::obtener();
      $cargos = Cargo::consultarParaSelect($pdo);

      RespuestaJson::exito($cargos, 'Cargos obtenidos exitosamente para select.');
    } catch (Exception $e) {
      RespuestaJson::error('Error al obtener los cargos para select.', 500, null, $e);
    }
  }
}
