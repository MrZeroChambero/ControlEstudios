import React from "react";
import { PlanificacionCompleta } from "./PlanificacionCompleta";

export const SeccionCompetencias = ({
  competenciasDisponibles,
  cargandoCompetencias,
  selectedCompetencies,
  selectedCompetencyGroups,
  totalSelectedCompetencies,
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
              const seleccionado = Array.isArray(selectedCompetencies)
                ? selectedCompetencies.some(
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
            {totalSelectedCompetencies > 0 && (
              <span className="text-xs text-slate-500">
                {totalSelectedCompetencies} seleccionada(s)
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
        {totalSelectedCompetencies === 0 ? (
          <p className="text-sm text-slate-500">
            Seleccione al menos una competencia para comenzar a planificar.
          </p>
        ) : (
          <PlanificacionCompleta
            selectedCompetencyGroups={selectedCompetencyGroups}
            competenciaCardClase={competenciaCardClase}
            indicadorRowClase={indicadorRowClase}
            alEditarCompetencia={alEditarCompetencia}
            alEliminarCompetencia={alEliminarCompetencia}
            alRetirarCompetencia={alRetirarCompetencia}
            alEditarIndicador={alEditarIndicador}
            alEliminarIndicador={alEliminarIndicador}
            accionesCompetenciaDeshabilitadas={
              accionesCompetenciaDeshabilitadas
            }
          />
        )}
      </div>
    </section>
  );
};
