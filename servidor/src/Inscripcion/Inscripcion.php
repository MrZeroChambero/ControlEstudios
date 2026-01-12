<?php

namespace Micodigo\Inscripcion;

use DateTimeImmutable;
use Exception;
use Micodigo\Config\Conexion;
use Micodigo\Login\Login;
use Micodigo\Utils\RespuestaJson;
use PDO;
use RuntimeException;
use Valitron\Validator;

require_once __DIR__ . '/InscripcionFormatoNombreTrait.php';
require_once __DIR__ . '/InscripcionAnioEscolarTrait.php';
require_once __DIR__ . '/InscripcionEstudiantesTrait.php';
require_once __DIR__ . '/InscripcionCuposTrait.php';
require_once __DIR__ . '/InscripcionRepresentantesTrait.php';
require_once __DIR__ . '/InscripcionProcesadorTrait.php';
require_once __DIR__ . '/InscripcionDebugTrait.php';
require_once __DIR__ . '/InscripcionHistorialTrait.php';
require_once __DIR__ . '/../Login/Login.php';

class InscripcionValidacionException extends RuntimeException
{
  private array $errores;

  public function __construct(string $mensaje, array $errores)
  {
    parent::__construct($mensaje);
    $this->errores = $errores;
  }

  public function obtenerErrores(): array
  {
    return $this->errores;
  }
}





class Inscripcion
{
  use InscripcionDebugTrait;
  use InscripcionAnioEscolarTrait;
  use InscripcionEstudiantesTrait;
  use InscripcionCuposTrait;
  use InscripcionRepresentantesTrait;
  use InscripcionProcesadorTrait;
  use InscripcionHistorialTrait;

  public function __construct()
  {
    Validator::lang('es');
  }

  public function verificarPrecondiciones(): void
  {
    try {
      $conexion = $this->obtenerConexion();
      $debugSql = [];
      $debugMensajes = [];
      $resultado = $this->validarAnioEscolar($conexion, $debugSql, $debugMensajes);

      $mensaje = $resultado['valido']
        ? 'El sistema de inscripción está listo para usarse.'
        : 'El sistema de inscripción no está disponible hasta completar los requisitos.';

      $datos = [
        'listo' => $resultado['valido'],
        'anio' => $resultado['anio'],
        'faltantes_docentes' => $resultado['faltantes_docentes'],
        'motivos' => $resultado['motivos'],
      ];
      $this->adjuntarDebug($datos, $debugMensajes, $debugSql);

      $this->responder(200, true, $mensaje, $datos);
    } catch (Exception $e) {
      $this->responder(500, false, 'Error interno al verificar las precondiciones.', null, [
        'detalle' => [$e->getMessage()],
      ]);
    }
  }

  public function listarEstudiantesElegibles(): void
  {
    try {
      $conexion = $this->obtenerConexion();
      $debugSql = [];
      $debugMensajes = [];
      $resultado = $this->validarAnioEscolar($conexion, $debugSql, $debugMensajes);
      if (!$resultado['valido']) {
        $datos = [
          'motivos' => $resultado['motivos'],
        ];
        $this->adjuntarDebug($datos, $debugMensajes, $debugSql);

        $this->responder(428, false, 'No es posible listar estudiantes hasta cumplir las precondiciones.', $datos);
        return;
      }

      $referencia = isset($resultado['anio']['fecha_inicio'])
        ? (DateTimeImmutable::createFromFormat('Y-m-d', $resultado['anio']['fecha_inicio']) ?: new DateTimeImmutable())
        : new DateTimeImmutable();
      $fechaReferencia = $_GET['fecha_referencia'] ?? null;
      if ($fechaReferencia !== null) {
        $fechaReferencia = trim((string) $fechaReferencia);
        if ($fechaReferencia !== '') {
          $referenciaTemporal = DateTimeImmutable::createFromFormat('Y-m-d', $fechaReferencia);
          $erroresFecha = DateTimeImmutable::getLastErrors();
          if ($referenciaTemporal === false || ($erroresFecha !== false && ($erroresFecha['warning_count'] > 0 || $erroresFecha['error_count'] > 0))) {
            $this->agregarMensajeDebug($debugMensajes, 'Fecha de referencia suministrada inválida.');
            $this->responder(422, false, 'Fecha de referencia inválida.', null, [
              'fecha_referencia' => ['Debe suministrar la fecha en formato AAAA-MM-DD.'],
            ]);
            return;
          }
          $referencia = $referenciaTemporal;
        }
      }

      $lista = $this->obtenerEstudiantesElegibles(
        $conexion,
        $resultado['anio']['id'],
        $referencia,
        $debugSql,
        $debugMensajes
      );

      $datos = [
        'anio' => $resultado['anio'],
        'fecha_referencia' => $referencia->format('Y-m-d'),
        'estudiantes' => $lista,
      ];
      $this->adjuntarDebug($datos, $debugMensajes, $debugSql);

      $this->responder(200, true, 'Estudiantes elegibles cargados correctamente.', $datos);
    } catch (Exception $e) {
      $this->responder(500, false, 'Error al obtener los estudiantes elegibles.', null, [
        'detalle' => [$e->getMessage()],
      ]);
    }
  }

