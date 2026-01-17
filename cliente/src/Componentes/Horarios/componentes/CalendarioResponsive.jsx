import React, { useMemo } from "react";
import {
  construirCalendarioDesdeBloques,
  diasSemanaOrdenados,
  diasSemanaEtiquetas,
} from "../utilidadesHorarios";
import { filtrarBloquesClase } from "../config/bloquesHorario";
import { calendarioResponsiveClases } from "./horariosEstilos";

const CalendarioResponsive = ({
  bloques = [],
  emptyMessage,
  renderBloque,
  bloquesConfig,
}) => {
  const bloquesFiltrados = useMemo(
    () => filtrarBloquesClase(bloques, bloquesConfig),
    [bloques, bloquesConfig]
  );

  const calendario = useMemo(
    () => construirCalendarioDesdeBloques(bloquesFiltrados),
    [bloquesFiltrados]
  );

  return (
    <div className={calendarioResponsiveClases.grid}>
      {diasSemanaOrdenados.map((dia) => {
        const bloquesDia = calendario[dia] ?? [];
        return (
          <div key={dia} className={calendarioResponsiveClases.card}>
            <p className={calendarioResponsiveClases.diaTitulo}>
              {diasSemanaEtiquetas[dia]}
            </p>
            <div className={calendarioResponsiveClases.bloquesWrapper}>
              {bloquesDia.length === 0 ? (
                <p className={calendarioResponsiveClases.mensajeVacio}>
                  {emptyMessage || "Sin bloques programados."}
                </p>
              ) : (
                bloquesDia.map((bloque, indice) => (
                  <div
                    key={`${bloque?.id_horario ?? indice}-${indice}`}
                    className={calendarioResponsiveClases.bloqueCard}
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
