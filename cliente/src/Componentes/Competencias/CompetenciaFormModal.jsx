import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  contenidosFormClasses,
  neutralButtonBase,
  helperTextBase,
} from "../EstilosCliente/EstilosClientes";
import VentanaModal from "../EstilosCliente/VentanaModal";

export const CompetenciaFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  modo = "crear",
  datos = null,
  areas = [],
  componentes = [],
  defaultAreaId = "",
}) => {
  const [areaSeleccionada, setAreaSeleccionada] = useState("");
  const [formData, setFormData] = useState({
    fk_componente: "",
    nombre_competencia: "",
    descripcion_competencia: "",
  });
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setErrores({});
      return;
    }

    if (datos) {
      setAreaSeleccionada(datos?.area?.id?.toString() ?? "");
      setFormData({
        fk_componente: datos?.fk_componente?.toString() ?? "",
        nombre_competencia: datos?.nombre_competencia ?? "",
        descripcion_competencia: datos?.descripcion_competencia ?? "",
      });
    } else {
      const areaInicial = defaultAreaId ? defaultAreaId.toString() : "";
      setAreaSeleccionada(areaInicial);
      setFormData({
        fk_componente: "",
        nombre_competencia: "",
        descripcion_competencia: "",
      });
    }
    setErrores({});
  }, [datos, defaultAreaId, isOpen]);

  const componentesFiltrados = useMemo(() => {
    if (!areaSeleccionada) {
      return componentes;
    }
    return componentes.filter(
      (item) => item.fk_area?.toString() === areaSeleccionada?.toString()
    );
  }, [componentes, areaSeleccionada]);

  if (!isOpen) {
    return null;
  }

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const manejarSubmit = async (evento) => {
    evento.preventDefault();
    setErrores({});

    try {
      await onSubmit({
        ...formData,
        fk_componente: formData.fk_componente
          ? parseInt(formData.fk_componente, 10)
          : null,
      });
      onClose();
    } catch (error) {
      const detalle = error?.validation ?? {};
      setErrores(detalle);
    }
  };

  const titulo =
    modo === "editar" ? "Editar competencia" : "Registrar competencia";

  return (
    <VentanaModal
      isOpen={isOpen}
      onClose={onClose}
      title={titulo}
      subtitle="Complete la informacion de la competencia seleccionada."
      size="lg"
      contentClassName="max-w-3xl"
    >
      <form onSubmit={manejarSubmit} className="space-y-6">
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
                setFormData((prev) => ({ ...prev, fk_componente: "" }));
              }}
            >
              <option value="">Seleccione un area</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.nombre}
                </option>
              ))}
            </select>
            {errores?.fk_componente && (
              <p className={helperTextBase}>
                {errores.fk_componente.join(" ")}
              </p>
            )}
          </div>

          <div className={contenidosFormClasses.fieldWrapper}>
            <label className={contenidosFormClasses.label}>
              Componente de aprendizaje
            </label>
            <select
              name="fk_componente"
              value={formData.fk_componente}
              onChange={manejarCambio}
              className={contenidosFormClasses.select}
            >
              <option value="">Seleccione un componente</option>
              {componentesFiltrados.map((componente) => (
                <option key={componente.id} value={componente.id}>
                  {componente.nombre}
                </option>
              ))}
            </select>
          </div>

          <div
            className={`${contenidosFormClasses.fieldWrapper} md:col-span-2`}
          >
            <label className={contenidosFormClasses.label}>
              Nombre de la competencia
            </label>
            <input
              type="text"
              name="nombre_competencia"
              value={formData.nombre_competencia}
              onChange={manejarCambio}
              className={contenidosFormClasses.input}
              placeholder="Ingrese el nombre de la competencia"
            />
            {errores?.nombre_competencia && (
              <p className={helperTextBase}>
                {errores.nombre_competencia.join(" ")}
              </p>
            )}
          </div>

          <div
            className={`${contenidosFormClasses.fieldWrapper} md:col-span-2`}
          >
            <label className={contenidosFormClasses.label}>
              Descripcion de la competencia
            </label>
            <textarea
              name="descripcion_competencia"
              value={formData.descripcion_competencia}
              onChange={manejarCambio}
              className={`${contenidosFormClasses.textArea} min-h-[120px]`}
              placeholder="Describa brevemente la competencia"
            />
            {errores?.descripcion_competencia && (
              <p className={helperTextBase}>
                {errores.descripcion_competencia.join(" ")}
              </p>
            )}
          </div>
        </div>

        <div className={contenidosFormClasses.actions}>
          <button
            type="button"
            onClick={onClose}
            className={`${neutralButtonBase} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}
          >
            Cancelar
          </button>
          <button type="submit" className={contenidosFormClasses.primaryButton}>
            Guardar cambios
          </button>
        </div>
      </form>
    </VentanaModal>
  );
};

CompetenciaFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  modo: PropTypes.string,
  datos: PropTypes.object,
  areas: PropTypes.array,
  componentes: PropTypes.array,
  defaultAreaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