  public function listarAulasDisponibles(): void
  {
    try {
      $conexion = $this->obtenerConexion();
      $debugSql = [];
      $debugMensajes = [];
      $resultado = $this->validarAnioEscolar($conexion, $debugSql, $debugMensajes);
      if (!$resultado['valido']) {
        $datos = [
          'motivos' => $resultado['motivos'],
        ];
        $this->adjuntarDebug($datos, $debugMensajes, $debugSql);

        $this->responder(428, false, 'No es posible listar aulas hasta cumplir las precondiciones.', $datos);
        return;
      }

      $aulas = $this->listarAulasConDisponibilidad($conexion, $resultado['anio']['id'], $debugSql);
      $disponibles = array_values(
        array_filter(
          $aulas,
          fn(array $aula): bool => $aula['disponibles'] > 0 && $aula['docente'] !== null
        )
      );

      $this->agregarMensajeDebug($debugMensajes, sprintf('Se encontraron %d aulas con disponibilidad y docente asignado.', count($disponibles)));

      $datos = [
        'anio' => $resultado['anio'],
        'aulas' => $disponibles,
      ];
      $this->adjuntarDebug($datos, $debugMensajes, $debugSql);

      $this->responder(200, true, 'Aulas disponibles cargadas correctamente.', $datos);
    } catch (Exception $e) {
      $this->responder(500, false, 'Error al obtener las aulas disponibles.', null, [
        'detalle' => [$e->getMessage()],
      ]);
    }
  }

