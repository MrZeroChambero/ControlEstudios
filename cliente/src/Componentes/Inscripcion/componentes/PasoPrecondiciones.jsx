import React from "react";
import { formatearFechaCorta } from "../../../utilidades/formatoFechas";
import { textosInscripcion } from "../textosInscripcion";
import {
  inscripcionLayout,
  pasoPrecondicionesClasses,
} from "../inscripcionEstilos";

export const PasoPrecondiciones = ({ resultado, cargando, onReintentar }) => {
  if (cargando) {
    return (
      <div
        name="contenedor-precondiciones-cargando"
        className={inscripcionLayout.container}
      >
        <h2 className={inscripcionLayout.title}>Verificando precondiciones</h2>
        <p className={pasoPrecondicionesClasses.helperText}>
          Consultando el estado del año escolar y las secciones disponibles...
        </p>
      </div>
    );
  }

  if (!resultado) {
    return (
      <div
        name="contenedor-precondiciones-sin-resultado"
        className={inscripcionLayout.container}
      >
        <h2 className={inscripcionLayout.title}>Sin información disponible</h2>
        <p className={pasoPrecondicionesClasses.helperText}>
          Intenta consultar nuevamente para conocer el estado del sistema de
          inscripción.
        </p>
        <button
          type="button"
          onClick={onReintentar}
          className={inscripcionLayout.addButton}
        >
          Reintentar
        </button>
      </div>
    );
  }

  const listo = resultado.listo ?? false;
  const inicioAnio = formatearFechaCorta(resultado?.anio?.fecha_inicio);
  const finAnio = formatearFechaCorta(resultado?.anio?.fecha_fin);
  const limiteInscripcion = formatearFechaCorta(
    resultado?.anio?.fecha_limite_inscripcion
  );

  return (
    <div
      name="contenedor-precondiciones"
      className={pasoPrecondicionesClasses.container}
    >
      <header className={inscripcionLayout.header}>
        <div name="precondiciones-descripcion">
          <h2 className={inscripcionLayout.title}>
            {textosInscripcion.tituloPrecondiciones}
          </h2>
          <p className={inscripcionLayout.description}>
            {listo
              ? "Todo está configurado para iniciar la inscripción estudiantil."
              : "Debes atender los siguientes pendientes antes de inscribir."}
          </p>
        </div>
        <div
          name="precondiciones-estado"
          className={`${pasoPrecondicionesClasses.statusPill.base} ${
            listo
              ? pasoPrecondicionesClasses.statusPill.ready
              : pasoPrecondicionesClasses.statusPill.pending
          }`}
        >
          {listo ? "Listo para inscribir" : "Pendientes por resolver"}
        </div>
      </header>

      <section
        name="precondiciones-resumen"
        className={pasoPrecondicionesClasses.summaryCard}
      >
        <p>
          Año escolar activo: <strong>{inicioAnio || "-"}</strong> a{" "}
          <strong>{finAnio || "-"}</strong>.
        </p>
        <p className="mt-2">
          Recuerda que la fecha límite de inscripción es el{" "}
          <strong>{limiteInscripcion || "-"}</strong>.
        </p>
      </section>

      {listo ? (
        <article
          name="precondiciones-listo"
          className={pasoPrecondicionesClasses.readyText}
        >
          <p>
            Ya puedes gestionar la inscripción de estudiantes. Revisa las
            secciones disponibles y confirma los cupos antes de continuar.
          </p>
          <button
            type="button"
            onClick={onReintentar}
            className={inscripcionLayout.addButton}
          >
            Actualizar estado
          </button>
        </article>
      ) : (
        <article
          name="precondiciones-pendientes"
          className={pasoPrecondicionesClasses.container}
        >
          <div
            name="precondiciones-recomendaciones"
            className={pasoPrecondicionesClasses.warningCard}
          >
            <p className="font-semibold">Acciones recomendadas</p>
            <p>
              Asigna docentes titulares a las secciones activas y asegúrate de
              contar con cupos disponibles antes de continuar con la
              inscripción.
            </p>
          </div>
          <div name="precondiciones-pendientes-detalle" className="space-y-2">
            <p className={pasoPrecondicionesClasses.pendingTitle}>
              Secciones sin docente asignado:
            </p>
            {resultado.faltantes_docentes?.length ? (
              <ul className={pasoPrecondicionesClasses.pendingList}>
                {resultado.faltantes_docentes.map((aula) => (
                  <li
                    key={aula.id_aula}
                    name={`precondiciones-aula-${aula.id_aula}`}
                    className={pasoPrecondicionesClasses.pendingItem}
                  >
                    Sección{" "}
                    <strong>
                      {aula.grado}° {aula.seccion}
                    </strong>{" "}
                    sin docente titular.
                  </li>
                ))}
              </ul>
            ) : (
              <p className={pasoPrecondicionesClasses.fallbackText}>
                No se pudo obtener el detalle de las secciones pendientes.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onReintentar}
            className={inscripcionLayout.addButton}
          >
            Verificar nuevamente
          </button>
        </article>
      )}
    </div>
  );
};
