import React, { useMemo, useCallback, useState } from "react";
import { FaTrash, FaEye } from "react-icons/fa";
import VentanaModal from "../../EstilosCliente/VentanaModal";
import ModalSeleccionEstudiantes from "./ModalSeleccionEstudiantes";
import {
  horariosFormClasses,
  horariosTableClasses,
  horariosIconClasses,
} from "../../EstilosCliente/EstilosClientes";
import { diasSemanaOrdenados, diasSemanaOpciones } from "../utilidadesHorarios";
import {
  obtenerRutinasPorContexto,
  RUTINA_CONTEXTO_AULA,
} from "../config/rutinasConfig";
import {
  construirOpcionesBloquesClase,
  esBloqueRegistroClase,
  obtenerBloquePorCodigo,
  obtenerCodigoBloquePorRango,
} from "../config/bloquesHorario";
import TablaHorarioSemanal from "./TablaHorarioSemanal";
const rutinasAula = obtenerRutinasPorContexto(RUTINA_CONTEXTO_AULA);

const bloquesRutinaBase = diasSemanaOrdenados.flatMap((dia) =>
  rutinasAula.map((rutina, indice) => ({
    id_horario: `rutina-${dia}-${rutina.clave}`,
    dia_semana: dia,
    hora_inicio: rutina.inicio,
    hora_fin: rutina.fin,
    nombre_componente: rutina.nombre,
    descripcion_rutina: rutina.descripcion,
    grupo: "completo",
    es_rutina: true,
    orden_rutina: indice + 1,
  }))
);

const formatearFechaCorta = (valor) => {
  if (!valor) {
    return null;
  }
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) {
    return null;
  }
  return fecha.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const obtenerFechaInicioMomento = (momento) =>
  momento?.fecha_inicio ??
  momento?.momento_fecha_inicio ??
  momento?.fechaInicio ??
  momento?.inicio ??
  null;

const obtenerFechaFinMomento = (momento) =>
  momento?.fecha_fin ??
  momento?.momento_fecha_fin ??
  momento?.fechaFinal ??
  momento?.fecha_final ??
  momento?.fin ??
  null;

const obtenerNombreMomento = (momento) => {
  const candidatos = [
    momento?.codigo,
    momento?.nombre,
    momento?.nombre_momento,
    momento?.momento_nombre,
    momento?.descripcion,
  ];

  const etiqueta = candidatos.find(
    (texto) => typeof texto === "string" && texto.trim() !== ""
  );

  return etiqueta?.trim() ?? "Sin nombre";
};

const obtenerIdMomento = (momento) => {
  if (!momento) {
    return null;
  }

  const candidatos = [
    momento.id,
    momento.id_momento,
    momento.idMomento,
    momento.momento_id,
  ];

  for (const candidato of candidatos) {
    const numero = Number(candidato);
    if (!Number.isNaN(numero) && numero > 0) {
      return numero;
    }
  }

  return null;
};

const construirDescripcionMomento = (momento) => {
  if (!momento) {
    return "Sin momento activo";
  }

  const inicio = formatearFechaCorta(obtenerFechaInicioMomento(momento));
  const fin = formatearFechaCorta(obtenerFechaFinMomento(momento));

  let rango = "Fechas no definidas";
  if (inicio && fin) {
    rango = `${inicio} al ${fin}`;
  } else if (inicio) {
    rango = `Desde ${inicio}`;
  } else if (fin) {
    rango = `Hasta ${fin}`;
  }

  const codigo = obtenerNombreMomento(momento);
  const anio = momento.anio_escolar || "Sin año";
  return `Año escolar ${anio} - Momento: ${codigo} (${rango})`;
};

