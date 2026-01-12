import React, { useMemo } from "react";
import { FaEye, FaTrash } from "react-icons/fa";
import {
  construirIntervalosSeccion,
  diasSemanaOrdenados,
  diasSemanaEtiquetas,
} from "../utilidadesHorarios";
import {
  horariosStatusClasses,
  horariosTableClasses,
  horariosIconClasses,
} from "../../EstilosCliente/EstilosClientes";

const formatearEtiquetaSeccion = (grado, seccion) => {
  const gradoTexto =
    typeof grado === "number" || typeof grado === "string"
      ? String(grado).trim()
      : "";
  const seccionTexto =
    typeof seccion === "number" || typeof seccion === "string"
      ? String(seccion).trim().toUpperCase()
      : "";

  if (!gradoTexto && !seccionTexto) {
    return null;
  }

  if (!gradoTexto || !seccionTexto) {
    return `${gradoTexto || "?"}"${seccionTexto || "?"}`;
  }

  return `${gradoTexto}"${seccionTexto}"`;
};

const obtenerDuracionMinutos = (bloque) => {
  const candidatos = [
    bloque?.bloqueDuracionMin,
    bloque?.duracion,
    bloque?.duracionMinutos,
    bloque?.duracion_minutos,
  ]
    .map((valor) => {
      const numero = Number(valor);
      return Number.isFinite(numero) && numero > 0 ? numero : null;
    })
    .filter((valor) => valor !== null);

  if (candidatos.length > 0) {
    return candidatos[0];
  }

  const inicio = Number(bloque?.segmentoInicioMin);
  const fin = Number(bloque?.segmentoFinMin);

  if (Number.isFinite(inicio) && Number.isFinite(fin) && fin > inicio) {
    return fin - inicio;
  }

  return null;
};

const CalendarioDocenteDetallado = ({
  bloques = [],
  emptyMessage,
  onVerDetalle,
  onEliminar,
}) => {
  const intervalos = useMemo(
    () => construirIntervalosSeccion(bloques),
    [bloques]
  );

  const spansRestantes = diasSemanaOrdenados.reduce((acumulado, dia) => {
    acumulado[dia] = 0;
    return acumulado;
  }, {});

  if (intervalos.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        {emptyMessage || "Sin clases registradas para este docente."}
      </p>
    );
  }

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
                {intervalo.duracionTexto}
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
                        const duracionMin = obtenerDuracionMinutos(bloque);
                        const etiquetaSeccion = formatearEtiquetaSeccion(
                          bloque?.grado,
                          bloque?.seccion
                        );
                        const aulaTexto =
                          bloque?.nombre_aula ||
                          bloque?.aula ||
                          bloque?.nombre_grado ||
                          null;
                        const horaInicio =
                          bloque?.bloqueInicioTexto ||
                          bloque?.segmentoInicioTexto ||
                          bloque?.hora_inicio_texto ||
                          bloque?.hora_inicio ||
                          "—";
                        const horaFin =
                          bloque?.bloqueFinTexto ||
                          bloque?.segmentoFinTexto ||
                          bloque?.hora_fin_texto ||
                          bloque?.hora_fin ||
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
                              {`Inicio: ${horaInicio} - Fin: ${horaFin}`}
                            </p>
                            {etiquetaSeccion ? (
                              <p className="mt-1 text-xs font-medium text-slate-500">
                                {`Sección: ${etiquetaSeccion}`}
                              </p>
                            ) : null}
                            <p className="mt-1 text-xs font-medium text-slate-500">
                              {`Momento: ${bloque?.nombre_momento ?? "-"}`}
                            </p>
                            {aulaTexto ? (
                              <p className="mt-1 text-xs text-slate-500">
                                {`Aula: ${aulaTexto}`}
                              </p>
                            ) : null}
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
                            {(onVerDetalle || onEliminar) && (
                              <div className="mt-3 flex justify-center gap-2">
                                {onVerDetalle ? (
                                  <button
                                    type="button"
                                    className={`${horariosTableClasses.actionButton} ${horariosTableClasses.viewButton}`}
                                    onClick={() => onVerDetalle(bloque)}
                                    title="Ver detalle del horario"
                                  >
                                    <FaEye
                                      className={horariosIconClasses.base}
                                    />
                                  </button>
                                ) : null}
                                {onEliminar ? (
                                  <button
                                    type="button"
                                    className={`${horariosTableClasses.actionButton} ${horariosTableClasses.deleteButton}`}
                                    onClick={() => onEliminar(bloque)}
                                    title="Eliminar horario"
                                  >
                                    <FaTrash
                                      className={horariosIconClasses.base}
                                    />
                                  </button>
                                ) : null}
                              </div>
                            )}
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

export default CalendarioDocenteDetallado;
