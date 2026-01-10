import React from "react";

export const PanelContextoActual = ({
  contexto,
  modo,
  bloqueado,
  cargandoAsignacion,
  asignacion,
  descripcionAulaAsignada,
  resumenComponentesAsignados,
}) => {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
        Contexto actual
      </p>
      <p className="mt-1 font-semibold text-slate-700">
        {contexto?.momento?.nombre ??
          contexto?.momento?.momento_nombre ??
          contexto?.momento?.nombre_momento ??
          "Sin momento asignado"}
      </p>
      <p className="mt-2 text-xs text-slate-500">
        {modo === "clonar"
          ? "Se generará una nueva planificación basada en la selección indicada."
          : "Selecciona los catálogos y competencias para esta planificación."}
      </p>
      {bloqueado && (
        <p className="mt-2 text-xs font-semibold text-amber-600">{bloqueado}</p>
      )}
      {cargandoAsignacion ? (
        <p className="mt-3 text-xs text-slate-500">
          Verificando asignación del docente seleccionado...
        </p>
      ) : asignacion ? (
        <div className="mt-3 rounded-2xl border border-emerald-100 bg-white/70 px-4 py-3 text-sm text-slate-600">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Asignación detectada
          </p>
          {asignacion.tiene_asignaciones ? (
            <>
              <p className="mt-1 font-semibold text-slate-700">
                Aula: {descripcionAulaAsignada ?? "Sin aula vinculada"}
              </p>
              <div className="mt-2 text-sm text-slate-600">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Componentes vinculados:
                </p>
                {resumenComponentesAsignados.length > 0 ? (
                  <div className="mt-1 space-y-1">
                    {resumenComponentesAsignados.map((item) => (
                      <p key={item.id}>{item.nombre}</p>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">
                    El docente no posee componentes asociados para este momento.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              El docente no tiene asignaciones registradas para el momento
              seleccionado.
            </p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          Selecciona un docente para consultar las asignaciones disponibles en
          este contexto.
        </p>
      )}
    </div>
  );
};
