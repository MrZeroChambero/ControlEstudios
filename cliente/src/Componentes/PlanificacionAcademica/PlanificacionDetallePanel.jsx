import React from "react";
import { FaTimes } from "react-icons/fa";

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col rounded-lg border border-slate-100 p-3">
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </span>
    <span className="text-sm font-medium text-slate-700">{value ?? "-"}</span>
  </div>
);

const ChipsList = ({ title, items = [], emptyLabel }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {title}
    </p>
    {items.length ? (
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
          >
            #{item}
          </span>
        ))}
      </div>
    ) : (
      <p className="mt-2 text-sm text-slate-500">{emptyLabel}</p>
    )}
  </div>
);

const buildFallbackResolver = (prefix) => (valor) => {
  if (valor === null || valor === undefined || valor === "") return "-";
  return `${prefix} #${valor}`;
};

const estadoLegible = (estado) => {
  if (!estado) return "-";
  if (estado === "activo") return "Activo";
  if (estado === "inactivo") return "Inactivo";
  return estado;
};

const tipoLegible = (tipo) => {
  if (!tipo) return "-";
  if (tipo === "individual") return "Individual";
  if (tipo === "aula") return "Aula completa";
  return tipo;
};

const reutilizableLegible = (valor) => {
  if (!valor) return "-";
  if (valor === "si") return "Sí";
  if (valor === "no") return "No";
  return valor;
};

export const PlanificacionDetallePanel = ({
  isOpen,
  planificacion,
  isLoading,
  onClose,
  resolvers = {},
}) => {
  if (!isOpen) return null;

  const detalle = planificacion ?? {};
  const resolverDocente = resolvers.docente ?? buildFallbackResolver("Docente");
  const resolverAula = resolvers.aula ?? buildFallbackResolver("Aula");
  const resolverComponente =
    resolvers.componente ?? buildFallbackResolver("Componente");
  const resolverMomento = resolvers.momento ?? buildFallbackResolver("Momento");

  return (
    <div className="fixed inset-0 z-40 flex">
      <div
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="relative ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
              Detalle de planificación
            </p>
            <h2 className="text-lg font-bold text-slate-800">
              #{detalle.id_planificacion ?? "-"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
            aria-label="Cerrar panel"
          >
            <FaTimes />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading ? (
            <p className="text-sm text-slate-500">Cargando detalle...</p>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-3">
                <InfoRow
                  label="Docente"
                  value={resolverDocente(detalle.fk_personal)}
                />
                <InfoRow label="Aula" value={resolverAula(detalle.fk_aula)} />
                <InfoRow
                  label="Componente"
                  value={resolverComponente(detalle.fk_componente)}
                />
                <InfoRow
                  label="Momento"
                  value={resolverMomento(detalle.fk_momento)}
                />
                <InfoRow label="Tipo" value={tipoLegible(detalle.tipo)} />
                <InfoRow label="Estado" value={estadoLegible(detalle.estado)} />
                <InfoRow
                  label="Reutilizable"
                  value={reutilizableLegible(detalle.reutilizable)}
                />
              </div>

              <ChipsList
                title="Competencias asociadas"
                items={
                  Array.isArray(detalle.competencias)
                    ? detalle.competencias
                    : []
                }
                emptyLabel="Esta planificación no tiene competencias asociadas."
              />

              {detalle.tipo === "individual" ? (
                <ChipsList
                  title="Estudiantes/inscripciones"
                  items={
                    Array.isArray(detalle.estudiantes)
                      ? detalle.estudiantes
                      : []
                  }
                  emptyLabel="No se registraron estudiantes para esta planificación."
                />
              ) : (
                <p className="text-sm text-slate-500">
                  Esta planificación es por aula completa, por lo que no lista
                  estudiantes individuales.
                </p>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
