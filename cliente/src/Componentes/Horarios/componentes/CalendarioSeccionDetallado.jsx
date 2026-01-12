import React, { useMemo } from "react";
import {
  construirIntervalosSeccion,
  diasSemanaOrdenados,
  diasSemanaEtiquetas,
  formatearDuracionMinutos,
} from "../utilidadesHorarios";
import { horariosStatusClasses } from "../../EstilosCliente/EstilosClientes";

const CalendarioSeccionDetallado = ({ bloques = [], emptyMessage }) => {
  const intervalos = useMemo(
    () => construirIntervalosSeccion(bloques),
    [bloques]
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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0 rounded-3xl border border-slate-200 bg-white text-sm shadow-sm">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="border-b border-slate-200 bg-slate-100 px-4 py-3 text-center text-slate-600">
              Nº
            </th>
            <th className="border-b border-slate-200 bg-slate-100 px-4 py-3 text-slate-600">
              Desde
            </th>
            <th className="border-b border-slate-200 bg-slate-100 px-4 py-3 text-slate-600">
              Hasta
            </th>
            <th className="border-b border-slate-200 bg-slate-100 px-4 py-3 text-slate-600">
              Tiempo (min.)
            </th>
            {diasSemanaOrdenados.map((dia) => (
              <th
                key={dia}
                className="border-b border-slate-200 bg-slate-100 px-4 py-3 text-slate-600"
              >
                {diasSemanaEtiquetas[dia]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {intervalos.map((intervalo, indice) => (
            <tr
              key={`${
                intervalo.numero ?? intervalo.desdeTexto ?? "extra"
              }-${indice}`}
              className="text-sm text-slate-700"
            >
              <td className="border-t border-slate-100 px-4 py-3 text-center font-semibold text-slate-600">
                {intervalo.numero ?? String(indice + 1).padStart(2, "0")}
              </td>
              <td className="border-t border-slate-100 px-4 py-3 font-medium text-slate-700">
                {intervalo.desdeTexto}
              </td>
              <td className="border-t border-slate-100 px-4 py-3 font-medium text-slate-700">
                {intervalo.hastaTexto}
              </td>
              <td className="border-t border-slate-100 px-4 py-3 font-medium text-slate-700">
                {intervalo.duracionTexto ||
                  formatearDuracionMinutos(intervalo.duracionMinutos)}
              </td>
              {diasSemanaOrdenados.map((dia) => {
                const keyBase = `${
                  intervalo.numero ?? intervalo.desdeTexto ?? "extra"
                }-${dia}`;

                if (spansRestantes[dia] > 0) {
                  spansRestantes[dia] -= 1;
                  return <React.Fragment key={keyBase} />;
                }

                const bloquesDia = intervalo.bloquesPorDia[dia] || [];
                const bloquesInicio = bloquesDia.filter(
                  (bloque) =>
                    bloque?.segmentoIndice === 0 ||
                    bloque?.segmentoIndice === null ||
                    typeof bloque?.segmentoIndice === "undefined"
                );

                if (bloquesInicio.length === 0) {
                  if (bloquesDia.length > 0) {
                    return <React.Fragment key={keyBase} />;
                  }

                  return (
                    <td
                      key={keyBase}
                      className="border-t border-slate-100 px-4 py-3 align-top"
                    >
                      <span className="text-xs text-slate-400">
                        Sin asignación
                      </span>
                    </td>
                  );
                }

                const rowspan = Math.max(
                  1,
                  ...bloquesInicio.map((bloque) =>
                    Number.isFinite(bloque?.segmentoTotal)
                      ? bloque.segmentoTotal
                      : 1
                  )
                );

                if (rowspan > 1) {
                  spansRestantes[dia] = rowspan - 1;
                }

                return (
                  <td
                    key={keyBase}
                    rowSpan={rowspan}
                    className="border-t border-slate-100 px-4 py-3 align-top"
                  >
                    <div className="space-y-2">
                      {bloquesInicio.map((bloque, idx) => {
                        const duracionMin = Number.isFinite(
                          bloque?.bloqueDuracionMin
                        )
                          ? bloque.bloqueDuracionMin
                          : null;
                        const horaInicioTexto =
                          bloque?.bloqueInicioTexto ||
                          bloque?.segmentoInicioTexto ||
                          "—";
                        const horaFinTexto =
                          bloque?.bloqueFinTexto ||
                          bloque?.segmentoFinTexto ||
                          "—";

                        return (
                          <div
                            key={`${bloque?.id_horario ?? idx}-${dia}`}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center shadow-sm"
                          >
                            <p className="text-sm font-semibold text-slate-800">
                              {bloque?.nombre_componente ?? "Sin componente"}
                            </p>
                            {duracionMin !== null ? (
                              <p className="mt-1 text-xs font-semibold text-slate-500">
                                {`Duración: ${duracionMin} min`}
                              </p>
                            ) : null}
                            <p className="mt-1 text-xs font-medium text-slate-500">
                              {`Inicio: ${horaInicioTexto} - Fin: ${horaFinTexto}`}
                            </p>
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
                          </div>
                        );
                      })}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CalendarioSeccionDetallado;
