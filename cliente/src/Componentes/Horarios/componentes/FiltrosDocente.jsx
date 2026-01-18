import React from "react";
import { horariosFormClasses as formClasses } from "../../EstilosCliente/EstilosClientes";

const FiltrosDocente = ({
  filtros,
  onFiltroChange,
  catalogos,
  cargando,
}) => {
  const aniosDisponibles = catalogos?.anios || [];
  const momentosDisponibles = catalogos?.momentos || [];
  const aulasDisponibles = catalogos?.aulas || [];

  const handleSelectChange = (e) => {
    onFiltroChange({
      ...filtros,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-slate-200 rounded-2xl bg-white shadow-sm">
      {/* Filtro por Año Escolar */}
      <div className={formClasses.fieldWrapper}>
        <label className={formClasses.label} htmlFor="filtro_anio_escolar">
          Año Escolar
        </label>
        <select
          id="filtro_anio_escolar"
          name="fk_anio_escolar"
          value={filtros.fk_anio_escolar || ""}
          onChange={handleSelectChange}
          className={formClasses.select}
          disabled={cargando || aniosDisponibles.length === 0}
        >
          <option value="">Todos los Años</option>
          {aniosDisponibles.map((anio) => (
            <option key={anio.id} value={anio.id}>
              {anio.etiqueta}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro por Momento Académico */}
      <div className={formClasses.fieldWrapper}>
        <label className={formClasses.label} htmlFor="filtro_momento">
          Momento Académico
        </label>
        <select
          id="filtro_momento"
          name="fk_momento"
          value={filtros.fk_momento || ""}
          onChange={handleSelectChange}
          className={formClasses.select}
          disabled={cargando || !filtros.fk_anio_escolar}
        >
          <option value="">Todos los Momentos</option>
          {momentosDisponibles
            .filter(m => String(m.anio_escolar) === String(filtros.fk_anio_escolar))
            .map((momento) => (
              <option key={momento.id} value={momento.id}>
                {`Momento ${momento.nombre}`}
              </option>
            ))}
        </select>
      </div>

      {/* Filtro por Aula */}
      <div className={formClasses.fieldWrapper}>
        <label className={formClasses.label} htmlFor="filtro_aula">
          Aula (Grado y Sección)
        </label>
        <select
          id="filtro_aula"
          name="fk_aula"
          value={filtros.fk_aula || ""}
          onChange={handleSelectChange}
          className={formClasses.select}
          disabled={cargando || !filtros.fk_anio_escolar}
        >
          <option value="">Todas las Aulas</option>
          {aulasDisponibles
            .filter(a => String(a.anio_escolar) === String(filtros.fk_anio_escolar))
            .map((aula) => (
              <option key={aula.id} value={aula.id}>
                {aula.descripcion}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};

export default FiltrosDocente;
