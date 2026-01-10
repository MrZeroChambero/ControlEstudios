import React from "react";
import { FaFilter } from "react-icons/fa";

export const FiltrosPlanificacion = ({
  filtros,
  catalogos,
  catalogosLoading,
  catalogosError,
  planificacionesCargando,
  docenteAsignacion,
  asignacionAula,
  componentesAsignados,
  alCambiarFiltro,
  alEnviarFiltros,
  alReiniciarFiltros,
}) => {
  const accionesDeshabilitadas = catalogosLoading || planificacionesCargando;

  return (
    <form
      onSubmit={alEnviarFiltros}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-2 text-slate-600">
        <FaFilter />
        <span className="text-sm font-semibold">Filtros rápidos</span>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex flex-col text-sm text-slate-600">
          Tipo
          <select
            name="tipo"
            value={filtros.tipo}
            onChange={alCambiarFiltro}
            className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Todos</option>
            <option value="aula">Aula completa</option>
            <option value="individual">Individual</option>
          </select>
        </label>
        <label className="flex flex-col text-sm text-slate-600">
          Momento
          <select
            name="fk_momento"
            value={filtros.fk_momento}
            onChange={alCambiarFiltro}
            className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:border-indigo-500 focus:outline-none"
            disabled={catalogosLoading || !catalogos.momentos.length}
          >
            <option value="">Todos</option>
            {catalogos.momentos.map((momento) => (
              <option key={momento.id} value={momento.id}>
                {momento.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm text-slate-600">
          Docente responsable
          <select
            name="fk_personal"
            value={filtros.fk_personal}
            onChange={alCambiarFiltro}
            className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:border-indigo-500 focus:outline-none"
            disabled={catalogosLoading || !catalogos.personal.length}
          >
            <option value="">Todos</option>
            {catalogos.personal.map((docente) => (
              <option key={docente.id} value={docente.id}>
                {docente.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm text-slate-600">
          Aula
          <select
            name="fk_aula"
            value={filtros.fk_aula}
            onChange={alCambiarFiltro}
            className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:border-indigo-500 focus:outline-none"
            disabled={catalogosLoading || !catalogos.aulas.length}
          >
            <option value="">Todas</option>
            {catalogos.aulas.map((aula) => (
              <option key={aula.id} value={aula.id}>
                {aula.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm text-slate-600">
          Componente de aprendizaje
          <select
            name="fk_componente"
            value={filtros.fk_componente}
            onChange={alCambiarFiltro}
            className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:border-indigo-500 focus:outline-none"
            disabled={catalogosLoading || !catalogos.componentes.length}
          >
            <option value="">Todos</option>
            {catalogos.componentes.map((componente) => (
              <option key={componente.id} value={componente.id}>
                {componente.label}
              </option>
            ))}
          </select>
        </label>
        {filtros.fk_personal && (
          <div className="md:col-span-3 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
            {docenteAsignacion.loading ? (
              <span>Buscando asignación del docente...</span>
            ) : docenteAsignacion.error ? (
              <span className="text-red-600">{docenteAsignacion.error}</span>
            ) : asignacionAula ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Aula asignada
                  </p>
                  <p className="font-semibold text-slate-700">
                    Grado {asignacionAula.grado ?? "N/D"} - Sección{" "}
                    {asignacionAula.seccion ?? "N/D"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Componentes vinculados
                  </p>
                  {componentesAsignados.length ? (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {componentesAsignados.map((componente) => (
                        <span
                          key={componente.id}
                          className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
                        >
                          {componente.nombre}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      El docente no tiene componentes registrados para este
                      momento.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-500">
                No se encontró aula ni componentes asociados al docente para el
                contexto seleccionado.
              </span>
            )}
          </div>
        )}
      </div>
      {(catalogosLoading || catalogosError) && (
        <p className="mt-3 text-xs text-slate-500">
          {catalogosLoading ? "Cargando catálogos de apoyo..." : catalogosError}
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          disabled={accionesDeshabilitadas}
        >
          Aplicar filtros
        </button>
        <button
          type="button"
          onClick={alReiniciarFiltros}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
          disabled={accionesDeshabilitadas}
        >
          Limpiar
        </button>
      </div>
    </form>
  );
};