const ModalFormularioHorario = ({
  abierto,
  alCerrar,
  formulario,
  catalogos,
  errores,
  catalogosCargando,
  guardando,
  momentosDisponibles,
  componentesDisponibles,
  personalDisponible,
  estudiantesDisponibles,
  bloquesConfig,
  calendarioPorDia,
  cargandoHorariosAula,
  onCambio,
  onCambioEstudiantes,
  onSubmit,
  onVerDetalle,
  onEliminar,
}) => {
  const [seleccionEstudiantesVisible, setSeleccionEstudiantesVisible] =
    useState(false);

  const momentoSeleccionado = momentosDisponibles.find(
    (momento) =>
      String(obtenerIdMomento(momento)) === String(formulario.fk_momento)
  );

  const descripcionMomento = construirDescripcionMomento(momentoSeleccionado);

  const bloquesAcademicosPorDia = useMemo(() => {
    const calendarioNormalizado = calendarioPorDia || {};
    return diasSemanaOrdenados.reduce((acc, dia) => {
      const registrosDia = calendarioNormalizado[dia] || [];
      acc[dia] = registrosDia.filter((bloque) =>
        esBloqueRegistroClase(bloque, bloquesConfig)
      );
      return acc;
    }, {});
  }, [calendarioPorDia, bloquesConfig]);

  const bloquesRegistrados = useMemo(
    () =>
      diasSemanaOrdenados.flatMap((dia) => bloquesAcademicosPorDia[dia] || []),
    [bloquesAcademicosPorDia]
  );

  const bloquesOcupadosPorDia = useMemo(() => {
    return diasSemanaOrdenados.reduce((acc, dia) => {
      const registrosDia = bloquesAcademicosPorDia[dia] || [];
      acc[dia] = new Set(
        registrosDia
          .map(
            (bloque) =>
              bloque?.codigo_bloque ??
              obtenerCodigoBloquePorRango(
                bloque?.hora_inicio_texto ?? bloque?.hora_inicio,
                bloque?.hora_fin_texto ?? bloque?.hora_fin,
                bloquesConfig
              )
          )
          .filter(Boolean)
      );
      return acc;
    }, {});
  }, [bloquesAcademicosPorDia, bloquesConfig]);

  const bloquesAula = useMemo(
    () => (formulario.fk_aula ? bloquesRegistrados : []),
    [formulario.fk_aula, bloquesRegistrados]
  );

  const bloquesRutina = useMemo(
    () =>
      formulario.fk_aula
        ? bloquesRutinaBase.map((bloque) => ({
            ...bloque,
            fk_aula: formulario.fk_aula,
          }))
        : [],
    [formulario.fk_aula]
  );

  const bloquesClaseOpciones = useMemo(
    () => construirOpcionesBloquesClase(bloquesConfig),
    [bloquesConfig]
  );

  const bloqueSeleccionado = useMemo(
    () =>
      obtenerCodigoBloquePorRango(
        formulario.hora_inicio,
        formulario.hora_fin,
        bloquesConfig
      ),
    [formulario.hora_inicio, formulario.hora_fin, bloquesConfig]
  );

  // Sincronizar la modalidad del bloque con el atributo `grupo` del componente seleccionado
  React.useEffect(() => {
    if (!formulario.fk_componente) return;
    const seleccionado = componentesDisponibles.find(
      (c) =>
        String(c.id) === String(formulario.fk_componente) ||
        String(c.id_componente) === String(formulario.fk_componente)
    );
    const grupoDerivado = seleccionado?.grupo ?? formulario.grupo ?? "completo";
    if (grupoDerivado !== formulario.grupo) {
      onCambio({ target: { name: "grupo", value: grupoDerivado } });
    }
  }, [
    formulario.fk_componente,
    componentesDisponibles,
    formulario.grupo,
    onCambio,
  ]);

  const manejarCambioBloque = useCallback(
    (evento) => {
      const codigo = evento.target.value;
      const bloque = codigo
        ? obtenerBloquePorCodigo(codigo, bloquesConfig)
        : null;

      onCambio({
        target: { name: "hora_inicio", value: bloque?.inicio ?? "" },
      });
      onCambio({ target: { name: "hora_fin", value: bloque?.fin ?? "" } });
    },
    [onCambio, bloquesConfig]
  );

  const handleGuardarEstudiantes = (nuevosIds) => {
    onCambio({ target: { name: "estudiantes", value: nuevosIds } });
  };

  const bloqueDisponibleEnDia = useCallback(
    (codigo) => {
      if (!formulario.dia_semana) {
        return true;
      }
      const ocupados = bloquesOcupadosPorDia[formulario.dia_semana];
      if (!ocupados) {
        return true;
      }
      if (codigo === bloqueSeleccionado) {
        return true;
      }
      return !ocupados.has(codigo);
    },
    [bloquesOcupadosPorDia, formulario.dia_semana, bloqueSeleccionado]
  );

  const renderAccionesBloque = (bloque) => (
    <div className="flex gap-2">
      <button
        type="button"
        className={`${horariosTableClasses.actionButton} ${horariosTableClasses.viewButton}`}
        onClick={() => onVerDetalle(bloque)}
        title="Ver detalle"
      >
        <FaEye className={horariosIconClasses.base} />
      </button>
      <button
        type="button"
        className={`${horariosTableClasses.actionButton} ${horariosTableClasses.deleteButton}`}
        onClick={() => onEliminar(bloque)}
        title="Eliminar"
      >
        <FaTrash className={horariosIconClasses.base} />
      </button>
    </div>
  );

  return (
    <>
      <VentanaModal
        isOpen={abierto}
        onClose={alCerrar}
        title="Crear horario"
        size="lg"
        maxWidthClass="max-w-[90vw]"
        bodyClassName="space-y-6"
      >
        <form onSubmit={onSubmit} className="space-y-5" autoComplete="off">
          {errores.general ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {errores.general}
            </div>
          ) : null}

          <div className={horariosFormClasses.grid}>
            <div className={horariosFormClasses.fieldWrapper}>
              <label className={horariosFormClasses.label} htmlFor="fk_aula">
                Grado y sección
              </label>
              <select
                id="fk_aula"
                name="fk_aula"
                value={formulario.fk_aula}
                onChange={onCambio}
                className={
                  errores.fk_aula
                    ? horariosFormClasses.selectInvalid
                    : horariosFormClasses.select
                }
                required
                disabled={catalogosCargando}
              >
                <option value="">Seleccione un aula</option>
                {catalogos.aulas.map((aula) => (
                  <option key={aula.id} value={aula.id}>
                    {`Grado ${aula.grado ?? ""} - Sección ${
                      aula.seccion ?? ""
                    }`}
                  </option>
                ))}
              </select>
              {errores.fk_aula ? (
                <p className={horariosFormClasses.error}>{errores.fk_aula}</p>
              ) : (
                <p className={horariosFormClasses.helper}>
                  Selecciona el aula para cargar los componentes y docentes
                  asignados.
                </p>
              )}
            </div>

            <div className={horariosFormClasses.fieldWrapper}>
              <label className={horariosFormClasses.label} htmlFor="fk_momento">
                Momento escolar activo
              </label>
              <input
                type="text"
                id="fk_momento"
                name="fk_momento"
                value={descripcionMomento}
                readOnly
                disabled
                className={
                  errores.fk_momento
                    ? horariosFormClasses.inputInvalid
                    : horariosFormClasses.input
                }
              />
              {errores.fk_momento ? (
                <p className={horariosFormClasses.error}>
                  {errores.fk_momento}
                </p>
              ) : (
                <p className={horariosFormClasses.helper}>
                  El rango de fechas se basa en el momento activo del año
                  escolar elegido; se asigna automáticamente según el grado.
                </p>
              )}
            </div>
          </div>

          <div className={horariosFormClasses.grid}>
            <div className={horariosFormClasses.fieldWrapper}>
              <label
                className={horariosFormClasses.label}
                htmlFor="fk_componente"
              >
                Componente de aprendizaje
              </label>
              <select
                id="fk_componente"
                name="fk_componente"
                value={formulario.fk_componente}
                onChange={onCambio}
                className={
                  errores.fk_componente
                    ? horariosFormClasses.selectInvalid
                    : horariosFormClasses.select
                }
                required
                disabled={
                  catalogosCargando ||
                  !formulario.fk_aula ||
                  !formulario.fk_personal ||
                  componentesDisponibles.length === 0
                }
              >
                <option value="">Seleccione un componente</option>
                {componentesDisponibles.map((componente) => (
                  <option key={componente.id} value={componente.id}>
                    {componente.especialista === "si"
                      ? `${componente.nombre} — Especialista`
                      : componente.nombre}
                  </option>
                ))}
              </select>
              {errores.fk_componente ? (
                <p className={horariosFormClasses.error}>
                  {errores.fk_componente}
                </p>
              ) : componentesDisponibles.length === 0 && formulario.fk_aula ? (
                <p className={horariosFormClasses.helper}>
                  {formulario.fk_personal
                    ? "El docente seleccionado no tiene componentes asignados en el momento activo."
                    : "Selecciona un docente para ver los componentes disponibles."}
                </p>
              ) : (
                <p className={horariosFormClasses.helper}>
                  Solo se muestran los componentes asignados al docente en el
                  momento activo del aula.
                </p>
              )}
            </div>

            <div className={horariosFormClasses.fieldWrapper}>
              <label
                className={horariosFormClasses.label}
                htmlFor="fk_personal"
              >
                Docente asignado
              </label>
              <select
                id="fk_personal"
                name="fk_personal"
                value={formulario.fk_personal}
                onChange={onCambio}
                className={
                  errores.fk_personal
                    ? horariosFormClasses.selectInvalid
                    : horariosFormClasses.select
                }
                required
                disabled={
                  catalogosCargando ||
                  !formulario.fk_aula ||
                  personalDisponible.length === 0
                }
              >
                <option value="">Seleccione un docente</option>
                {personalDisponible.map((docente) => (
                  <option key={docente.id} value={docente.id}>
                    {`${docente.nombre} — ${docente.funcion}`}
                  </option>
                ))}
              </select>
              {errores.fk_personal ? (
                <p className={horariosFormClasses.error}>
                  {errores.fk_personal}
                </p>
              ) : personalDisponible.length === 0 && formulario.fk_aula ? (
                <p className={horariosFormClasses.helper}>
                  El aula no tiene personal asociado al momento indicado.
                </p>
              ) : (
                <p className={horariosFormClasses.helper}>
                  Solo se listan los docentes con asignación vigente para este
                  aula.
                </p>
              )}
            </div>
          </div>

          <div className={horariosFormClasses.grid}>
            <div className={horariosFormClasses.fieldWrapper}>
              <label className={horariosFormClasses.label} htmlFor="dia_semana">
                Día de la semana
              </label>
              <select
                id="dia_semana"
                name="dia_semana"
                value={formulario.dia_semana}
                onChange={onCambio}
                className={
                  errores.dia_semana
                    ? horariosFormClasses.selectInvalid
                    : horariosFormClasses.select
                }
                required
              >
                <option value="">Seleccione un día</option>
                {diasSemanaOpciones.map((dia) => (
                  <option key={dia.valor} value={dia.valor}>
                    {dia.etiqueta}
                  </option>
                ))}
              </select>
              {errores.dia_semana ? (
                <p className={horariosFormClasses.error}>
                  {errores.dia_semana}
                </p>
              ) : (
                <p className={horariosFormClasses.helper}>
                  El horario será válido únicamente para el día seleccionado.
                </p>
              )}
            </div>

            <div className={horariosFormClasses.fieldWrapper}>
              <label className={horariosFormClasses.label} htmlFor="grupo">
                Modalidad del bloque
              </label>
              <input
                type="text"
                id="grupo"
                name="grupo"
                value={
                  formulario.grupo === "subgrupo"
                    ? "Subgrupo"
                    : "Grupo completo"
                }
                readOnly
                disabled
                className={
                  errores.grupo
                    ? horariosFormClasses.inputInvalid
                    : `${horariosFormClasses.input} bg-slate-100 cursor-not-allowed`
                }
              />
              {errores.grupo ? (
                <p className={horariosFormClasses.error}>{errores.grupo}</p>
              ) : (
                <p className={horariosFormClasses.helper}>
                  La modalidad se deriva del componente seleccionado y no puede
                  modificarse manualmente.
                </p>
              )}
            </div>
          </div>

          <div className={horariosFormClasses.grid}>
            <div className={horariosFormClasses.fieldWrapper}>
              <label
                className={horariosFormClasses.label}
                htmlFor="codigo_bloque"
              >
                Bloque académico disponible
              </label>
              <select
                id="codigo_bloque"
                name="codigo_bloque"
                value={bloqueSeleccionado ?? ""}
                onChange={manejarCambioBloque}
                className={
                  errores.horario || errores.hora_inicio || errores.hora_fin
                    ? horariosFormClasses.selectInvalid
                    : horariosFormClasses.select
                }
                disabled={
                  !formulario.fk_aula ||
                  !formulario.dia_semana ||
                  catalogosCargando
                }
                required
              >
                <option value="">Selecciona un bloque del cronograma</option>
                {bloquesClaseOpciones.map((opcion) => (
                  <option
                    key={opcion.value}
                    value={opcion.value}
                    disabled={!bloqueDisponibleEnDia(opcion.value)}
                  >
                    {opcion.label}
                    {opcion.esExtension ? " — Extensión" : ""}
                    {` · ${opcion.duracion} min`}
                  </option>
                ))}
              </select>
              {errores.hora_inicio ? (
                <p className={horariosFormClasses.error}>
                  {errores.hora_inicio}
                </p>
              ) : null}
              {errores.hora_fin ? (
                <p className={horariosFormClasses.error}>{errores.hora_fin}</p>
              ) : null}
              {errores.horario ? (
                <p className={horariosFormClasses.error}>{errores.horario}</p>
              ) : (
                <>
                  <p className={horariosFormClasses.helper}>
                    {formulario.dia_semana
                      ? "Los bloques ocupados aparecen deshabilitados para este día."
                      : "Selecciona un día para revisar la disponibilidad."}
                  </p>
                </>
              )}
            </div>
            <div className={horariosFormClasses.actions}>
              <button
                type="submit"
                className={horariosFormClasses.primaryButton}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Crear horario"}
              </button>
            </div>
          </div>

          {formulario.grupo === "subgrupo" ? (
            <div className={horariosFormClasses.group}>
              <label className={horariosFormClasses.label}>
                Estudiantes Asignados
              </label>
              <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex-grow">
                  <p className="text-sm font-medium text-slate-700">
                    {formulario.estudiantes.length} de{" "}
                    {estudiantesDisponibles.length} estudiantes seleccionados
                  </p>
                  <p className={horariosFormClasses.helper}>
                    Haz clic en el botón para editar la lista de estudiantes de
                    este subgrupo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSeleccionEstudiantesVisible(true)}
                  className={horariosFormClasses.secondaryButton}
                  disabled={
                    !formulario.fk_aula || estudiantesDisponibles.length === 0
                  }
                >
                  Editar Selección
                </button>
              </div>
              {errores.estudiantes && (
                <p className={horariosFormClasses.error}>
                  {errores.estudiantes}
                </p>
              )}
            </div>
          ) : null}

          <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-800">
                  Agenda semanal del aula
                </h3>
                <p className="text-xs text-slate-500">
                  Incluye la rutina de ingreso y los bloques académicos ya
                  registrados en la semana.
                </p>
              </div>
            </div>

            {!formulario.fk_aula ? (
              <p className="text-sm text-slate-500">
                Selecciona un aula para visualizar su cronograma semanal.
              </p>
            ) : cargandoHorariosAula ? (
              <div
                className="h-40 animate-pulse rounded-3xl border border-slate-200 bg-slate-100"
                aria-hidden="true"
              />
            ) : (
              <TablaHorarioSemanal
                bloques={bloquesAula}
                bloquesFijos={bloquesRutina}
                bloquesConfig={bloquesConfig}
                emptyMessage="Aún no se han registrado bloques académicos para este aula."
                renderAcciones={renderAccionesBloque}
              />
            )}
          </div>
        </form>
      </VentanaModal>
      {seleccionEstudiantesVisible && (
        <ModalSeleccionEstudiantes
          abierto={seleccionEstudiantesVisible}
          alCerrar={() => setSeleccionEstudiantesVisible(false)}
          idAula={formulario.fk_aula}
          estudiantesSeleccionados={formulario.estudiantes}
          onGuardar={handleGuardarEstudiantes}
        />
      )}
    </>
  );
};

export default ModalFormularioHorario;
