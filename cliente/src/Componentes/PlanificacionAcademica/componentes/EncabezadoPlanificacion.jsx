import React from "react";
import { FaPlus, FaSyncAlt } from "react-icons/fa";
import {
  typography,
  typographyScale,
  textColors,
  primaryButtonBase,
  neutralButtonBase,
  fontWeights,
} from "../../EstilosCliente/EstilosClientes";

const eyebrowClass = `${typography.pill} text-indigo-500`;
const headingClass = `${typography.titleLg} text-slate-800`;
const descriptionClass = typography.bodyMutedSm;
const contextInfoClass = `${typographyScale.xs} ${textColors.muted}`;
const contextWarningClass = `${typographyScale.xs} ${fontWeights.semibold} text-amber-600`;
const statsEyebrowClass = `${typography.pill} text-slate-500`;
const statsHeadingClass = `${typographyScale["2xl"]} ${fontWeights.bold}`;

export const EncabezadoPlanificacion = ({
  resumen,
  contextoResumen,
  contextoEditable,
  contextoMotivo,
  puedeCrearPlanificacion,
  tituloBotonCrear,
  alRefrescar,
  alAbrirModal,
}) => {
  return (
    <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className={eyebrowClass}>Planificación Académica</p>
          <h1 className={headingClass}>Seguimiento de planificaciones</h1>
          <p className={descriptionClass}>
            Consulta el estado de las planificaciones por docente, aula, momento
            o tipo.
          </p>
          {contextoResumen && (
            <p className={contextInfoClass}>
              Contexto actual: {contextoResumen.descripcion} —{" "}
              {contextoResumen.editable ? "Editable" : "Solo lectura"}
            </p>
          )}
          {!contextoEditable && contextoMotivo && (
            <p className={contextWarningClass}>{contextoMotivo}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={alRefrescar}
            className={`${neutralButtonBase} border border-slate-200 text-slate-700 hover:border-slate-400 hover:text-slate-900 focus:ring-slate-200/60`}
          >
            <FaSyncAlt className="text-base" />
            Actualizar
          </button>
          <button
            type="button"
            onClick={() => alAbrirModal("crear", null)}
            className={`${primaryButtonBase} bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300/60 disabled:cursor-not-allowed disabled:bg-slate-300`}
            disabled={!puedeCrearPlanificacion}
            title={tituloBotonCrear}
          >
            <FaPlus className="text-base" />
            Nueva planificación
          </button>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 text-center sm:grid-cols-3">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <dt className={statsEyebrowClass}>Total</dt>
          <dd className={`${statsHeadingClass} text-slate-800`}>
            {resumen.total}
          </dd>
        </div>
        <div className="rounded-lg border border-green-100 bg-green-50 p-4">
          <dt className={`${statsEyebrowClass} text-green-600`}>Activas</dt>
          <dd className={`${statsHeadingClass} text-green-700`}>
            {resumen.activos}
          </dd>
        </div>
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
          <dt className={`${statsEyebrowClass} text-indigo-600`}>
            Individuales
          </dt>
          <dd className={`${statsHeadingClass} text-indigo-700`}>
            {resumen.individuales}
          </dd>
        </div>
      </dl>
    </header>
  );
};
