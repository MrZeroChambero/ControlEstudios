import React, { useMemo } from "react";
import {
  construirCalendarioDesdeBloques,
  diasSemanaOrdenados,
  diasSemanaEtiquetas,
} from "../utilidadesHorarios";

const CalendarioResponsive = ({ bloques = [], emptyMessage, renderBloque }) => {
  const calendario = useMemo(
    () => construirCalendarioDesdeBloques(bloques),
    [bloques]
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {diasSemanaOrdenados.map((dia) => {
        const bloquesDia = calendario[dia] ?? [];
        return (
          <div
            key={dia}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-700">
              {diasSemanaEtiquetas[dia]}
            </p>
            <div className="mt-3 space-y-3">
              {bloquesDia.length === 0 ? (
                <p className="text-xs text-slate-500">
                  {emptyMessage || "Sin bloques programados."}
                </p>
              ) : (
                bloquesDia.map((bloque, indice) => (
                  <div
                    key={`${bloque?.id_horario ?? indice}-${indice}`}
                    className="rounded-2xl bg-slate-50 p-3 shadow"
                  >
                    {renderBloque ? renderBloque(bloque) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CalendarioResponsive;
