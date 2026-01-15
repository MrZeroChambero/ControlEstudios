import React from "react";
import { panelContextoEvaluacionClasses } from "../rendimientoEstilos";
import { formatearFechaCorta } from "../../../utilidades/formatoFechas";

const DatoContexto = ({ etiqueta, valor }) => (
  <div className={panelContextoEvaluacionClasses.card}>
    <span className={panelContextoEvaluacionClasses.label}>{etiqueta}</span>
    <span className={panelContextoEvaluacionClasses.value}>{valor}</span>
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
    <section className={panelContextoEvaluacionClasses.container}>
      <header className={panelContextoEvaluacionClasses.header}>
        <h2 className={panelContextoEvaluacionClasses.title}>
          Contexto de evaluación
        </h2>
        <p className={panelContextoEvaluacionClasses.description}>
          Confirma que los datos del periodo y del perfil sean los correctos
          antes de registrar los resultados.
        </p>
      </header>
      <div className={panelContextoEvaluacionClasses.grid}>
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
