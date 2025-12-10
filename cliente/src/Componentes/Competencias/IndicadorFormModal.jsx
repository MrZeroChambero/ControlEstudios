import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  baseContainer,
  baseTitle,
  baseDescription,
  primaryButtonBase,
  neutralButtonBase,
  fieldBase,
  helperTextBase,
} from "../EstilosCliente/EstilosClientes";

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
          indicador?.fk_competencia || competencia?.id_competencia || null,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6">
      <form
        onSubmit={manejarSubmit}
        className={`${baseContainer} max-h-[90vh] w-full max-w-2xl overflow-y-auto`}
      >
        <div className="mb-6">
          <h2 className={baseTitle}>{titulo}</h2>
          {competencia && (
            <p className={baseDescription}>
              Competencia:{" "}
              {competencia?.nombre_competencia || competencia?.nombre}
            </p>
          )}
        </div>

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
              Orden (opcional)
            </label>
            <input
              type="number"
              name="orden"
              value={formData.orden}
              onChange={manejarCambio}
              className={fieldBase}
              placeholder="Ingrese el orden deseado"
              min={1}
              max={999}
            />
            <p className={helperTextBase}>
              El orden debe estar entre 1 y 999. Si lo dejas vacío, se asigna
              automáticamente.
            </p>
            {errores?.orden && (
              <p className={helperTextBase}>{errores.orden.join(" ")}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
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
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
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
