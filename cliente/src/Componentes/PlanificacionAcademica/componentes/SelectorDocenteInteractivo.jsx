import React from "react";
import {
  typography,
  typographyScale,
  textColors,
  fontWeights,
} from "../../EstilosCliente/EstilosClientes";

const avatarInitialClass = `flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 ${typographyScale.xs} ${fontWeights.semibold} uppercase tracking-wide text-slate-600`;
const selectedNameClass = `${typographyScale.sm} ${fontWeights.semibold} ${textColors.tertiary}`;
const dropdownEmptyClass = `${typography.bodyMutedSm}`;
const loadingHelperClass = `${typographyScale.xs} ${fontWeights.semibold} ${textColors.muted}`;
const emptyHelperClass = `${typographyScale.xs} ${fontWeights.semibold} text-rose-500`;

export const SelectorDocenteInteractivo = ({
  form,
  docenteSeleccionado,
  rolePillBaseClass,
  selectorDocenteAbierto,
  selectorDocenteDeshabilitado,
  alAlternarSelector,
  docenteFiltro,
  alFiltrarDocente,
  catalogoPersonal,
  catalogoPersonalFiltrado,
  alSeleccionarDocente,
  selectorDocenteRef,
  cargandoDocentesAsignacion,
  mensajeSinDocentes,
}) => {
  return (
    <div className="space-y-2">
      <div className="relative" ref={selectorDocenteRef}>
        <input type="hidden" name="fk_personal" value={form.fk_personal} />
        <button
          type="button"
          id="fk_personal"
          aria-haspopup="listbox"
          aria-expanded={selectorDocenteAbierto}
          onClick={alAlternarSelector}
          disabled={selectorDocenteDeshabilitado}
          className={`flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-200 ${
            selectorDocenteDeshabilitado
              ? "cursor-not-allowed opacity-60"
              : "hover:border-slate-300 hover:shadow-md"
          }`}
          style={{ height: "52px" }}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
            <div className="flex min-w-0 items-center gap-2 overflow-hidden">
              <span className={avatarInitialClass}>
                {docenteSeleccionado ? docenteSeleccionado.initials : "?"}
              </span>
              <span className={`truncate ${selectedNameClass}`}>
                {docenteSeleccionado
                  ? docenteSeleccionado.baseLabel
                  : "Selecciona un docente"}
              </span>
            </div>
            <span
              className={`shrink-0 ${
                docenteSeleccionado
                  ? docenteSeleccionado.rolePillClass
                  : `${rolePillBaseClass} bg-slate-100 text-slate-500`
              }`}
            >
              {docenteSeleccionado
                ? docenteSeleccionado.roleBadge
                : "Sin rol asignado"}
            </span>
          </div>
          <span
            className={`ml-3 flex shrink-0 items-center text-slate-400 transition-transform duration-300 ${
              selectorDocenteAbierto ? "rotate-180" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.585l3.71-3.354a.75.75 0 011.04 1.08l-4.25 3.845a.75.75 0 01-1.04 0l-4.25-3.845a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>
        {selectorDocenteAbierto && (
          <div className="absolute left-0 right-0 z-40 mt-2 origin-top rounded-2xl border border-slate-100 bg-white shadow-xl">
            <div className="border-b border-slate-100 px-4 py-3">
              <input
                type="text"
                value={docenteFiltro}
                onChange={(event) => alFiltrarDocente(event.target.value)}
                placeholder="Buscar por nombre o rol"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                aria-label="Buscar docente"
              />
            </div>
            <div className="max-h-64 overflow-y-auto py-2" role="listbox">
              {catalogoPersonal.length === 0 ? (
                <p className={`px-4 py-3 ${dropdownEmptyClass}`}>
                  {mensajeSinDocentes}
                </p>
              ) : catalogoPersonalFiltrado.length ? (
                catalogoPersonalFiltrado.map((docente) => {
                  const seleccionado =
                    String(form.fk_personal) === String(docente.id);
                  return (
                    <button
                      key={docente.id}
                      type="button"
                      role="option"
                      aria-selected={seleccionado}
                      onClick={() => alSeleccionarDocente(docente.id)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50 ${
                        seleccionado ? "bg-slate-100" : ""
                      }`}
                    >
                      <span className="truncate font-medium">
                        {docente.baseLabel}
                      </span>
                      <span className={`${docente.rolePillClass} shrink-0`}>
                        {docente.roleBadge}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className={`px-4 py-3 ${dropdownEmptyClass}`}>
                  No encontramos docentes que coincidan con tu búsqueda.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      {cargandoDocentesAsignacion && (
        <p className={loadingHelperClass}>
          Buscando docentes con asignaciones activas...
        </p>
      )}
      {!cargandoDocentesAsignacion && catalogoPersonal.length === 0 && (
        <p className={emptyHelperClass}>{mensajeSinDocentes}</p>
      )}
    </div>
  );
};
