import React from "react";
import VentanaModal from "../../EstilosCliente/VentanaModal";
import { modalPlanificacionesDocenteClasses } from "../planificacionEstilos";

export const ModalPlanificacionesDocente = ({
  abierta,
  alCerrar,
  docenteSeleccionado,
  momentoSeleccionadoLabel,
  estadoModal,
  puedeConsultarPlanificaciones,
  alRefrescar,
  planificacionesAgrupadas,
  alAgregarPlanificacion,
  alModificarPlanificacion,
  alEliminarPlanificacion,
}) => {
  return (
    <VentanaModal
      isOpen={abierta}
      onClose={alCerrar}
      title="Planificaciones por componente"
      size="lg"
      bodyClassName={modalPlanificacionesDocenteClasses.body}
    >
      <div className={modalPlanificacionesDocenteClasses.contextCard}>
        <p className={modalPlanificacionesDocenteClasses.contextDocente}>
          Docente: {docenteSeleccionado?.baseLabel ?? "Sin seleccionar"}
        </p>
        <p className={modalPlanificacionesDocenteClasses.contextMomento}>
          Momento: {momentoSeleccionadoLabel}
        </p>
        <div className={modalPlanificacionesDocenteClasses.contextActions}>
          <button
            type="button"
            onClick={alRefrescar}
            className={modalPlanificacionesDocenteClasses.refreshButton}
            disabled={estadoModal.cargando || !puedeConsultarPlanificaciones}
          >
            Actualizar listado
          </button>
        </div>
      </div>

      {estadoModal.error && (
        <p className={modalPlanificacionesDocenteClasses.errorText}>
          {estadoModal.error}
        </p>
      )}

      {estadoModal.cargando ? (
        <p className={modalPlanificacionesDocenteClasses.loadingText}>
          Consultando planificaciones registradas...
        </p>
      ) : planificacionesAgrupadas.length === 0 ? (
        <p className={modalPlanificacionesDocenteClasses.listEmptyText}>
          No se encontraron planificaciones para las asignaciones actuales.
        </p>
      ) : (
        planificacionesAgrupadas.map((grupo) => (
          <article
            key={grupo.clave}
            className={modalPlanificacionesDocenteClasses.grupoCard}
          >
            <header className={modalPlanificacionesDocenteClasses.grupoHeader}>
              <div>
                <p
                  className={
                    modalPlanificacionesDocenteClasses.grupoHeadingLabel
                  }
                >
                  Planificación de:
                </p>
                <p
                  className={
                    modalPlanificacionesDocenteClasses.grupoHeadingValue
                  }
                >
                  {grupo.componenteLabel}
                </p>
              </div>
              <span className={modalPlanificacionesDocenteClasses.grupoBadge}>
                {grupo.planificaciones.length} plan(es)
              </span>
            </header>

            {grupo.planificaciones.length ? (
              <div className={modalPlanificacionesDocenteClasses.planList}>
                {grupo.planificaciones.map((plan) => (
                  <div
                    key={plan.id_planificacion}
                    className={modalPlanificacionesDocenteClasses.planCard}
                  >
                    <div>
                      <p
                        className={modalPlanificacionesDocenteClasses.planTitle}
                      >
                        #{plan.id_planificacion}
                      </p>
                      <p
                        className={modalPlanificacionesDocenteClasses.planMeta}
                      >
                        Tipo:{" "}
                        {plan.tipo === "individual" ? "Individual" : "Aula"} ·
                        Estado:{" "}
                        {plan.estado === "activo" ? "Activo" : "Inactivo"} ·{" "}
                        {plan.competencias?.length ?? 0} competencias ·{" "}
                        {plan.estudiantes?.length ?? 0} estudiantes
                      </p>
                    </div>
                    <div
                      className={modalPlanificacionesDocenteClasses.planActions}
                    >
                      <button
                        type="button"
                        className={
                          modalPlanificacionesDocenteClasses.planModifyButton
                        }
                        onClick={() => alModificarPlanificacion(plan)}
                      >
                        Modificar
                      </button>
                      <button
                        type="button"
                        className={
                          modalPlanificacionesDocenteClasses.planDeleteButton
                        }
                        onClick={() => alEliminarPlanificacion(plan)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={modalPlanificacionesDocenteClasses.listEmptyText}>
                No hay planificaciones registradas para este componente.
              </p>
            )}

            <div className={modalPlanificacionesDocenteClasses.agregarWrapper}>
              <button
                type="button"
                className={modalPlanificacionesDocenteClasses.agregarButton}
                onClick={() => alAgregarPlanificacion(grupo.componenteId)}
                disabled={
                  grupo.componenteId === null || !puedeConsultarPlanificaciones
                }
              >
                Agregar planificación
              </button>
            </div>
          </article>
        ))
      )}
    </VentanaModal>
  );
};
