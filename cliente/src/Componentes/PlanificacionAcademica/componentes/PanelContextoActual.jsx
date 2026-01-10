import React from "react";
import {
  typography,
  typographyScale,
  textColors,
  fontWeights,
} from "../../EstilosCliente/EstilosClientes";

const eyebrowClass = `${typography.pill} text-indigo-500`;
const titleHighlightClass = `${typographyScale.sm} ${fontWeights.semibold} ${textColors.tertiary}`;
const helperTextClass = typography.helper;
const warningTextClass = `${typography.helper} ${fontWeights.semibold} text-amber-600`;
const assignmentBadgeClass = `${typography.pill} text-emerald-600`;
const assignmentSubtitleClass = `${typographyScale.xs} ${textColors.muted}`;
const chipListTitleClass = `${typography.pill} ${textColors.muted}`;

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
      <p className={eyebrowClass}>Contexto actual</p>
      <p className={`mt-1 ${titleHighlightClass}`}>
        {contexto?.momento?.nombre ??
          contexto?.momento?.momento_nombre ??
          contexto?.momento?.nombre_momento ??
          "Sin momento asignado"}
      </p>
      <p className={`mt-2 ${helperTextClass}`}>
        {modo === "clonar"
          ? "Se generará una nueva planificación basada en la selección indicada."
          : "Selecciona los catálogos y competencias para esta planificación."}
      </p>
      {bloqueado && <p className={`mt-2 ${warningTextClass}`}>{bloqueado}</p>}
      {cargandoAsignacion ? (
        <p className={`mt-3 ${helperTextClass}`}>
          Verificando asignación del docente seleccionado...
        </p>
      ) : asignacion ? (
        <div className="mt-3 rounded-2xl border border-emerald-100 bg-white/70 px-4 py-3 text-sm text-slate-600">
          <p className={assignmentBadgeClass}>Asignación detectada</p>
          {asignacion.tiene_asignaciones ? (
            <>
              <p className={`mt-1 ${titleHighlightClass}`}>
                Aula: {descripcionAulaAsignada ?? "Sin aula vinculada"}
              </p>
              <div className="mt-2 text-sm text-slate-600">
                <p className={chipListTitleClass}>Componentes vinculados:</p>
                {resumenComponentesAsignados.length > 0 ? (
                  <div className="mt-1 space-y-1">
                    {resumenComponentesAsignados.map((item) => (
                      <p key={item.id}>{item.nombre}</p>
                    ))}
                  </div>
                ) : (
                  <p className={`mt-1 ${assignmentSubtitleClass}`}>
                    El docente no posee componentes asociados para este momento.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className={`mt-2 ${assignmentSubtitleClass}`}>
              El docente no tiene asignaciones registradas para el momento
              seleccionado.
            </p>
          )}
        </div>
      ) : (
        <p className={`mt-3 ${helperTextClass}`}>
          Selecciona un docente para consultar las asignaciones disponibles en
          este contexto.
        </p>
      )}
    </div>
  );
};
