import React from "react";
import { FaTimes } from "react-icons/fa";
import { planificacionDetallePanelClasses } from "./planificacionEstilos";

const InfoRow = ({ label, value }) => (
  <div className={planificacionDetallePanelClasses.infoRow}>
    <span className={planificacionDetallePanelClasses.infoRowLabel}>
      {label}
    </span>
    <span className={planificacionDetallePanelClasses.infoRowValue}>
      {value ?? "-"}
    </span>
  </div>
);

const ChipsList = ({ title, items = [], emptyLabel }) => (
  <div>
    <p className={planificacionDetallePanelClasses.chipListTitle}>{title}</p>
    {items.length ? (
      <div className={planificacionDetallePanelClasses.chipListWrapper}>
        {items.map((item) => (
          <span
            key={item}
            className={planificacionDetallePanelClasses.chipBadge}
          >
            #{item}
          </span>
        ))}
      </div>
    ) : (
      <p className={planificacionDetallePanelClasses.chipEmptyText}>
        {emptyLabel}
      </p>
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
    <div className={planificacionDetallePanelClasses.overlay}>
      <div
        className={planificacionDetallePanelClasses.backdrop}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={planificacionDetallePanelClasses.panel}>
        <header className={planificacionDetallePanelClasses.header}>
          <div>
            <p className={planificacionDetallePanelClasses.headerEyebrow}>
              Detalle de planificación
            </p>
            <h2 className={planificacionDetallePanelClasses.headerTitle}>
              #{detalle.id_planificacion ?? "-"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={planificacionDetallePanelClasses.closeButton}
            aria-label="Cerrar panel"
          >
            <FaTimes />
          </button>
        </header>

        <div className={planificacionDetallePanelClasses.body}>
          {isLoading ? (
            <p className={planificacionDetallePanelClasses.loadingText}>
              Cargando detalle...
            </p>
          ) : (
            <div className={planificacionDetallePanelClasses.contentWrapper}>
              <div className={planificacionDetallePanelClasses.infoGrid}>
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
                <p className={planificacionDetallePanelClasses.loadingText}>
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
