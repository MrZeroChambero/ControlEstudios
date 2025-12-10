import React from "react";
import {
  inscripcionStepClasses as stepClasses,
  inscripcionLayout,
} from "../EstilosCliente/EstilosClientes";

export const Ventanas = ({ pasos, pasoActual, children, controles }) => {
  return (
    <div name="contenedor-ventanas-inscripcion" className="flex flex-col gap-6">
      <section
        name="seccion-pasos-inscripcion"
        className={`${inscripcionLayout.container} p-4`}
        style={{ boxShadow: "none" }}
      >
        <div name="lista-pasos-inscripcion" className={stepClasses.container}>
          {pasos.map((paso, index) => {
            const estado =
              index < pasoActual
                ? "completado"
                : index === pasoActual
                ? "activo"
                : "pendiente";
            const cardClass = [
              stepClasses.card,
              estado === "activo"
                ? stepClasses.cardActivo
                : estado === "completado"
                ? stepClasses.cardCompletado
                : stepClasses.cardPendiente,
            ].join(" ");
            const bulletClass = [
              stepClasses.bullet,
              estado === "activo"
                ? stepClasses.bulletActivo
                : estado === "completado"
                ? stepClasses.bulletCompletado
                : stepClasses.bulletPendiente,
            ].join(" ");
            const nombrePaso = paso.name ?? paso.titulo;
            const slugPaso = String(nombrePaso)
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
              .replace(/\s+/g, "-");

            return (
              <article
                name={`tarjeta-paso-${slugPaso}`}
                key={paso.id ?? index}
                className={cardClass}
                data-step-name={nombrePaso}
                aria-label={`Paso ${index + 1}: ${nombrePaso}`}
              >
                <div
                  name={`indicador-paso-${index + 1}`}
                  className={bulletClass}
                >
                  {index + 1}
                </div>
                <div
                  name={`contenido-paso-${slugPaso}`}
                  className="flex flex-1 flex-col gap-2"
                >
                  <header className="flex items-start gap-2">
                    {paso.icono && (
                      <span className={stepClasses.icon}>{paso.icono}</span>
                    )}
                    <h3 className={stepClasses.title}>{nombrePaso}</h3>
                  </header>
                  {paso.descripcion && (
                    <p className={stepClasses.description}>
                      {paso.descripcion}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section
        name="seccion-contenido-paso"
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
      >
        {children}
      </section>

      {controles ? (
        <footer className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {controles}
        </footer>
      ) : null}
    </div>
  );
};
