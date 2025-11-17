import React from "react";

const formStyles = {
  label: "block text-gray-700 text-sm font-bold mb-2",
  input:
    "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
  buttonContainer: "flex items-center justify-end",
  cancelButton:
    "bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mr-2",
  submitButton:
    "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg",
};

export const EvaluacionesModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentEvaluacion,
  formData,
  datosFormulario,
  modo,
}) => {
  if (!isOpen) return null;

  const titulo =
    modo === "ver"
      ? "Ver Evaluación"
      : currentEvaluacion
      ? "Editar Evaluación"
      : "Crear Evaluación";

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start z-50 overflow-y-auto py-10">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{titulo}</h2>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className={formStyles.label} htmlFor="nombre_evaluacion">
              Nombre de la Evaluación
            </label>
            {modo === "ver" ? (
              <p className="text-gray-900">{formData.nombre_evaluacion}</p>
            ) : (
              <input
                type="text"
                name="nombre_evaluacion"
                value={formData.nombre_evaluacion}
                onChange={datosFormulario}
                className={formStyles.input}
                autoComplete="off"
                required
                placeholder="Ingrese el nombre de la evaluación"
              />
            )}
          </div>
          <div className="mb-6">
            <label className={formStyles.label} htmlFor="descripcion">
              Descripción
            </label>
            {modo === "ver" ? (
              <p className="text-gray-900">{formData.descripcion || "N/A"}</p>
            ) : (
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={datosFormulario}
                className={formStyles.input}
                autoComplete="off"
                rows="3"
                placeholder="Descripción de la evaluación (opcional)"
              />
            )}
          </div>
          {modo !== "ver" && (
            <div className={formStyles.buttonContainer}>
              <button
                type="button"
                onClick={onClose}
                className={formStyles.cancelButton}
              >
                Cancelar
              </button>
              <button type="submit" className={formStyles.submitButton}>
                {currentEvaluacion ? "Actualizar" : "Guardar"}
              </button>
            </div>
          )}
        </form>
        {modo === "ver" && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
