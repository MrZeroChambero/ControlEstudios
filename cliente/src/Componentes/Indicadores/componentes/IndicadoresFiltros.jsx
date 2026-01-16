import React from "react";
import { indicadoresFormClasses } from "../indicadoresEstilos";

const formClasses = indicadoresFormClasses;

export const IndicadoresFiltros = ({
  areas,
  componentes,
  competencias,
  areaSeleccionada,
  componenteSeleccionado,
  competenciaSeleccionada,
  onAreaChange,
  onComponenteChange,
  onCompetenciaChange,
}) => (
  <div className="mb-6 grid gap-4 lg:grid-cols-3">
    <div className={formClasses.fieldWrapper}>
      <label className={formClasses.label}>Área de aprendizaje</label>
      <select
        className={formClasses.select}
        value={areaSeleccionada}
        onChange={(evento) => onAreaChange(evento.target.value)}
      >
        <option value="">Todas las áreas</option>
        {areas.map((area) => (
          <option key={area.id} value={area.id}>
            {area.nombre}
          </option>
        ))}
      </select>
      <p className={formClasses.helper}>
        Filtra los componentes y competencias vinculados a esta área.
      </p>
    </div>

    <div className={formClasses.fieldWrapper}>
      <label className={formClasses.label}>Componente</label>
      <select
        className={formClasses.select}
        value={componenteSeleccionado}
        onChange={(evento) => onComponenteChange(evento.target.value)}
        disabled={componentes.length === 0}
      >
        <option value="">Todos los componentes</option>
        {componentes.map((componente) => (
          <option key={componente.id} value={componente.id}>
            {componente.nombre}
          </option>
        ))}
      </select>
      <p className={formClasses.helper}>
        Opcional: limite la vista a un componente específico.
      </p>
    </div>

    <div className={formClasses.fieldWrapper}>
      <label className={formClasses.label}>Competencia</label>
      <select
        className={formClasses.select}
        value={competenciaSeleccionada}
        onChange={(evento) => onCompetenciaChange(evento.target.value)}
        disabled={competencias.length === 0}
      >
        <option value="">Todas las competencias</option>
        {competencias.map((competencia) => (
          <option
            key={competencia.id_competencia}
            value={competencia.id_competencia}
          >
            {competencia.nombre_competencia}
          </option>
        ))}
      </select>
      <p className={formClasses.helper}>
        Seleccione una competencia para habilitar la creación de indicadores.
      </p>
    </div>
  </div>
);
