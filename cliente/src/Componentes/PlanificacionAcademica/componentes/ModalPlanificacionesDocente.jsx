import React from "react";
import VentanaModal from "../../EstilosCliente/VentanaModal";

export const ModalPlanificacionesDocente = ({
  abierta,
  alCerrar,
  docenteSeleccionado,
  momentoSeleccionadoLabel,
  estadoModal,
  puedeConsultarPlanificaciones,
  alRefrescar,
  planificacionesAgrupadas,
  alAgregarPlanificacion,
  alModificarPlanificacion,
  alEliminarPlanificacion,
}) => {
  return (
    <VentanaModal
      isOpen={abierta}
      onClose={alCerrar}
      title="Planificaciones por componente"
      size="lg"
      bodyClassName="space-y-4"
    >
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <p className="font-semibold text-slate-700">
          Docente: {docenteSeleccionado?.baseLabel ?? "Sin seleccionar"}
        </p>
        <p className="text-xs text-slate-500">
          Momento: {momentoSeleccionadoLabel}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={alRefrescar}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
            disabled={estadoModal.cargando || !puedeConsultarPlanificaciones}
          >
            Actualizar listado
          </button>
        </div>
      </div>

      {estadoModal.error && (
        <p className="text-xs font-semibold text-rose-600">
          {estadoModal.error}
        </p>
      )}

      {estadoModal.cargando ? (
        <p className="text-sm text-slate-500">
          Consultando planificaciones registradas...
        </p>
      ) : planificacionesAgrupadas.length === 0 ? (
        <p className="text-sm text-slate-500">
          No se encontraron planificaciones para las asignaciones actuales.
        </p>
      ) : (
        planificacionesAgrupadas.map((grupo) => (
          <article
            key={grupo.clave}
            className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Planificación de:
                </p>
                <p className="text-base font-semibold text-slate-700">
                  {grupo.componenteLabel}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {grupo.planificaciones.length} plan(es)
              </span>
            </header>

            {grupo.planificaciones.length ? (
              <div className="space-y-2">
                {grupo.planificaciones.map((plan) => (
                  <div
                    key={plan.id_planificacion}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-700">
                        #{plan.id_planificacion}
                      </p>
                      <p className="text-xs text-slate-500">
                        Tipo:{" "}
                        {plan.tipo === "individual" ? "Individual" : "Aula"} ·
                        Estado:{" "}
                        {plan.estado === "activo" ? "Activo" : "Inactivo"} ·{" "}
                        {plan.competencias?.length ?? 0} competencias ·{" "}
                        {plan.estudiantes?.length ?? 0} estudiantes
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        onClick={() => alModificarPlanificacion(plan)}
                      >
                        Modificar
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-400 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
                        onClick={() => alEliminarPlanificacion(plan)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No hay planificaciones registradas para este componente.
              </p>
            )}

            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-indigo-600 px-3 py-1 text-xs font-semibold text-white transition hover:border-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => alAgregarPlanificacion(grupo.componenteId)}
                disabled={
                  grupo.componenteId === null || !puedeConsultarPlanificaciones
                }
              >
                Agregar planificación
              </button>
            </div>
          </article>
        ))
      )}
    </VentanaModal>
  );
};
