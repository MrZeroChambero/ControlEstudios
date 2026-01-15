import React, { Fragment, useMemo } from "react";
import {
  construirIntervalosSeccion,
  diasSemanaOrdenados,
  diasSemanaEtiquetas,
  formatearDuracionMinutos,
  formatearDocente,
} from "../utilidadesHorarios";
import { horariosStatusClasses } from "../../EstilosCliente/EstilosClientes";
import { tablaHorarioSemanalClases } from "./horariosEstilos";

const unirBloquesSeccion = (bloquesFijos = [], bloques = []) => [
  ...bloquesFijos,
  ...bloques,
];

const crearRegistroSpansPendientes = () =>
  diasSemanaOrdenados.reduce((acc, dia) => {
    acc[dia] = 0;
    return acc;
  }, {});

const esBloqueInicial = (bloque) =>
  bloque?.segmentoIndice === 0 ||
  bloque?.segmentoIndice === null ||
  typeof bloque?.segmentoIndice === "undefined";

/**
 * Cuando todos los días comparten la misma rutina diaria, se muestra como una sola celda que
 * ocupa todo el ancho de la semana. Esta función valida la simetría y devuelve los datos listos
 * para pintar esa celda unificada.
 */
const obtenerRutinaUnificada = (intervalo) => {
  if (!intervalo) {
    return null;
  }

  const bloquesPorDia = diasSemanaOrdenados.map(
    (dia) => intervalo.bloquesPorDia[dia] || []
  );

  if (bloquesPorDia.some((lista) => lista.length === 0)) {
    return null;
  }

  const bloquesIniciales = bloquesPorDia.map((lista) =>
    lista.find((bloque) => esBloqueInicial(bloque))
  );

  if (bloquesIniciales.some((bloque) => !bloque || !bloque.es_rutina)) {
    return null;
  }

  const base = bloquesIniciales[0];
  const camposCoinciden = bloquesIniciales.every((bloque) => {
    if (!bloque) {
      return false;
    }

    const nombreCoincide =
      (bloque.nombre_componente || "") === (base.nombre_componente || "");
    const descripcionCoincide =
      (bloque.descripcion_rutina || "") === (base.descripcion_rutina || "");
    const inicioCoincide =
      (bloque.hora_inicio || bloque.bloqueInicioTexto || "") ===
      (base.hora_inicio || base.bloqueInicioTexto || "");
    const finCoincide =
      (bloque.hora_fin || bloque.bloqueFinTexto || "") ===
      (base.hora_fin || base.bloqueFinTexto || "");
    const segmentosCoinciden =
      (bloque.segmentoTotal || 1) === (base.segmentoTotal || 1);

    return (
      nombreCoincide &&
      descripcionCoincide &&
      inicioCoincide &&
      finCoincide &&
      segmentosCoinciden
    );
  });

  if (!camposCoinciden) {
    return null;
  }

  const rowspan =
    Number.isFinite(base.segmentoTotal) && base.segmentoTotal > 1
      ? base.segmentoTotal
      : 1;

  return {
    bloque: base,
    rowspan,
  };
};

const construirContextoBloque = (bloque) => {
  const duracionMin = Number.isFinite(bloque?.bloqueDuracionMin)
    ? bloque.bloqueDuracionMin
    : null;
  const horaInicioTexto =
    bloque?.bloqueInicioTexto ||
    bloque?.segmentoInicioTexto ||
    bloque?.hora_inicio ||
    "—";
  const horaFinTexto =
    bloque?.bloqueFinTexto ||
    bloque?.segmentoFinTexto ||
    bloque?.hora_fin ||
    "—";
  const docenteTexto = formatearDocente(bloque) || "Docente sin definir";

  return {
    duracionMin,
    horaInicioTexto,
    horaFinTexto,
    docenteTexto,
  };
};

