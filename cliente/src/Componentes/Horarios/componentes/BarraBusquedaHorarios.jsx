import React from "react";
import { FaSync } from "react-icons/fa";
import { barraBusquedaClases } from "./horariosEstilos";

const BarraBusquedaHorarios = ({ valor, onCambio, onActualizar }) => (
  <div className={barraBusquedaClases.container}>
    <div className={barraBusquedaClases.inputWrapper}>
      <input
        type="text"
        className={barraBusquedaClases.input}
        placeholder="Buscar por docente, componente o día"
        value={valor}
        onChange={(evento) => onCambio(evento.target.value)}
      />
    </div>
    <button
      type="button"
      className={barraBusquedaClases.actualizarButton}
      onClick={onActualizar}
    >
      <FaSync className="h-4 w-4" />
      <span>Actualizar</span>
    </button>
  </div>
);

export default BarraBusquedaHorarios;
