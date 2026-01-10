import React from "react";
import { FaPlus, FaSyncAlt } from "react-icons/fa";

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
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
            Planificación Académica
          </p>
          <h1 className="text-2xl font-bold text-slate-800">
            Seguimiento de planificaciones
          </h1>
          <p className="text-sm text-slate-500">
            Consulta el estado de las planificaciones por docente, aula, momento
            o tipo.
          </p>
          {contextoResumen && (
            <p className="text-xs text-slate-500">
              Contexto actual: {contextoResumen.descripcion} —{" "}
              {contextoResumen.editable ? "Editable" : "Solo lectura"}
            </p>
          )}
          {!contextoEditable && contextoMotivo && (
            <p className="text-xs font-semibold text-amber-600">
              {contextoMotivo}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={alRefrescar}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            <FaSyncAlt className="text-base" />
            Actualizar
          </button>
          <button
            type="button"
            onClick={() => alAbrirModal("crear", null)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
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
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Total
          </dt>
          <dd className="text-2xl font-bold text-slate-800">{resumen.total}</dd>
        </div>
        <div className="rounded-lg border border-green-100 bg-green-50 p-4">
          <dt className="text-xs uppercase tracking-wide text-green-600">
            Activas
          </dt>
          <dd className="text-2xl font-bold text-green-700">
            {resumen.activos}
          </dd>
        </div>
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
          <dt className="text-xs uppercase tracking-wide text-indigo-600">
            Individuales
          </dt>
          <dd className="text-2xl font-bold text-indigo-700">
            {resumen.individuales}
          </dd>
        </div>
      </dl>
    </header>
  );
};