  public function listarResumenInscripciones(): void
  {
    try {
      $conexion = $this->obtenerConexion();
      $debugSql = [];
      $debugMensajes = [];
      $resultado = $this->validarAnioEscolar($conexion, $debugSql, $debugMensajes);
      if (!$resultado['valido']) {
        $datos = [
          'motivos' => $resultado['motivos'],
        ];
        $this->adjuntarDebug($datos, $debugMensajes, $debugSql);

        $this->responder(428, false, 'No es posible generar el resumen hasta cumplir las precondiciones.', $datos);
        return;
      }

      $anioId = $resultado['anio']['id'];
      $aulas = $this->listarAulasConDisponibilidad($conexion, $anioId, $debugSql);
      $this->agregarMensajeDebug($debugMensajes, sprintf('Se encontraron %d aulas activas para el año escolar.', count($aulas)));

      $sql = 'SELECT i.id_inscripcion,
            i.fk_aula,
            i.fecha_inscripcion,
            i.estado_inscripcion,
            est.id_estudiante,
            est.cedula_escolar,
            perEst.cedula AS cedula_estudiante,
            perEst.primer_nombre AS est_primer_nombre,
            perEst.segundo_nombre AS est_segundo_nombre,
            perEst.primer_apellido AS est_primer_apellido,
            perEst.segundo_apellido AS est_segundo_apellido,
            rep.id_representante,
            perRep.cedula AS cedula_representante,
            perRep.primer_nombre AS rep_primer_nombre,
            perRep.segundo_nombre AS rep_segundo_nombre,
            perRep.primer_apellido AS rep_primer_apellido,
            perRep.segundo_apellido AS rep_segundo_apellido
          FROM inscripciones i
          INNER JOIN aula a ON a.id_aula = i.fk_aula
          INNER JOIN estudiantes est ON est.id_estudiante = i.fk_estudiante
          INNER JOIN personas perEst ON perEst.id_persona = est.id_persona
          INNER JOIN representantes rep ON rep.id_representante = i.fk_representante
          INNER JOIN personas perRep ON perRep.id_persona = rep.fk_persona
              WHERE a.fk_anio_escolar = ?
                AND i.estado_inscripcion IN ("activo", "en_proceso")
              ORDER BY a.id_aula, perEst.primer_nombre, perEst.primer_apellido';

      $this->agregarSqlDebug($debugSql, 'inscripciones_por_aula', $sql, ['anio_escolar_id' => $anioId]);

      $consulta = $conexion->prepare($sql);
      $consulta->execute([$anioId]);
      $registros = $consulta->fetchAll(PDO::FETCH_ASSOC) ?: [];

      $mapaEstudiantes = [];
      foreach ($registros as $fila) {
        $aulaId = (int) $fila['fk_aula'];
        if (!isset($mapaEstudiantes[$aulaId])) {
          $mapaEstudiantes[$aulaId] = [];
        }

        $mapaEstudiantes[$aulaId][] = [
          'id_inscripcion' => (int) $fila['id_inscripcion'],
          'fecha_inscripcion' => $fila['fecha_inscripcion'],
          'estado' => $fila['estado_inscripcion'],
          'estudiante' => [
            'id' => (int) $fila['id_estudiante'],
            'cedula' => $fila['cedula_estudiante'],
            'cedula_escolar' => $fila['cedula_escolar'],
            'nombre_completo' => $this->construirNombreCompleto([
              'primer_nombre' => $fila['est_primer_nombre'],
              'segundo_nombre' => $fila['est_segundo_nombre'],
              'primer_apellido' => $fila['est_primer_apellido'],
              'segundo_apellido' => $fila['est_segundo_apellido'],
            ]),
          ],
          'representante' => [
            'id' => (int) $fila['id_representante'],
            'cedula' => $fila['cedula_representante'],
            'nombre_completo' => $this->construirNombreCompleto([
              'primer_nombre' => $fila['rep_primer_nombre'],
              'segundo_nombre' => $fila['rep_segundo_nombre'],
              'primer_apellido' => $fila['rep_primer_apellido'],
              'segundo_apellido' => $fila['rep_segundo_apellido'],
            ]),
          ],
        ];
      }

      $secciones = [];
      foreach ($aulas as $aula) {
        $idAula = (int) $aula['id_aula'];
        $estudiantes = $mapaEstudiantes[$idAula] ?? [];

        $secciones[] = [
          'aula_id' => $idAula,
          'grado' => (int) $aula['grado'],
          'seccion' => $aula['seccion'],
          'cupos' => (int) $aula['cupos'],
          'ocupados' => (int) $aula['ocupados'],
          'disponibles' => (int) $aula['disponibles'],
          'docente' => $aula['docente'],
          'estudiantes' => $estudiantes,
        ];
      }

      $totalInscripciones = array_reduce(
        $secciones,
        fn(int $carry, array $seccion): int => $carry + count($seccion['estudiantes']),
        0
      );
      $seccionesConInscripciones = array_reduce(
        $secciones,
        fn(int $carry, array $seccion): int => $carry + (count($seccion['estudiantes']) > 0 ? 1 : 0),
        0
      );

      $this->agregarMensajeDebug(
        $debugMensajes,
        sprintf(
          'Se contabilizaron %d inscripciones activas distribuidas en %d secciones.',
          $totalInscripciones,
          $seccionesConInscripciones
        )
      );

      $datos = [
        'anio' => $resultado['anio'],
        'total' => $totalInscripciones,
        'secciones' => $secciones,
      ];
      $this->adjuntarDebug($datos, $debugMensajes, $debugSql);

      $this->responder(200, true, 'Resumen de inscripciones generado correctamente.', $datos);
    } catch (Exception $e) {
      $this->responder(500, false, 'Error al generar el resumen de inscripciones.', null, [
        'detalle' => [$e->getMessage()],
      ]);
    }
  }

