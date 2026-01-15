import React from "react";
import { FaPlus, FaSyncAlt } from "react-icons/fa";
import { encabezadoPlanificacionClasses } from "../planificacionEstilos";

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
    <header className={encabezadoPlanificacionClasses.container}>
      <div className={encabezadoPlanificacionClasses.headerLayout}>
        <div>
          <p className={encabezadoPlanificacionClasses.eyebrow}>
            Planificación Académica
          </p>
          <h1 className={encabezadoPlanificacionClasses.heading}>
            Seguimiento de planificaciones
          </h1>
          <p className={encabezadoPlanificacionClasses.description}>
            Consulta el estado de las planificaciones por docente, aula, momento
            o tipo.
          </p>
          {contextoResumen && (
            <p className={encabezadoPlanificacionClasses.contextInfo}>
              Contexto actual: {contextoResumen.descripcion} —{" "}
              {contextoResumen.editable ? "Editable" : "Solo lectura"}
            </p>
          )}
          {!contextoEditable && contextoMotivo && (
            <p className={encabezadoPlanificacionClasses.contextWarning}>
              {contextoMotivo}
            </p>
          )}
        </div>
        <div className={encabezadoPlanificacionClasses.actions}>
          <button
            type="button"
            onClick={alRefrescar}
            className={encabezadoPlanificacionClasses.refreshButton}
          >
            <FaSyncAlt className={encabezadoPlanificacionClasses.actionIcon} />
            Actualizar
          </button>
          <button
            type="button"
            onClick={() => alAbrirModal("crear", null)}
            className={encabezadoPlanificacionClasses.createButton}
            disabled={!puedeCrearPlanificacion}
            title={tituloBotonCrear}
          >
            <FaPlus className={encabezadoPlanificacionClasses.actionIcon} />
            Nueva planificación
          </button>
        </div>
      </div>

      <dl className={encabezadoPlanificacionClasses.statsGrid}>
        <div className={encabezadoPlanificacionClasses.statCardTotal}>
          <dt className={encabezadoPlanificacionClasses.statsEyebrow}>Total</dt>
          <dd
            className={`${encabezadoPlanificacionClasses.statsHeading} ${encabezadoPlanificacionClasses.statsHeadingTotal}`}
          >
            {resumen.total}
          </dd>
        </div>
        <div className={encabezadoPlanificacionClasses.statCardActive}>
          <dt
            className={`${encabezadoPlanificacionClasses.statsEyebrow} ${encabezadoPlanificacionClasses.statsEyebrowActive}`}
          >
            Activas
          </dt>
          <dd
            className={`${encabezadoPlanificacionClasses.statsHeading} ${encabezadoPlanificacionClasses.statsHeadingActive}`}
          >
            {resumen.activos}
          </dd>
        </div>
        <div className={encabezadoPlanificacionClasses.statCardIndividual}>
          <dt
            className={`${encabezadoPlanificacionClasses.statsEyebrow} ${encabezadoPlanificacionClasses.statsEyebrowIndividual}`}
          >
            Individuales
          </dt>
          <dd
            className={`${encabezadoPlanificacionClasses.statsHeading} ${encabezadoPlanificacionClasses.statsHeadingIndividual}`}
          >
            {resumen.individuales}
          </dd>
        </div>
      </dl>
    </header>
  );
};
