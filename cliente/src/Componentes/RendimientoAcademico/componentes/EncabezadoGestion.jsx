import React from "react";
import {
  encabezadoGestionClasses,
  controlDeshabilitado,
} from "../rendimientoEstilos";

export const EncabezadoGestion = ({
  estaCargandoContexto,
  estaGuardando,
  hayMatriz,
  hayCambios,
  onRecargar,
  onGuardar,
  marcaTemporal,
}) => {
  const deshabilitarGuardar = estaGuardando || !hayMatriz || !hayCambios;

  return (
    <section className={encabezadoGestionClasses.container}>
      <div className={encabezadoGestionClasses.header}>
        <div className={encabezadoGestionClasses.content}>
          <h1 className={encabezadoGestionClasses.title}>
            Gestión del rendimiento académico
          </h1>
          <p className={encabezadoGestionClasses.description}>
            Evalúa a cada estudiante asignando las literales permitidas en los
            indicadores de desempeño.
          </p>
          {marcaTemporal ? (
            <p className={encabezadoGestionClasses.timestamp}>
              Última respuesta: {marcaTemporal}
            </p>
          ) : null}
        </div>
        <div className={encabezadoGestionClasses.actions}>
          <button
            type="button"
            onClick={onRecargar}
            className={`${encabezadoGestionClasses.refreshButton} ${controlDeshabilitado}`}
            disabled={estaCargandoContexto || estaGuardando}
          >
            {estaCargandoContexto ? "Actualizando..." : "Recargar contexto"}
          </button>
          <button
            type="button"
            onClick={onGuardar}
            className={`${encabezadoGestionClasses.saveButton} ${controlDeshabilitado}`}
            disabled={deshabilitarGuardar}
          >
            {estaGuardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </section>
  );
};