  public function listarRepresentantesElegibles(int $estudianteId): void
  {
    try {
      $conexion = $this->obtenerConexion();
      $debugSql = [];
      $debugMensajes = [];
      $resultado = $this->validarAnioEscolar($conexion, $debugSql, $debugMensajes);
      if (!$resultado['valido']) {
        $datos = [
          'motivos' => $resultado['motivos'],
        ];
        $this->adjuntarDebug($datos, $debugMensajes, $debugSql);

        $this->responder(428, false, 'No es posible listar representantes hasta cumplir las precondiciones.', $datos);
        return;
      }

      if ($estudianteId <= 0) {
        $this->agregarMensajeDebug($debugMensajes, 'Se recibió un identificador de estudiante inválido.');
        $this->responder(422, false, 'Identificador de estudiante inválido.', null, [
          'estudiante' => ['Debe seleccionar un estudiante válido.'],
        ]);
        return;
      }

      $estudiante = $this->obtenerEstudianteActivoPorId($conexion, $estudianteId, $debugSql);
      if ($estudiante === null) {
        $this->agregarMensajeDebug($debugMensajes, 'No se encontró el estudiante solicitado o no está activo.');
        $this->responder(404, false, 'El estudiante indicado no está disponible.', null, [
          'estudiante' => ['El estudiante no existe o no está activo.'],
        ]);
        return;
      }

      $lista = $this->obtenerRepresentantesAsociados($conexion, $estudianteId, $debugSql);

      $this->agregarMensajeDebug($debugMensajes, sprintf('Se encontraron %d representantes activos asociados al estudiante.', count($lista)));

      $datos = [
        'estudiante' => $estudiante,
        'representantes' => $lista,
      ];
      $this->adjuntarDebug($datos, $debugMensajes, $debugSql);

      $this->responder(200, true, 'Representantes asociados cargados correctamente.', $datos);
    } catch (Exception $e) {
      $this->responder(500, false, 'Error al obtener los representantes disponibles.', null, [
        'detalle' => [$e->getMessage()],
      ]);
    }
  }

  public function registrarInscripcion(): void
  {
    try {
      $entrada = $this->leerEntradaJson();

      $estudianteId = isset($entrada['estudiante_id']) ? (int) $entrada['estudiante_id'] : 0;
      $aulaId = isset($entrada['aula_id']) ? (int) $entrada['aula_id'] : 0;
      $representanteId = isset($entrada['representante_id']) ? (int) $entrada['representante_id'] : 0;
      $tipoInscripcionEntrada = $entrada['tipo_inscripcion'] ?? null;
      $tipoInscripcion = $this->normalizarTipoInscripcionEntrada($tipoInscripcionEntrada);
      $datosFormulario = $entrada['datos'] ?? null;

      $errores = [];
      if ($estudianteId <= 0) {
        $errores['estudiante'][] = 'Debe seleccionar un estudiante válido.';
      }
      if ($aulaId <= 0) {
        $errores['aula'][] = 'Debe seleccionar un grado y sección válidos.';
      }
      if ($representanteId <= 0) {
        $errores['representante'][] = 'Debe seleccionar un representante válido.';
      }

      $tiposPermitidos = ['regular', 'nuevo_ingreso', 'traslado', 'no_escolarizados'];
      if (!is_string($tipoInscripcion) || !in_array($tipoInscripcion, $tiposPermitidos, true)) {
        $errores['tipo_inscripcion'][] = 'Debe seleccionar un tipo de inscripción válido.';
      }

      if (!is_array($datosFormulario)) {
        $errores['datos'][] = 'Los datos adicionales de la inscripción son requeridos.';
      }

      if (!empty($errores)) {
        $this->responder(422, false, 'La solicitud contiene datos inválidos.', null, $errores);
        return;
      }

      $conexion = $this->obtenerConexion();
      $debugSql = [];
      $debugMensajes = [];
      $resultadoAnio = $this->validarAnioEscolar($conexion, $debugSql, $debugMensajes);
      if (!$resultadoAnio['valido']) {
        $datos = [
          'motivos' => $resultadoAnio['motivos'],
        ];
        $this->adjuntarDebug($datos, $debugMensajes, $debugSql);

        $this->responder(428, false, 'No es posible registrar la inscripción hasta cumplir las precondiciones.', $datos);
        return;
      }

      $detalleAula = $this->obtenerDetalleAulaDisponible(
        $conexion,
        $resultadoAnio['anio']['id'],
        $aulaId,
        $debugSql
      );
      if ($detalleAula['docente'] === null) {
        $this->agregarMensajeDebug($debugMensajes, 'El aula seleccionada no tiene docente asignado.');
        $this->responder(422, false, 'El aula seleccionada no tiene docente asignado.', null, [
          'aula' => ['Debe asignar un docente titular a la sección antes de inscribir.'],
        ]);
        return;
      }

      $validacionEstudiante = $this->validarEstudianteSeleccion(
        $conexion,
        $estudianteId,
        $detalleAula['grado'],
        $resultadoAnio['anio']['id'],
        $debugSql,
        $debugMensajes
      );

      if (!$validacionEstudiante['valido']) {
        $this->responder(422, false, 'El estudiante no cumple los requisitos de inscripción.', null, $validacionEstudiante['errores']);
        return;
      }

      $validacionRepresentante = $this->validarRepresentanteSeleccion(
        $conexion,
        $estudianteId,
        $representanteId,
        $debugSql,
        $debugMensajes
      );

      if (!$validacionRepresentante['valido']) {
        $this->responder(422, false, 'El representante no cumple los requisitos.', null, $validacionRepresentante['errores']);
        return;
      }

      $contexto = [
        'anio' => $resultadoAnio['anio'],
        'aula' => $detalleAula,
        'estudiante' => $validacionEstudiante['estudiante'],
        'representante' => $validacionRepresentante['representante'],
        'tipo_inscripcion' => $tipoInscripcion,
        'tipo_original' => $tipoInscripcionEntrada,
        'historial' => $validacionEstudiante['historial'] ?? [],
      ];

      $resultado = $this->registrarProcesoDeInscripcion(
        $conexion,
        $contexto,
        $datosFormulario,
        $debugSql,
        $debugMensajes
      );

      $this->agregarMensajeDebug($debugMensajes, 'Inscripción registrada exitosamente en la base de datos.');

      $datos = [
        'inscripcion' => $resultado,
      ];
      $this->adjuntarDebug($datos, $debugMensajes, $debugSql);

      $this->responder(201, true, 'Inscripción registrada correctamente.', $datos);
    } catch (InscripcionValidacionException $e) {
      $this->responder(422, false, $e->getMessage(), null, $e->obtenerErrores());
    } catch (RuntimeException $e) {
      $this->responder(422, false, $e->getMessage(), null, [
        'general' => [$e->getMessage()],
      ]);
    } catch (Exception $e) {
      $this->responder(500, false, 'Ocurrió un error al registrar la inscripción.', null, [
        'detalle' => [$e->getMessage()],
      ]);
    }
  }

