import React from "react";
import {
  contenidosLayout,
  typography,
} from "../../EstilosCliente/EstilosClientes";
import {
  badgePlanClass,
  controlDeshabilitado,
  selectEncabezadoClass,
  selectTablaClass,
} from "../constantesRendimiento";
import { obtenerEtiquetaPlan } from "../helpersRendimiento";

export const TablaRendimientoAcademico = ({
  grid,
  literales,
  selecciones,
  permitidos,
  estaGuardando,
  onActualizar,
  onAplicarColumna,
}) => {
  if (!grid) {
    return (
      <section className={contenidosLayout.container}>
        <p className={`${typography.bodyMutedSm} text-center`}>
          Selecciona un componente y un aula para mostrar la matriz de
          evaluación.
        </p>
      </section>
    );
  }

  const indicadores = grid.indicadores ?? [];
  const estudiantes = grid.estudiantes ?? [];

  if (!indicadores.length || !estudiantes.length) {
    return (
      <section className={contenidosLayout.container}>
        <p className={`${typography.bodyMutedSm} text-center`}>
          No hay indicadores o estudiantes registrados para este contexto.
        </p>
      </section>
    );
  }

  const momento =
    grid.metadata?.momento?.nombre_momento ?? grid.metadata?.momento?.nombre;
  const componente = grid.metadata?.componente?.nombre_componente;
  const aula = grid.metadata?.aula?.descripcion ?? grid.metadata?.aula?.nombre;

  return (
    <section className={`${contenidosLayout.container} space-y-4`}>
      <header className="space-y-1">
        <h2 className={typography.titleSm}>Matriz de calificación</h2>
        <p className={typography.bodyMutedSm}>
          Aplica una literal a todos los estudiantes desde el encabezado del
          indicador o ajusta los valores individualmente.
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          {componente ? <span>Componente: {componente}</span> : null}
          {aula ? <span>Aula: {aula}</span> : null}
          {momento ? <span>Momento: {momento}</span> : null}
        </div>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed border-collapse">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <th className="border-b border-slate-200 px-4 py-3">
                Estudiante
              </th>
              {indicadores.map((indicador) => {
                const id = indicador.id_indicador;
                return (
                  <th
                    key={id}
                    className="border-b border-slate-200 px-4 py-3 align-top"
                  >
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-slate-600">
                        {indicador.nombre_indicador ?? `Indicador ${id}`}
                      </span>
                      <select
                        className={`${selectEncabezadoClass} ${controlDeshabilitado}`}
                        defaultValue=""
                        onChange={(event) => {
                          onAplicarColumna(id, event.target.value);
                          event.target.value = "";
                        }}
                        disabled={
                          estaGuardando || !literales || !literales.length
                        }
                      >
                        <option value="">Aplicar a todos</option>
                        {literales.map((letra) => (
                          <option key={letra} value={letra}>
                            {letra}
                          </option>
                        ))}
                      </select>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {estudiantes.map((estudiante) => {
              const estudianteKey = String(estudiante.id_estudiante ?? "");
              if (!estudianteKey) {
                return null;
              }
              const indicadoresSeleccionados = selecciones[estudianteKey] ?? {};
              const permitidosEstudiante = permitidos[estudianteKey];
              const planLabel = obtenerEtiquetaPlan(estudiante.planificacion);
              return (
                <tr key={estudianteKey} className="border-b border-slate-100">
                  <td className="px-4 py-3 align-top">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-800">
                        {estudiante.nombre}
                      </p>
                      <span className={badgePlanClass}>{planLabel}</span>
                    </div>
                  </td>
                  {indicadores.map((indicador) => {
                    const indicadorKey = String(indicador.id_indicador ?? "");
                    const valor = indicadoresSeleccionados[indicadorKey] ?? "";
                    const habilitado = permitidosEstudiante
                      ? permitidosEstudiante.has(indicadorKey)
                      : true;
                    return (
                      <td
                        key={`${estudianteKey}-${indicadorKey}`}
                        className="px-4 py-3 align-top"
                      >
                        <select
                          value={valor}
                          className={`${selectTablaClass} ${controlDeshabilitado}`}
                          onChange={(event) =>
                            onActualizar(
                              estudiante.id_estudiante,
                              indicador.id_indicador,
                              event.target.value
                            )
                          }
                          disabled={estaGuardando || !habilitado}
                        >
                          <option value="">Sin definir</option>
                          {literales.map((letra) => (
                            <option key={letra} value={letra}>
                              {letra}
                            </option>
                          ))}
                        </select>
                        {!habilitado ? (
                          <p className="mt-2 text-xs text-slate-400">
                            Este indicador no está habilitado para el
                            estudiante.
                          </p>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
