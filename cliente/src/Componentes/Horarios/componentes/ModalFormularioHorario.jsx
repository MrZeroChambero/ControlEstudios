import React, { useMemo } from "react";
import { FaTrash, FaEye } from "react-icons/fa";
import VentanaModal from "../../EstilosCliente/VentanaModal";
import {
  horariosFormClasses,
  horariosTableClasses,
  horariosIconClasses,
} from "../../EstilosCliente/EstilosClientes";
import {
  diasSemanaOrdenados,
  diasSemanaOpciones,
  MIN_MINUTOS_COMPONENTE,
  MAX_MINUTOS_JORNADA,
  SEGMENTO_BLOQUE_MINUTOS,
  DURACIONES_AULA_MINUTOS,
} from "../utilidadesHorarios";
import {
  obtenerRutinasPorContexto,
  RUTINA_CONTEXTO_AULA,
} from "../config/rutinasConfig";
import TablaHorarioSemanal from "./TablaHorarioSemanal";
const rutinasAula = obtenerRutinasPorContexto(RUTINA_CONTEXTO_AULA);

const generarOpcionesHoras = () => {
  const opciones = [];
  for (
    let minuto = MIN_MINUTOS_COMPONENTE;
    minuto <= MAX_MINUTOS_JORNADA;
    minuto += SEGMENTO_BLOQUE_MINUTOS
  ) {
    const hora = Math.floor(minuto / 60)
      .toString()
      .padStart(2, "0");
    const min = (minuto % 60).toString().padStart(2, "0");
    opciones.push(`${hora}:${min}`);
  }
  return opciones;
};

