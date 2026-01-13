import React from "react";
import {
  contenidosLayout,
  contenidosFormClasses,
} from "../../EstilosCliente/EstilosClientes";
import { controlDeshabilitado } from "../constantesRendimiento";

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
    <section className={contenidosLayout.container}>
      <div className={contenidosLayout.header}>
        <div className="space-y-2">
          <h1 className={contenidosLayout.title}>
            Gestión del rendimiento académico
          </h1>
          <p className={contenidosLayout.description}>
            Evalúa a cada estudiante asignando las literales permitidas en los
            indicadores de desempeño.
          </p>
          {marcaTemporal ? (
            <p className="text-xs text-slate-500">
              Última respuesta: {marcaTemporal}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onRecargar}
            className={`${contenidosFormClasses.ghostButton} ${controlDeshabilitado}`}
            disabled={estaCargandoContexto || estaGuardando}
          >
            {estaCargandoContexto ? "Actualizando..." : "Recargar contexto"}
          </button>
          <button
            type="button"
            onClick={onGuardar}
            className={`${contenidosLayout.addButton} ${controlDeshabilitado}`}
            disabled={deshabilitarGuardar}
          >
            {estaGuardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </section>
  );
};
