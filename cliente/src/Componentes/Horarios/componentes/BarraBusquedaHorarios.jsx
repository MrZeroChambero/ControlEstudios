import React from "react";
import { FaSync, FaEye } from "react-icons/fa";
import { barraBusquedaClases } from "./horariosEstilos";

const BarraBusquedaHorarios = ({
  valor,
  onCambio,
  onActualizar,
  MostrarTabla,
  MostrarGeneral,
  aniosEscolares,
  momentos,
  anioSeleccionado,
  momentoSeleccionado,
  onCambioAnio,
  onCambioMomento,
}) => (
  <div className={barraBusquedaClases.contenedor}>
    <div className={barraBusquedaClases.envoltorioEntrada}>
      <input
        type="text"
        className={barraBusquedaClases.entrada}
        placeholder="Buscar por docente, componente o día"
        value={valor}
        onChange={(evento) => onCambio(evento.target.value)}
      />
    </div>
    <div className={barraBusquedaClases.envoltorioSelect}>
      <select
        className={barraBusquedaClases.select}
        value={anioSeleccionado || ""}
        onChange={(e) => onCambioAnio(e.target.value || null)}
      >
        <option value="">Seleccionar año escolar</option>
        {aniosEscolares.map((anioEscolar) => {
          const etiqueta =
            anioEscolar.etiqueta ??
            String(anioEscolar.id ?? anioEscolar.anio ?? "");
          return (
            <option
              key={anioEscolar.id ?? anioEscolar.anio}
              value={anioEscolar.id ?? anioEscolar.anio}
            >
              {etiqueta}
            </option>
          );
        })}
      </select>
    </div>
    <div className={barraBusquedaClases.envoltorioSelect}>
      <select
        className={barraBusquedaClases.select}
        value={momentoSeleccionado || ""}
        onChange={(e) => onCambioMomento(e.target.value || null)}
      >
        <option value="">Todos los momentos</option>
        {momentos.map((momento) => (
          <option key={momento.id} value={momento.id}>
            {`Momento ${
              momento.nombre_momento ??
              momento.codigo ??
              momento.nombre ??
              momento.id
            }`}
          </option>
        ))}
      </select>
    </div>
    <button
      type="button"
      className={barraBusquedaClases.botonActualizar}
      onClick={MostrarTabla}
    >
      <FaEye className="h-4 w-4" />
      <span>{MostrarGeneral ? "Docente" : "Aula"}</span>
    </button>
    <button
      type="button"
      className={barraBusquedaClases.botonActualizar}
      onClick={onActualizar}
    >
      <FaSync className="h-4 w-4" />
      <span>Actualizar</span>
    </button>
  </div>
);

export default BarraBusquedaHorarios;