const renderContenidoDefault = (bloque, contexto) => (
  <>
    <p className="text-sm font-semibold text-slate-800">
      {bloque?.nombre_componente ?? "Sin componente"}
    </p>
    {contexto.duracionMin !== null ? (
      <p className="mt-1 text-xs font-semibold text-slate-500">
        {`Duración: ${contexto.duracionMin} min`}
      </p>
    ) : null}
    <p className="mt-1 text-xs font-medium text-slate-500">
      {`Inicio: ${contexto.horaInicioTexto} - Fin: ${contexto.horaFinTexto}`}
    </p>
    <p className="mt-2 text-xs text-slate-500">{contexto.docenteTexto}</p>
    <div className="mt-2 flex justify-center">
      <span
        className={`${horariosStatusClasses.base} ${
          bloque?.grupo === "completo"
            ? horariosStatusClasses.completo
            : horariosStatusClasses.subgrupo
        }`}
      >
        {bloque?.grupo ?? "N/D"}
      </span>
    </div>
  </>
);

const renderRutinaCelda = (rutinaUnificada) => {
  const inicioTexto =
    rutinaUnificada.bloque?.bloqueInicioTexto ||
    rutinaUnificada.bloque?.segmentoInicioTexto ||
    rutinaUnificada.bloque?.hora_inicio ||
    "—";
  const finTexto =
    rutinaUnificada.bloque?.bloqueFinTexto ||
    rutinaUnificada.bloque?.segmentoFinTexto ||
    rutinaUnificada.bloque?.hora_fin ||
    "—";

  return (
    <td
      className={tablaHorarioSemanalClases.bloqueCell}
      colSpan={diasSemanaOrdenados.length}
      rowSpan={rutinaUnificada.rowspan}
    >
      <div className={tablaHorarioSemanalClases.rutinaCard}>
        <p className="text-sm font-semibold text-slate-800">
          {rutinaUnificada.bloque?.nombre_componente || "Rutina diaria"}
        </p>
        {rutinaUnificada.bloque?.descripcion_rutina ? (
          <p className="mt-1 text-xs text-slate-500">
            {rutinaUnificada.bloque.descripcion_rutina}
          </p>
        ) : null}
        <p className="mt-1 text-xs font-medium text-slate-500">
          {`Inicio: ${inicioTexto} - Fin: ${finTexto}`}
        </p>
      </div>
    </td>
  );
};

const renderBloqueTarjeta = ({
  bloque,
  dia,
  indiceBloque,
  renderContenidoBloque,
  renderAcciones,
}) => {
  const esRutina = Boolean(bloque?.es_rutina);
  const contexto = construirContextoBloque(bloque);
  const contenidoPersonalizado =
    !esRutina && typeof renderContenidoBloque === "function"
      ? renderContenidoBloque(bloque, {
          ...contexto,
          dia,
          indiceBloque,
        })
      : null;

  return (
    <div
      key={`${bloque?.id_horario ?? indiceBloque}-${dia}`}
      className={tablaHorarioSemanalClases.bloqueCard}
    >
      {esRutina ? (
        <>
          <p className="text-sm font-semibold text-slate-800">
            {bloque?.nombre_componente ?? "Rutina diaria"}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {`Inicio: ${contexto.horaInicioTexto} - Fin: ${contexto.horaFinTexto}`}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {bloque?.descripcion_rutina ?? ""}
          </p>
        </>
      ) : (
        contenidoPersonalizado ?? renderContenidoDefault(bloque, contexto)
      )}
      {!esRutina && typeof renderAcciones === "function" ? (
        <div className={tablaHorarioSemanalClases.accionesWrapper}>
          {renderAcciones(bloque)}
        </div>
      ) : null}
    </div>
  );
};

const renderCeldaDia = ({
  dia,
  intervalo,
  spansPendientesPorDia,
  renderContenidoBloque,
  renderAcciones,
}) => {
  const keyBase = `${
    intervalo.numero ?? intervalo.desdeTexto ?? "extra"
  }-${dia}`;

  if (spansPendientesPorDia[dia] > 0) {
    spansPendientesPorDia[dia] -= 1;
    return <Fragment key={keyBase} />;
  }

  const bloquesDia = intervalo.bloquesPorDia[dia] || [];
  const bloquesInicio = bloquesDia.filter((bloque) => esBloqueInicial(bloque));

  if (bloquesInicio.length === 0) {
    if (bloquesDia.length > 0) {
      return <Fragment key={keyBase} />;
    }

    return (
      <td key={keyBase} className={tablaHorarioSemanalClases.bloqueCell}>
        <span className={tablaHorarioSemanalClases.sinAsignacion}>
          Sin asignación
        </span>
      </td>
    );
  }

  const rowspanDia = Math.max(
    1,
    ...bloquesInicio.map((bloque) =>
      Number.isFinite(bloque?.segmentoTotal) ? bloque.segmentoTotal : 1
    )
  );

  if (rowspanDia > 1) {
    spansPendientesPorDia[dia] = rowspanDia - 1;
  }

  return (
    <td
      key={keyBase}
      rowSpan={rowspanDia}
      className={tablaHorarioSemanalClases.bloqueCell}
    >
      <div className="space-y-2">
        {bloquesInicio.map((bloque, indiceBloque) =>
          renderBloqueTarjeta({
            bloque,
            dia,
            indiceBloque,
            renderContenidoBloque,
            renderAcciones,
          })
        )}
      </div>
    </td>
  );
};

