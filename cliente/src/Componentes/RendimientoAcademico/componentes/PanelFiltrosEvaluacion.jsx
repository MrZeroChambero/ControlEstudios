import React from "react";
import {
  contenidosLayout,
  contenidosFormClasses,
  typography,
} from "../../EstilosCliente/EstilosClientes";
import { controlDeshabilitado } from "../constantesRendimiento";

const CampoSeleccion = ({
  id,
  etiqueta,
  valor,
  opciones,
  onChange,
  deshabilitado,
  ayuda,
}) => (
  <label htmlFor={id} className="flex flex-col gap-2">
    <span className={contenidosFormClasses.label}>{etiqueta}</span>
    <select
      id={id}
      name={id}
      value={valor}
      onChange={onChange}
      className={`${contenidosFormClasses.select} ${controlDeshabilitado}`}
      disabled={deshabilitado}
    >
      {opciones.map((opcion) => (
        <option key={String(opcion.value)} value={opcion.value}>
          {opcion.label}
        </option>
      ))}
    </select>
    {ayuda ? <p className={contenidosFormClasses.helper}>{ayuda}</p> : null}
  </label>
);

export const PanelFiltrosEvaluacion = ({
  componentes,
  componenteId,
  aulas,
  aulaId,
  cargandoAulas,
  deshabilitarComponentes,
  deshabilitarAulas,
  onSeleccionComponente,
  onSeleccionAula,
}) => (
  <section className={`${contenidosLayout.container} space-y-4`}>
    <header className="space-y-1">
      <h2 className={typography.titleSm}>Selecciona el componente y el aula</h2>
      <p className={typography.bodyMutedSm}>
        Primero elige el componente de aprendizaje; luego selecciona el aula
        disponible para cargar la lista de estudiantes.
      </p>
    </header>
    <div className={contenidosFormClasses.grid}>
      <CampoSeleccion
        id="seleccion-componente"
        etiqueta="Componente"
        valor={componenteId}
        onChange={onSeleccionComponente}
        deshabilitado={deshabilitarComponentes}
        opciones={[{ value: "", label: "Selecciona un componente" }].concat(
          componentes.map((item) => ({
            value: item.id_componente,
            label: item.nombre_componente,
          }))
        )}
        ayuda="Necesitas permisos para visualizar los componentes asignados."
      />
      <CampoSeleccion
        id="seleccion-aula"
        etiqueta="Aula"
        valor={aulaId}
        onChange={onSeleccionAula}
        deshabilitado={deshabilitarAulas || !componenteId}
        opciones={[{ value: "", label: "Selecciona un aula" }].concat(
          aulas.map((item) => ({
            value: item.id_aula,
            label: `Grado ${item.grado ?? "?"} · Sección ${
              item.seccion ?? "?"
            }`,
          }))
        )}
        ayuda={
          cargandoAulas
            ? "Cargando aulas disponibles..."
            : "Solo se listan las aulas asociadas al componente seleccionado."
        }
      />
    </div>
  </section>
);
