import React from "react";
import { panelContextoActualClasses } from "../planificacionEstilos";

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
    <div className={panelContextoActualClasses.container}>
      <p className={panelContextoActualClasses.eyebrow}>Contexto actual</p>
      
      <p
        className={`${panelContextoActualClasses.spacingMd} ${panelContextoActualClasses.helperText}`}
      >
        {modo === "clonar"
          ? "Se generará una nueva planificación basada en la selección indicada."
          : "Selecciona los catálogos y competencias para esta planificación."}
      </p>
      {bloqueado && (
        <p
          className={`${panelContextoActualClasses.spacingMd} ${panelContextoActualClasses.warningText}`}
        >
          {bloqueado}
        </p>
      )}
      {cargandoAsignacion ? (
        <p
          className={`${panelContextoActualClasses.spacingLg} ${panelContextoActualClasses.helperText}`}
        >
          Verificando asignación del docente seleccionado...
        </p>
      ) : asignacion ? (
        <div className={panelContextoActualClasses.assignmentCard}>
          <p className={panelContextoActualClasses.assignmentBadge}>
            Asignación detectada
          </p>
          {asignacion.tiene_asignaciones ? (
            <>
              <p
                className={`${panelContextoActualClasses.spacingSm} ${panelContextoActualClasses.titleHighlight}`}
              >
                Aula: {descripcionAulaAsignada ?? "Sin aula vinculada"}
              </p>
              <div className={panelContextoActualClasses.assignmentInfoWrapper}>
                <p className={panelContextoActualClasses.chipListTitle}>
                  Componentes vinculados:
                </p>
                {resumenComponentesAsignados.length > 0 ? (
                  <div className={panelContextoActualClasses.chipListWrapper}>
                    {resumenComponentesAsignados.map((item) => (
                      <p
                        key={item.id}
                        className={panelContextoActualClasses.chipListItem}
                      >
                        {item.nombre}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p
                    className={`${panelContextoActualClasses.spacingSm} ${panelContextoActualClasses.assignmentSubtitle}`}
                  >
                    El docente no posee componentes asociados para este momento.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p
              className={`${panelContextoActualClasses.spacingMd} ${panelContextoActualClasses.assignmentSubtitle}`}
            >
              El docente no tiene asignaciones registradas para el momento
              seleccionado.
            </p>
          )}
        </div>
      ) : (
        <p
          className={`${panelContextoActualClasses.spacingLg} ${panelContextoActualClasses.helperText}`}
        >
          Selecciona un docente para consultar las asignaciones disponibles en
          este contexto.
        </p>
      )}
    </div>
  );
};
