import React from "react";

export const PlanificacionCompleta = ({
  competenciasSeleccionadasPorComponente,
  competenciaCardClase,
  indicadorRowClase,
  alEditarCompetencia,
  alEliminarCompetencia,
  alRetirarCompetencia,
  alEditarIndicador,
  alEliminarIndicador,
  accionesCompetenciaDeshabilitadas,
}) => {
  return (
    <div className="space-y-4">
      {competenciasSeleccionadasPorComponente.map((grupo) => (
        <article key={grupo.clave} className={competenciaCardClase}>
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <p className="text-base font-semibold text-slate-700">
              Planificación de: {grupo.componenteLabel}
            </p>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {grupo.competencias.length} competencia(s)
            </span>
          </header>
          <div className="space-y-4 px-4 py-4">
            {grupo.competencias.map((competencia) => (
              <div
                key={competencia.id}
                className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-700">
                      {competencia.nombre}
                    </p>
                    {competencia.descripcion && (
                      <p className="text-sm text-slate-500">
                        {competencia.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => alEditarCompetencia(competencia)}
                      disabled={accionesCompetenciaDeshabilitadas}
                    >
                      Modificar
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => alEliminarCompetencia(competencia)}
                      disabled={accionesCompetenciaDeshabilitadas}
                    >
                      Eliminar
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() =>
                        alRetirarCompetencia(
                          competencia.id,
                          competencia.componenteId
                        )
                      }
                      disabled={accionesCompetenciaDeshabilitadas}
                    >
                      Quitar de la planificación
                    </button>
                  </div>
                </div>
                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Indicadores
                  </p>
                  {competencia.indicadores.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Esta competencia no tiene indicadores asociados.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {competencia.indicadores.map((indicador) => (
                        <div key={indicador.id} className={indicadorRowClase}>
                          <div>
                            <p className="font-medium text-slate-700">
                              {indicador.nombre}
                            </p>
                            <p className="text-xs text-slate-500">
                              {indicador.aspecto
                                ? `Aspecto: ${indicador.aspecto}`
                                : "Sin aspecto definido"}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
                              onClick={() =>
                                alEditarIndicador(competencia, indicador)
                              }
                              disabled={accionesCompetenciaDeshabilitadas}
                            >
                              Modificar
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
                              onClick={() => alEliminarIndicador(indicador)}
                              disabled={accionesCompetenciaDeshabilitadas}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
};