  public function retirarInscripcion(int $idInscripcion): void
  {
    try {
      $identificador = (int) $idInscripcion;
      if ($identificador <= 0) {
        $this->responder(422, false, 'Identificador de inscripción inválido.', null, [
          'id' => ['Debe indicar una inscripción válida.'],
        ]);
        return;
      }

      $entrada = $this->leerEntradaJson();
      $clave = isset($entrada['clave']) ? trim((string) $entrada['clave']) : '';
      $motivo = isset($entrada['motivo']) ? trim((string) $entrada['motivo']) : '';
      if ($clave === '') {
        $this->responder(422, false, 'Debe confirmar la acción con su contraseña.', null, [
          'clave' => ['La contraseña es obligatoria para retirar una inscripción.'],
        ]);
        return;
      }

      $motivo = $motivo !== '' ? mb_substr($motivo, 0, 255) : null;

      $token = $_COOKIE['session_token'] ?? null;
      if ($token === null) {
        $this->responder(403, false, 'Sesión no válida.', null, [
          'sesion' => ['Debes iniciar sesión nuevamente.'],
        ]);
        return;
      }

      $conexion = $this->obtenerConexion();
      $login = new Login($conexion);
      $usuario = $login->obtenerUsuarioPorHash($token);
      if (!$usuario) {
        $this->responder(403, false, 'Sesión inválida.', null, [
          'sesion' => ['Debes iniciar sesión nuevamente.'],
        ]);
        return;
      }

      $stmtClave = $conexion->prepare('SELECT contrasena_hash FROM usuarios WHERE id_usuario = ? LIMIT 1');
      $stmtClave->execute([(int) $usuario['id_usuario']]);
      $hash = $stmtClave->fetchColumn();
      if (!$hash || !password_verify($clave, $hash)) {
        $this->responder(401, false, 'Contraseña incorrecta.', null, [
          'clave' => ['La contraseña no coincide con el usuario autenticado.'],
        ]);
        return;
      }

      $sqlDetalle = 'SELECT i.id_inscripcion,
                            i.estado_inscripcion,
                            i.fk_estudiante,
                            e.id_persona,
                            p.estado AS estado_persona
                     FROM inscripciones i
                     INNER JOIN estudiantes e ON e.id_estudiante = i.fk_estudiante
                     INNER JOIN personas p ON p.id_persona = e.id_persona
                     WHERE i.id_inscripcion = ?
                     LIMIT 1';

      $stmtDetalle = $conexion->prepare($sqlDetalle);
      $stmtDetalle->execute([$identificador]);
      $detalle = $stmtDetalle->fetch(PDO::FETCH_ASSOC);

      if (!$detalle) {
        $this->responder(404, false, 'La inscripción indicada no existe.', null, [
          'id' => ['No se encontró la inscripción solicitada.'],
        ]);
        return;
      }

      if ($detalle['estado_inscripcion'] === 'retirado') {
        $this->responder(409, false, 'La inscripción ya fue retirada con anterioridad.', null, [
          'estado' => ['La inscripción ya se encuentra marcada como retirada.'],
        ]);
        return;
      }

      $conexion->beginTransaction();

      $sqlRetiro = 'UPDATE inscripciones
                    SET estado_inscripcion = "retirado",
                        fecha_retiro = CURDATE(),
                        motivo_retiro = ?
                    WHERE id_inscripcion = ?';
      $stmtRetiro = $conexion->prepare($sqlRetiro);
      $stmtRetiro->execute([$motivo, $identificador]);

      $sqlPersona = 'UPDATE personas SET estado = "inactivo" WHERE id_persona = ?';
      $stmtPersona = $conexion->prepare($sqlPersona);
      $stmtPersona->execute([(int) $detalle['id_persona']]);

      $conexion->commit();

      $this->responder(200, true, 'Inscripción retirada correctamente.', [
        'id_inscripcion' => $identificador,
        'estado_inscripcion' => 'retirado',
        'motivo_retiro' => $motivo,
        'fecha_retiro' => (new DateTimeImmutable())->format('Y-m-d'),
      ]);
    } catch (Exception $e) {
      if (isset($conexion) && $conexion->inTransaction()) {
        $conexion->rollBack();
      }
      $this->responder(500, false, 'Ocurrió un error al retirar la inscripción.', null, [
        'detalle' => [$e->getMessage()],
      ]);
    }
  }

