import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  primaryButtonBase,
  neutralButtonBase,
  fieldBase,
  helperTextBase,
} from "../EstilosCliente/EstilosClientes";
import VentanaModal from "../EstilosCliente/VentanaModal";

const aspectos = [
  { valor: "ser", etiqueta: "Ser" },
  { valor: "hacer", etiqueta: "Hacer" },
  { valor: "conocer", etiqueta: "Conocer" },
  { valor: "convivir", etiqueta: "Convivir" },
];

export const IndicadorFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  modo = "crear",
  indicador = null,
  competencia = null,
}) => {
  const [formData, setFormData] = useState({
    fk_competencia: competencia?.id_competencia || competencia?.id || null,
    nombre_indicador: "",
    aspecto: "ser",
    orden: "",
  });
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (indicador) {
      setFormData({
        fk_competencia:
          indicador?.fk_competencia ||
          competencia?.id_competencia ||
          competencia?.id ||
          null,
        nombre_indicador: indicador?.nombre_indicador ?? "",
        aspecto: indicador?.aspecto ?? "ser",
        orden: indicador?.orden?.toString() ?? "",
      });
    } else {
      setFormData({
        fk_competencia: competencia?.id_competencia || competencia?.id || null,
        nombre_indicador: "",
        aspecto: "ser",
        orden: "",
      });
    }
    setErrores({});
  }, [indicador, competencia, isOpen]);

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
        fk_competencia: formData.fk_competencia
          ? parseInt(formData.fk_competencia, 10)
          : null,
        orden: formData.orden ? parseInt(formData.orden, 10) : null,
      });
      onClose();
    } catch (error) {
      const detalle = error?.validation ?? {};
      setErrores(detalle);
    }
  };

  const titulo = modo === "editar" ? "Editar indicador" : "Registrar indicador";
  const modalSubtitle = competencia
    ? `Competencia: ${
        competencia?.nombre_competencia || competencia?.nombre || "Sin nombre"
      }`
    : "Registra los detalles del indicador.";

  return (
    <VentanaModal
      isOpen={isOpen}
      onClose={onClose}
      title={titulo}
      subtitle={modalSubtitle}
      size="md"
      contentClassName="max-w-2xl"
    >
      <form onSubmit={manejarSubmit} className="space-y-6">
        <div className="grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nombre del indicador
            </label>
            <input
              type="text"
              name="nombre_indicador"
              value={formData.nombre_indicador}
              onChange={manejarCambio}
              className={fieldBase}
              placeholder="Ingrese el nombre del indicador"
            />
            {errores?.nombre_indicador && (
              <p className={helperTextBase}>
                {errores.nombre_indicador.join(" ")}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Aspecto
              </label>
              <select
                name="aspecto"
                value={formData.aspecto}
                onChange={manejarCambio}
                className={fieldBase}
              >
                {aspectos.map((item) => (
                  <option key={item.valor} value={item.valor}>
                    {item.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Orden
              </label>
              <input
                type="number"
                name="orden"
                value={formData.orden}
                onChange={manejarCambio}
                className={fieldBase}
                placeholder="Defina el orden de presentación"
                min={1}
                max={999}
              />
              <p className={helperTextBase}>
                El orden debe estar entre 1 y 999. Déjalo vacío para asignarlo
                automáticamente.
              </p>
              {errores?.orden && (
                <p className={helperTextBase}>{errores.orden.join(" ")}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`${neutralButtonBase} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`${primaryButtonBase} bg-blue-600 hover:bg-blue-700`}
          >
            Guardar indicador
          </button>
        </div>
      </form>
    </VentanaModal>
  );
};

IndicadorFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  modo: PropTypes.string,
  indicador: PropTypes.object,
  competencia: PropTypes.object,
};
