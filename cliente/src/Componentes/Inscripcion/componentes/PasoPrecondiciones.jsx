import React from "react";
import { inscripcionLayout } from "../../EstilosCliente/EstilosClientes";

export const PasoPrecondiciones = ({ resultado, cargando, onReintentar }) => {
  if (cargando) {
    return (
      <div
        name="contenedor-precondiciones-cargando"
        className={inscripcionLayout.container}
      >
        <h2 className={inscripcionLayout.title}>Verificando precondiciones</h2>
        <p className="text-sm text-slate-500">
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
        <p className="text-sm text-slate-500">
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

  return (
    <div name="contenedor-precondiciones" className="space-y-4">
      <header className={inscripcionLayout.header}>
        <div name="precondiciones-descripcion">
          <h2 className={inscripcionLayout.title}>Estado de precondiciones</h2>
          <p className={inscripcionLayout.description}>
            {listo
              ? "Todo está configurado para iniciar la inscripción estudiantil."
              : "Debes atender los siguientes pendientes antes de inscribir."}
          </p>
        </div>
        <div
          name="precondiciones-estado"
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            listo
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {listo ? "Requisitos completos" : "Requisitos pendientes"}
        </div>
      </header>

      {listo ? (
        <article
          name="precondiciones-listo"
          className="space-y-3 text-sm text-slate-600"
        >
          <p>
            Año escolar activo: <strong>{resultado.anio?.fecha_inicio}</strong>{" "}
            a <strong>{resultado.anio?.fecha_fin}</strong>.
          </p>
          <p>
            Recuerda que la fecha límite de inscripción es el{" "}
            <strong>{resultado.anio?.fecha_limite_inscripcion}</strong>.
          </p>
        </article>
      ) : (
        <article name="precondiciones-pendientes" className="space-y-4">
          <div
            name="precondiciones-recomendaciones"
            className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700"
          >
            <p className="font-semibold">Acciones recomendadas</p>
            <p>
              Asigna docentes titulares a las secciones activas y asegúrate de
              contar con cupos disponibles antes de continuar con la
              inscripción.
            </p>
          </div>
          <div name="precondiciones-pendientes-detalle" className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">
              Secciones sin docente asignado:
            </p>
            {resultado.faltantes_docentes?.length ? (
              <ul className="grid gap-2 md:grid-cols-2">
                {resultado.faltantes_docentes.map((aula) => (
                  <li
                    key={aula.id_aula}
                    name={`precondiciones-aula-${aula.id_aula}`}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600"
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
              <p className="text-sm text-slate-500">
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
