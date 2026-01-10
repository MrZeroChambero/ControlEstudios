import React from "react";

export const SeccionCompetencias = ({
  competenciasDisponibles,
  cargandoCompetencias,
  competenciasSeleccionadas,
  competenciasSeleccionadasPorComponente,
  totalCompetenciasSeleccionadas,
  gestionCompetenciasCargando,
  competenciaItemBase,
  competenciaItemActivo,
  competenciaCardClase,
  indicadorRowClase,
  puedeConsultarPlanificaciones,
  alAbrirModalPlanificaciones,
  alAlternarCompetencia,
  alEditarCompetencia,
  alEliminarCompetencia,
  alRetirarCompetencia,
  alEditarIndicador,
  alEliminarIndicador,
  accionesCompetenciaDeshabilitadas,
  competenciaMetaPillClass,
}) => {
  return (
    <section className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Competencias disponibles
          </h3>
          {gestionCompetenciasCargando && (
            <span className="text-xs font-semibold text-indigo-600">
              Aplicando cambios...
            </span>
          )}
        </div>
        {cargandoCompetencias ? (
          <p className="text-sm text-slate-500">Cargando competencias...</p>
        ) : competenciasDisponibles.length === 0 ? (
          <p className="text-sm text-slate-500">
            No hay competencias registradas para el componente seleccionado.
          </p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {competenciasDisponibles.map((competencia) => {
              const seleccionado = Array.isArray(competenciasSeleccionadas)
                ? competenciasSeleccionadas.some(
                    (id) => String(id) === String(competencia.id)
                  )
                : Boolean(competencia.seleccionado);
              return (
                <label
                  key={competencia.id}
                  className={`${competenciaItemBase} ${
                    seleccionado ? competenciaItemActivo : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={seleccionado}
                    onChange={() => alAlternarCompetencia(competencia.id)}
                  />
                  <span className="flex flex-col gap-1 text-left">
                    <span className="text-sm font-semibold text-slate-700">
                      {competencia.nombre}
                    </span>
                    {competencia.descripcion && (
                      <span className="text-xs text-slate-500">
                        {competencia.descripcion}
                      </span>
                    )}
                    {(competencia.area ||
                      competencia.componente ||
                      competencia.reutilizable) && (
                      <span className="mt-1 flex flex-wrap gap-2">
                        {competencia.area && (
                          <span
                            className={`${competenciaMetaPillClass} bg-slate-100 text-slate-600`}
                          >
                            Área: {competencia.area}
                          </span>
                        )}
                        {competencia.componente && (
                          <span
                            className={`${competenciaMetaPillClass} bg-slate-100 text-slate-600`}
                          >
                            Componente: {competencia.componente}
                          </span>
                        )}
                        {competencia.reutilizable && (
                          <span
                            className={`${competenciaMetaPillClass} ${
                              competencia.reutilizable === "si"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-600"
                            }`}
                          >
                            {competencia.reutilizable === "si"
                              ? "Reutilizable"
                              : "No reutilizable"}
                          </span>
                        )}
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        )}
        <p className="text-xs text-slate-500">
          Puede seleccionar hasta 10 competencias. Si necesita asociar más
          indicadores, considere dividir la planificación.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Competencias seleccionadas
            </h4>
            {totalCompetenciasSeleccionadas > 0 && (
              <span className="text-xs text-slate-500">
                {totalCompetenciasSeleccionadas} seleccionada(s)
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={alAbrirModalPlanificaciones}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
              disabled={!puedeConsultarPlanificaciones}
            >
              Planificaciones por componente
            </button>
          </div>
        </div>
        {totalCompetenciasSeleccionadas === 0 ? (
          <p className="text-sm text-slate-500">
            Seleccione al menos una competencia para comenzar a planificar.
          </p>
        ) : (
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
                              <div
                                key={indicador.id}
                                className={indicadorRowClase}
                              >
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
                                    onClick={() =>
                                      alEliminarIndicador(indicador)
                                    }
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
        )}
      </div>
    </section>
  );
};