const renderCeldasDias = ({
  intervalo,
  spansPendientesPorDia,
  renderContenidoBloque,
  renderAcciones,
}) =>
  diasSemanaOrdenados.map((dia) =>
    renderCeldaDia({
      dia,
      intervalo,
      spansPendientesPorDia,
      renderContenidoBloque,
      renderAcciones,
    })
  );

const TablaHorarioSemanal = ({
  bloques = [],
  bloquesFijos = [],
  emptyMessage,
  renderAcciones,
  renderContenidoBloque,
}) => {
  const dataset = useMemo(
    () => unirBloquesSeccion(bloquesFijos, bloques),
    [bloquesFijos, bloques]
  );

  const intervalos = useMemo(
    () => construirIntervalosSeccion(dataset),
    [dataset]
  );

  if (intervalos.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        {emptyMessage || "Sin bloques registrados para esta sección."}
      </p>
    );
  }

  const spansPendientesPorDia = crearRegistroSpansPendientes();
  let filasRutinaPendientes = 0;

  return (
    <div className={tablaHorarioSemanalClases.wrapper}>
      <table className={tablaHorarioSemanalClases.table}>
        <thead>
          <tr className={tablaHorarioSemanalClases.headRow}>
            <th className={tablaHorarioSemanalClases.headCellCenter}>Nº</th>
            <th className={tablaHorarioSemanalClases.headCell}>Desde</th>
            <th className={tablaHorarioSemanalClases.headCell}>Hasta</th>
            <th className={tablaHorarioSemanalClases.headCell}>
              Tiempo (min.)
            </th>
            {diasSemanaOrdenados.map((dia) => (
              <th key={dia} className={tablaHorarioSemanalClases.headCell}>
                {diasSemanaEtiquetas[dia]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {intervalos.map((intervalo, indice) => {
            let rutinaUnificada = null;
            let omitirColumnas = false;

            if (filasRutinaPendientes > 0) {
              omitirColumnas = true;
              filasRutinaPendientes -= 1;
            } else {
              rutinaUnificada = obtenerRutinaUnificada(intervalo);
              if (rutinaUnificada && rutinaUnificada.rowspan > 1) {
                filasRutinaPendientes = rutinaUnificada.rowspan - 1;
              }
            }

            const numeroTexto = intervalo.numero
              ? intervalo.numero
              : String(indice + 1).padStart(2, "0");
            const desdeTexto = intervalo.desdeTexto || "—";
            const hastaTexto = intervalo.hastaTexto || "—";
            const duracionTexto = Number.isFinite(intervalo.duracionMinutos)
              ? formatearDuracionMinutos(intervalo.duracionMinutos)
              : intervalo.duracionTexto || "—";

            return (
              <tr
                key={`${
                  intervalo.numero ?? intervalo.desdeTexto ?? "extra"
                }-${indice}`}
                className="text-sm text-slate-700"
              >
                <td className={tablaHorarioSemanalClases.numeroCell}>
                  {numeroTexto}
                </td>
                <td className={tablaHorarioSemanalClases.horarioCell}>
                  {desdeTexto}
                </td>
                <td className={tablaHorarioSemanalClases.horarioCell}>
                  {hastaTexto}
                </td>
                <td className={tablaHorarioSemanalClases.horarioCell}>
                  {duracionTexto}
                </td>
                {omitirColumnas
                  ? null
                  : rutinaUnificada
                  ? renderRutinaCelda(rutinaUnificada)
                  : renderCeldasDias({
                      intervalo,
                      spansPendientesPorDia,
                      renderContenidoBloque,
                      renderAcciones,
                    })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TablaHorarioSemanal;
