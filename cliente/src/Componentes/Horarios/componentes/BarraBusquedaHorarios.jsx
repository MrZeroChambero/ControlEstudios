import React from "react";
import { FaSync } from "react-icons/fa";
import {
  horariosLayout,
  horariosTableClasses,
} from "../../EstilosCliente/EstilosClientes";

const BarraBusquedaHorarios = ({ valor, onCambio, onActualizar }) => (
  <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <div className="w-full md:max-w-xs">
      <input
        type="text"
        className={horariosTableClasses.filterInput}
        placeholder="Buscar por docente, componente o día"
        value={valor}
        onChange={(evento) => onCambio(evento.target.value)}
      />
    </div>
    <button
      type="button"
      className={horariosLayout.addButton}
      onClick={onActualizar}
    >
      <FaSync className="h-4 w-4" />
      <span>Actualizar</span>
    </button>
  </div>
);

export default BarraBusquedaHorarios;
