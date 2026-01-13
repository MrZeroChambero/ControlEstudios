import React from "react";
import {
  contenidosLayout,
  contenidosFormClasses,
  typography,
} from "../../EstilosCliente/EstilosClientes";
import { tarjetaDatoClass } from "../constantesRendimiento";
import { formatearFechaCorta } from "../../../utilidades/formatoFechas";

const DatoContexto = ({ etiqueta, valor }) => (
  <div className={tarjetaDatoClass}>
    <span className={contenidosFormClasses.label}>{etiqueta}</span>
    <span className="text-sm font-semibold text-slate-800">{valor}</span>
  </div>
);

export const PanelContextoEvaluacion = ({ contexto }) => {
  if (!contexto) {
    return null;
  }

  const usuario = contexto.usuario ?? {};
  const anio = contexto.anio ?? {};
  const momento = contexto.momento ?? {};

  const periodo =
    anio.fecha_inicio && anio.fecha_fin
      ? `${formatearFechaCorta(anio.fecha_inicio)} - ${formatearFechaCorta(
          anio.fecha_fin
        )}`
      : "-";

  return (
    <section className={`${contenidosLayout.container} space-y-4`}>
      <header className="space-y-1">
        <h2 className={typography.titleSm}>Contexto de evaluación</h2>
        <p className={typography.bodyMutedSm}>
          Confirma que los datos del periodo y del perfil sean los correctos
          antes de registrar los resultados.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DatoContexto etiqueta="Usuario" valor={usuario.nombre ?? "-"} />
        <DatoContexto etiqueta="Rol" valor={usuario.rol ?? "-"} />
        <DatoContexto etiqueta="Año escolar" valor={periodo} />
        <DatoContexto
          etiqueta="Momento"
          valor={momento.nombre_momento ?? momento.nombre ?? "-"}
        />
      </div>
    </section>
  );
};
