import React from "react";
import { selectorDocenteClasses } from "../planificacionEstilos";

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
    <div className={selectorDocenteClasses.container}>
      <div
        className={selectorDocenteClasses.triggerWrapper}
        ref={selectorDocenteRef}
      >
        <input type="hidden" name="fk_personal" value={form.fk_personal} />
        <button
          type="button"
          id="fk_personal"
          aria-haspopup="listbox"
          aria-expanded={selectorDocenteAbierto}
          onClick={alAlternarSelector}
          disabled={selectorDocenteDeshabilitado}
          className={`${selectorDocenteClasses.triggerButtonBase} ${
            selectorDocenteDeshabilitado
              ? selectorDocenteClasses.triggerButtonDisabled
              : selectorDocenteClasses.triggerButtonEnabled
          }`}
          style={{ height: "52px" }}
        >
          <div className={selectorDocenteClasses.triggerContent}>
            <div className={selectorDocenteClasses.triggerNamesWrapper}>
              <span className={selectorDocenteClasses.avatarInitial}>
                {docenteSeleccionado ? docenteSeleccionado.initials : "?"}
              </span>
              <span className={selectorDocenteClasses.selectedName}>
                {docenteSeleccionado
                  ? docenteSeleccionado.baseLabel
                  : "Selecciona un docente"}
              </span>
            </div>
            <span
              className={`shrink-0 ${
                docenteSeleccionado
                  ? docenteSeleccionado.rolePillClass
                  : `${rolePillBaseClass} ${selectorDocenteClasses.fallbackRolePill}`
              }`}
            >
              {docenteSeleccionado
                ? docenteSeleccionado.roleBadge
                : "Sin rol asignado"}
            </span>
          </div>
          <span
            className={`${selectorDocenteClasses.chevron} ${
              selectorDocenteAbierto ? selectorDocenteClasses.chevronOpen : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={selectorDocenteClasses.chevronIcon}
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
          <div className={selectorDocenteClasses.dropdown}>
            <div className={selectorDocenteClasses.dropdownSearchWrapper}>
              <input
                type="text"
                value={docenteFiltro}
                onChange={(event) => alFiltrarDocente(event.target.value)}
                placeholder="Buscar por nombre o rol"
                className={selectorDocenteClasses.dropdownSearchInput}
                aria-label="Buscar docente"
              />
            </div>
            <div className={selectorDocenteClasses.dropdownList} role="listbox">
              {catalogoPersonal.length === 0 ? (
                <p
                  className={`${selectorDocenteClasses.dropdownEmptyWrapper} ${selectorDocenteClasses.dropdownEmptyText}`}
                >
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
                      className={`${selectorDocenteClasses.dropdownOption} ${
                        seleccionado
                          ? selectorDocenteClasses.dropdownOptionSelected
                          : ""
                      }`}
                    >
                      <span
                        className={selectorDocenteClasses.dropdownOptionLabel}
                      >
                        {docente.baseLabel}
                      </span>
                      <span
                        className={`${docente.rolePillClass} ${selectorDocenteClasses.dropdownRolePill}`}
                      >
                        {docente.roleBadge}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p
                  className={`${selectorDocenteClasses.dropdownEmptyWrapper} ${selectorDocenteClasses.dropdownEmptyText}`}
                >
                  No encontramos docentes que coincidan con tu búsqueda.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      {cargandoDocentesAsignacion && (
        <p className={selectorDocenteClasses.loadingHelper}>
          Buscando docentes con asignaciones activas...
        </p>
      )}
      {!cargandoDocentesAsignacion && catalogoPersonal.length === 0 && (
        <p className={selectorDocenteClasses.emptyHelper}>
          {mensajeSinDocentes}
        </p>
      )}
    </div>
  );
};