  private function obtenerConexion(): PDO
  {
    return Conexion::obtener();
  }

  private function leerEntradaJson(): array
  {
    $contenido = file_get_contents('php://input');
    if ($contenido === false) {
      throw new RuntimeException('No fue posible leer la entrada de la solicitud.');
    }

    $contenido = trim($contenido);
    if ($contenido === '') {
      return [];
    }

    $decodificado = json_decode($contenido, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($decodificado)) {
      throw new RuntimeException('El cuerpo de la solicitud debe ser JSON válido.');
    }

    return $decodificado;
  }

  private function responder(int $codigo, bool $exito, string $mensaje, mixed $datos = null, ?array $errores = null): void
  {
    if ($exito) {
      RespuestaJson::exito($datos, $mensaje, $codigo);
      return;
    }

    RespuestaJson::error($mensaje, $codigo, $errores);
  }

  private function construirDebugRespuesta(?array $mensajes, ?array $sql): ?array
  {
    if (!is_array($mensajes) && !is_array($sql)) {
      return null;
    }

    $limpios = [];
    if (is_array($mensajes)) {
      foreach ($mensajes as $mensaje) {
        if (is_string($mensaje)) {
          $texto = trim($mensaje);
          if ($texto !== '') {
            $limpios[] = $texto;
          }
        }
      }
    }

    if (empty($limpios)) {
      return null;
    }

    return ['mensajes' => $limpios];
  }

  private function adjuntarDebug(array &$datos, ?array $mensajes, ?array $sql): void
  {
    $debug = $this->construirDebugRespuesta($mensajes, $sql);
    if ($debug !== null) {
      $datos['debug'] = $debug;
    }
  }

  private function normalizarTipoInscripcionEntrada(mixed $tipo): ?string
  {
    if (!is_string($tipo)) {
      return null;
    }

    $valor = strtolower(trim($tipo));

    if ($valor === '') {
      return null;
    }

    if ($valor === 'educado_en_casa' || $valor === 'educado-en-casa') {
      return 'no_escolarizados';
    }

    if ($valor === 'no_escolarizado') {
      return 'no_escolarizados';
    }

    return $valor;
  }
}