const opcionesHorasSegmentadas = generarOpcionesHoras();

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
  return `Momento escolar activo: ${codigo} (${rango})`;
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
  duracionesPermitidas = DURACIONES_AULA_MINUTOS,
  esEspecialistaSeleccionado = false,
  calendarioPorDia,
  cargandoHorariosAula,
  onCambio,
  onCambioEstudiantes,
  onBlurHora,
  onSubmit,
  onVerDetalle,
  onEliminar,
}) => {
  const momentoSeleccionado = momentosDisponibles.find(
    (momento) =>
      String(obtenerIdMomento(momento)) === String(formulario.fk_momento)
  );

  const descripcionMomento = construirDescripcionMomento(momentoSeleccionado);

  const opcionesHora = useMemo(() => opcionesHorasSegmentadas, []);

  const calendarioNormalizado = calendarioPorDia || {};

  const bloquesRegistrados = useMemo(
    () =>
      diasSemanaOrdenados.flatMap((dia) => calendarioNormalizado[dia] || []),
    [calendarioPorDia]
  );

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

  const mensajeDuraciones = useMemo(() => {
    const lista = Array.isArray(duracionesPermitidas)
      ? duracionesPermitidas.slice().sort((a, b) => a - b)
      : [];

    if (lista.length === 0) {
      return "Respeta los segmentos de 20 minutos y finaliza antes del mediodía.";
    }

    const textoLista = lista.map((valor) => `${valor} min`).join(", ");

    if (esEspecialistaSeleccionado) {
      return `Especialistas: bloques permitidos de ${textoLista}.`;
    }

    return `Docentes de aula: bloques permitidos de ${textoLista}.`;
  }, [duracionesPermitidas, esEspecialistaSeleccionado]);

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
    <VentanaModal
      isOpen={abierto}
      onClose={alCerrar}
      title="Crear horario"
      size="lg"
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
                  {`Grado ${aula.grado ?? ""} - Sección ${aula.seccion ?? ""}`}
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
              <p className={horariosFormClasses.error}>{errores.fk_momento}</p>
            ) : (
              <p className={horariosFormClasses.helper}>
                El rango de fechas se basa en el momento activo del año escolar
                elegido; se asigna automáticamente según el grado.
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
            <label className={horariosFormClasses.label} htmlFor="fk_personal">
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
              <p className={horariosFormClasses.error}>{errores.fk_personal}</p>
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
              <p className={horariosFormClasses.error}>{errores.dia_semana}</p>
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
            <select
              id="grupo"
              name="grupo"
              value={formulario.grupo}
              onChange={onCambio}
              className={
                errores.grupo
                  ? horariosFormClasses.selectInvalid
                  : horariosFormClasses.select
              }
              required
            >
              <option value="completo">Grupo completo</option>
              <option value="subgrupo">Subgrupo</option>
            </select>
            {errores.grupo ? (
              <p className={horariosFormClasses.error}>{errores.grupo}</p>
            ) : (
              <p className={horariosFormClasses.helper}>
                Los horarios grupales solo pueden crearse con cuentas de
                dirección.
              </p>
            )}
          </div>
        </div>

        <div className={horariosFormClasses.grid}>
          <div className={horariosFormClasses.fieldWrapper}>
            <label className={horariosFormClasses.label} htmlFor="hora_inicio">
              Hora de inicio
            </label>
            <input
              type="text"
              id="hora_inicio"
              name="hora_inicio"
              value={formulario.hora_inicio}
              onChange={onCambio}
              onBlur={onBlurHora}
              className={
                errores.hora_inicio || errores.horario || errores.duracion
                  ? horariosFormClasses.inputInvalid
                  : horariosFormClasses.input
              }
              inputMode="numeric"
              autoComplete="off"
              placeholder="hh:mm"
              list="horarios-academicos"
              maxLength={5}
              required
            />
            {errores.hora_inicio ? (
              <p className={horariosFormClasses.error}>{errores.hora_inicio}</p>
            ) : (
              <p className={horariosFormClasses.helper}>
                Ajusta el bloque a la lista sugerida: comienzan 7:40 a. m. y
                avanzan cada 20 minutos.
              </p>
            )}
          </div>

          <div className={horariosFormClasses.fieldWrapper}>
            <label className={horariosFormClasses.label} htmlFor="hora_fin">
              Hora de finalización
            </label>
            <input
              type="text"
              id="hora_fin"
              name="hora_fin"
              value={formulario.hora_fin}
              onChange={onCambio}
              onBlur={onBlurHora}
              className={
                errores.hora_fin || errores.horario || errores.duracion
                  ? horariosFormClasses.inputInvalid
                  : horariosFormClasses.input
              }
              inputMode="numeric"
              autoComplete="off"
              placeholder="hh:mm"
              list="horarios-academicos"
              maxLength={5}
              required
            />
            {errores.hora_fin ? (
              <p className={horariosFormClasses.error}>{errores.hora_fin}</p>
            ) : (
              <p className={horariosFormClasses.helper}>
                Finaliza antes del mediodía y respeta saltos de 20 minutos.
              </p>
            )}
          </div>
        </div>

        {errores.horario ? (
          <p className={horariosFormClasses.error}>{errores.horario}</p>
        ) : null}
        {errores.duracion ? (
          <p className={horariosFormClasses.error}>{errores.duracion}</p>
        ) : !errores.horario ? (
          <p className={horariosFormClasses.helper}>
            {mensajeDuraciones} Mantén los segmentos de 20 minutos y concluye
            antes de las 12:00 m.
          </p>
        ) : null}

        {formulario.grupo === "subgrupo" ? (
          <div className={horariosFormClasses.group}>
            <label className={horariosFormClasses.label} htmlFor="estudiantes">
              Estudiantes asignados
            </label>
            <select
              id="estudiantes"
              name="estudiantes"
              multiple
              value={formulario.estudiantes}
              onChange={onCambioEstudiantes}
              className={
                errores.estudiantes
                  ? horariosFormClasses.selectInvalid
                  : horariosFormClasses.select
              }
              disabled={estudiantesDisponibles.length === 0}
            >
              {estudiantesDisponibles.map((estudiante) => (
                <option key={estudiante.id} value={estudiante.id}>
                  {`${estudiante.nombre} — ${estudiante.cedula_escolar}`}
                </option>
              ))}
            </select>
            {errores.estudiantes ? (
              <p className={horariosFormClasses.error}>{errores.estudiantes}</p>
            ) : estudiantesDisponibles.length === 0 ? (
              <p className={horariosFormClasses.helper}>
                No se encontraron estudiantes activos para el aula seleccionada.
              </p>
            ) : (
              <p className={horariosFormClasses.helper}>
                Mantén presionada la tecla Ctrl o Shift para seleccionar
                múltiples estudiantes.
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
              emptyMessage="Aún no se han registrado bloques académicos para este aula."
              renderAcciones={renderAccionesBloque}
            />
          )}
        </div>

        <datalist id="horarios-academicos">
          {opcionesHora.map((hora) => (
            <option key={hora} value={hora} />
          ))}
        </datalist>

        <div className={horariosFormClasses.actions}>
          <button
            type="button"
            className={horariosFormClasses.ghostButton}
            onClick={alCerrar}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={horariosFormClasses.primaryButton}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Crear horario"}
          </button>
        </div>
      </form>
    </VentanaModal>
  );
};

export default ModalFormularioHorario;
