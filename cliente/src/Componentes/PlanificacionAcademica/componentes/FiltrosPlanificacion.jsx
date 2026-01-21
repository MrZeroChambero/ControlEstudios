import React from "react";
import { FaFilter } from "react-icons/fa";
import { filtrosPlanificacionClasses } from "../planificacionEstilos";

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
      className={filtrosPlanificacionClasses.container}
    >
      <div className={filtrosPlanificacionClasses.headingRow}>
        <FaFilter />
        <span className={filtrosPlanificacionClasses.headingLabel}>
          Filtros rápidos
        </span>
      </div>
      <div className={filtrosPlanificacionClasses.fieldsGrid}>
        <label className={filtrosPlanificacionClasses.fieldLabel}>
          Tipo
          <select
            name="tipo"
            value={filtros.tipo}
            onChange={alCambiarFiltro}
            className={filtrosPlanificacionClasses.select}
          >
            <option value="">Todos</option>
            <option value="aula">Aula completa</option>
            <option value="individual">Individual</option>
          </select>
        </label>
        <label className={filtrosPlanificacionClasses.fieldLabel}>
          Momento
          <select
            name="fk_momento"
            value={filtros.fk_momento}
            onChange={alCambiarFiltro}
            className={filtrosPlanificacionClasses.select}
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
        <label className={filtrosPlanificacionClasses.fieldLabel}>
          Docente responsable
          <select
            name="fk_personal"
            value={filtros.fk_personal}
            onChange={alCambiarFiltro}
            className={filtrosPlanificacionClasses.select}
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
        <label className={filtrosPlanificacionClasses.fieldLabel}>
          Aula
          <select
            name="fk_aula"
            value={filtros.fk_aula}
            onChange={alCambiarFiltro}
            className={filtrosPlanificacionClasses.select}
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
        <label className={filtrosPlanificacionClasses.fieldLabel}>
          Componente de aprendizaje sadsad
          <select
            name="fk_componente"
            value={filtros.fk_componente}
            onChange={alCambiarFiltro}
            className={filtrosPlanificacionClasses.select}
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
          <div className={filtrosPlanificacionClasses.docenteInfoPanel}>
            {docenteAsignacion.loading ? (
              <span className={filtrosPlanificacionClasses.docenteInfoLoading}>
                Buscando asignación del docente...
              </span>
            ) : docenteAsignacion.error ? (
              <span className={filtrosPlanificacionClasses.docenteInfoError}>
                {docenteAsignacion.error}
              </span>
            ) : asignacionAula ? (
              <div className={filtrosPlanificacionClasses.docenteInfoWrapper}>
                <div>
                  <p className={filtrosPlanificacionClasses.docenteMetaLabel}>
                    Aula asignada
                  </p>
                  <p className={filtrosPlanificacionClasses.docenteMetaValue}>
                    Grado {asignacionAula.grado ?? "N/D"} - Sección{" "}
                    {asignacionAula.seccion ?? "N/D"}
                  </p>
                </div>
                <div>
                  <p className={filtrosPlanificacionClasses.docenteMetaLabel}>
                    Componentes vinculados
                  </p>
                  {componentesAsignados.length ? (
                    <div
                      className={
                        filtrosPlanificacionClasses.docenteComponentesWrapper
                      }
                    >
                      {componentesAsignados.map((componente) => (
                        <span
                          key={componente.id}
                          className={filtrosPlanificacionClasses.docenteChip}
                        >
                          {componente.label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className={filtrosPlanificacionClasses.docenteChipEmpty}>
                      El docente no tiene componentes registrados para este
                      momento.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <span className={filtrosPlanificacionClasses.docenteEmptyText}>
                No se encontró aula ni componentes asociados al docente para el
                contexto seleccionado.
              </span>
            )}
          </div>
        )}
      </div>
      {(catalogosLoading || catalogosError) && (
        <p className={filtrosPlanificacionClasses.catalogNotice}>
          {catalogosLoading ? "Cargando catálogos de apoyo..." : catalogosError}
        </p>
      )}
      <div className={filtrosPlanificacionClasses.actionsRow}>
        <button
          type="submit"
          className={filtrosPlanificacionClasses.applyButton}
          disabled={accionesDeshabilitadas}
        >
          Aplicar filtros
        </button>
        <button
          type="button"
          onClick={alReiniciarFiltros}
          className={filtrosPlanificacionClasses.resetButton}
          disabled={accionesDeshabilitadas}
        >
          Limpiar
        </button>
      </div>
    </form>
  );
};
