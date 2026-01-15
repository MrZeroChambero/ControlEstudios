import React, { useMemo } from "react";
import {
  construirIntervalosSeccion,
  diasSemanaOrdenados,
  diasSemanaEtiquetas,
  formatearDuracionMinutos,
  formatearDocente,
} from "../utilidadesHorarios";
import { horariosStatusClasses } from "../../EstilosCliente/EstilosClientes";
import { tablaHorarioSemanalClases } from "./horariosEstilos";

const esBloqueInicial = (bloque) =>
  bloque?.segmentoIndice === 0 ||
  bloque?.segmentoIndice === null ||
  typeof bloque?.segmentoIndice === "undefined";

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

const TablaHorarioSemanal = ({
  bloques = [],
  bloquesFijos = [],
  emptyMessage,
  renderAcciones,
  renderContenidoBloque,
}) => {
  const dataset = useMemo(
    () => [...bloquesFijos, ...bloques],
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

  const spansRestantes = diasSemanaOrdenados.reduce((acc, dia) => {
    acc[dia] = 0;
    return acc;
  }, {});

  let spanGlobalRutina = 0;

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

            if (spanGlobalRutina > 0) {
              omitirColumnas = true;
              spanGlobalRutina -= 1;
            } else {
              rutinaUnificada = obtenerRutinaUnificada(intervalo);
              if (rutinaUnificada && rutinaUnificada.rowspan > 1) {
                spanGlobalRutina = rutinaUnificada.rowspan - 1;
              }
            }

            return (
              <tr
                key={`${
                  intervalo.numero ?? intervalo.desdeTexto ?? "extra"
                }-${indice}`}
                className="text-sm text-slate-700"
              >
                <td className={tablaHorarioSemanalClases.numeroCell}>
                  {intervalo.numero ?? String(indice + 1).padStart(2, "0")}
                </td>
                <td className={tablaHorarioSemanalClases.horarioCell}>
                  {intervalo.desdeTexto}
                </td>
                <td className={tablaHorarioSemanalClases.horarioCell}>
                  {intervalo.hastaTexto}
                </td>
                <td className={tablaHorarioSemanalClases.horarioCell}>
                  {intervalo.duracionTexto ||
                    formatearDuracionMinutos(intervalo.duracionMinutos)}
                </td>
                {rutinaUnificada ? (
                  <td
                    className={tablaHorarioSemanalClases.bloqueCell}
                    colSpan={diasSemanaOrdenados.length}
                    rowSpan={rutinaUnificada.rowspan}
                  >
                    <div className={tablaHorarioSemanalClases.rutinaCard}>
                      <p className="text-sm font-semibold text-slate-800">
                        {rutinaUnificada.bloque?.nombre_componente ||
                          "Rutina diaria"}
                      </p>
                      {rutinaUnificada.bloque?.descripcion_rutina ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {rutinaUnificada.bloque.descripcion_rutina}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {`Inicio: ${
                          rutinaUnificada.bloque?.bloqueInicioTexto ||
                          rutinaUnificada.bloque?.segmentoInicioTexto ||
                          rutinaUnificada.bloque?.hora_inicio ||
                          "—"
                        } - Fin: ${
                          rutinaUnificada.bloque?.bloqueFinTexto ||
                          rutinaUnificada.bloque?.segmentoFinTexto ||
                          rutinaUnificada.bloque?.hora_fin ||
                          "—"
                        }`}
                      </p>
                    </div>
                  </td>
                ) : omitirColumnas ? null : (
                  diasSemanaOrdenados.map((dia) => {
                    const keyBase = `${
                      intervalo.numero ?? intervalo.desdeTexto ?? "extra"
                    }-${dia}`;

                    if (spansRestantes[dia] > 0) {
                      spansRestantes[dia] -= 1;
                      return <React.Fragment key={keyBase} />;
                    }

                    const bloquesDia = intervalo.bloquesPorDia[dia] || [];
                    const bloquesInicio = bloquesDia.filter((bloque) =>
                      esBloqueInicial(bloque)
                    );

                    if (bloquesInicio.length === 0) {
                      if (bloquesDia.length > 0) {
                        return <React.Fragment key={keyBase} />;
                      }

                      return (
                        <td
                          key={keyBase}
                          className={tablaHorarioSemanalClases.bloqueCell}
                        >
                          <span
                            className={tablaHorarioSemanalClases.sinAsignacion}
                          >
                            Sin asignación
                          </span>
                        </td>
                      );
                    }

                    const rowspanDia = Math.max(
                      1,
                      ...bloquesInicio.map((bloque) =>
                        Number.isFinite(bloque?.segmentoTotal)
                          ? bloque.segmentoTotal
                          : 1
                      )
                    );

                    if (rowspanDia > 1) {
                      spansRestantes[dia] = rowspanDia - 1;
                    }

                    return (
                      <td
                        key={keyBase}
                        rowSpan={rowspanDia}
                        className={tablaHorarioSemanalClases.bloqueCell}
                      >
                        <div className="space-y-2">
                          {bloquesInicio.map((bloque, idx) => {
                            const esRutina = Boolean(bloque?.es_rutina);
                            const contextoBloque =
                              construirContextoBloque(bloque);
                            const contenidoPersonalizado =
                              !esRutina &&
                              typeof renderContenidoBloque === "function"
                                ? renderContenidoBloque(bloque, {
                                    ...contextoBloque,
                                    dia,
                                    indiceBloque: idx,
                                  })
                                : null;

                            return (
                              <div
                                key={`${bloque?.id_horario ?? idx}-${dia}`}
                                className={tablaHorarioSemanalClases.bloqueCard}
                              >
                                {esRutina ? (
                                  <>
                                    <p className="text-sm font-semibold text-slate-800">
                                      {bloque?.nombre_componente ??
                                        "Rutina diaria"}
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-slate-500">
                                      {`Inicio: ${contextoBloque.horaInicioTexto} - Fin: ${contextoBloque.horaFinTexto}`}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      {bloque?.descripcion_rutina ??
                                        "Rutina diaria"}
                                    </p>
                                  </>
                                ) : (
                                  contenidoPersonalizado ??
                                  renderContenidoDefault(bloque, contextoBloque)
                                )}
                                {!esRutina &&
                                typeof renderAcciones === "function" ? (
                                  <div
                                    className={
                                      tablaHorarioSemanalClases.accionesWrapper
                                    }
                                  >
                                    {renderAcciones(bloque)}
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TablaHorarioSemanal;
