import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  contenidosFormClasses,
  neutralButtonBase,
} from "../EstilosCliente/EstilosClientes";
import VentanaModal from "../EstilosCliente/VentanaModal";

export const CompetenciasFilterModal = ({
  isOpen,
  onClose,
  onApply,
  areas,
  componentes,
  filters,
}) => {
  const [areaSeleccionada, setAreaSeleccionada] = useState("");
  const [componenteSeleccionado, setComponenteSeleccionado] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setAreaSeleccionada(filters.areaId ?? "");
    setComponenteSeleccionado(filters.componenteId ?? "");
  }, [filters, isOpen]);

  const componentesDisponibles = useMemo(() => {
    if (!areaSeleccionada) {
      return componentes;
    }
    return componentes.filter(
      (item) => item.fk_area?.toString() === areaSeleccionada?.toString()
    );
  }, [areaSeleccionada, componentes]);

  if (!isOpen) {
    return null;
  }

  const manejarCerrar = () => {
    onClose?.();
  };

  const manejarLimpiar = () => {
    setAreaSeleccionada("");
    setComponenteSeleccionado("");
  };

  const manejarSubmit = (evento) => {
    evento.preventDefault();
    onApply?.({
      areaId: areaSeleccionada,
      componenteId: componenteSeleccionado,
    });
    onClose?.();
  };

  return (
    <VentanaModal
      isOpen={isOpen}
      onClose={manejarCerrar}
      title="Filtros de competencias"
      subtitle="Seleccione el area y el componente para refinar la lista de competencias."
      size="md"
      contentClassName="max-w-xl"
    >
      <form onSubmit={manejarSubmit} className="space-y-6" autoComplete="off">
        <div className={contenidosFormClasses.grid}>
          <div className={contenidosFormClasses.fieldWrapper}>
            <label className={contenidosFormClasses.label}>
              Area de aprendizaje
            </label>
            <select
              className={contenidosFormClasses.select}
              value={areaSeleccionada}
              onChange={(evento) => {
                setAreaSeleccionada(evento.target.value);
                setComponenteSeleccionado("");
              }}
            >
              <option value="">Todas las areas</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={contenidosFormClasses.fieldWrapper}>
            <label className={contenidosFormClasses.label}>
              Componente de aprendizaje
            </label>
            <select
              className={contenidosFormClasses.select}
              value={componenteSeleccionado}
              onChange={(evento) =>
                setComponenteSeleccionado(evento.target.value)
              }
            >
              <option value="">Todos los componentes</option>
              {componentesDisponibles.map((componente) => (
                <option key={componente.id} value={componente.id}>
                  {componente.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={`${contenidosFormClasses.actions} mt-6`}>
          <button
            type="button"
            onClick={manejarLimpiar}
            className={`${neutralButtonBase} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}
          >
            Limpiar filtros
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={manejarCerrar}
              className={`${neutralButtonBase} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={contenidosFormClasses.primaryButton}
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      </form>
    </VentanaModal>
  );
};

CompetenciasFilterModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  areas: PropTypes.array.isRequired,
  componentes: PropTypes.array.isRequired,
  filters: PropTypes.shape({
    areaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    componenteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};
