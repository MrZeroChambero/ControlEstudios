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

export const TemaFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentTema,
  formData,
  onChange,
  modo,
}) => {
  if (!isOpen) return null;

  const titulo = currentTema ? "Editar Tema" : "Crear Tema";

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start z-50 overflow-y-auto py-10">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{titulo}</h2>
        <form onSubmit={onSubmit}>
          <div className="mb-6">
            <label className={formStyles.label} htmlFor="nombre_tema">
              Nombre del Tema *
            </label>
            <input
              type="text"
              name="nombre_tema"
              value={formData.nombre_tema}
              onChange={onChange}
              className={formStyles.input}
              autoComplete="off"
              required
              placeholder="Ingrese el nombre del tema"
            />
            <p className="text-gray-500 text-xs mt-1">
              Solo letras, números y espacios
            </p>
          </div>

          <div className={formStyles.buttonContainer}>
            <button
              type="button"
              onClick={onClose}
              className={formStyles.cancelButton}
            >
              Cancelar
            </button>
            <button type="submit" className={formStyles.submitButton}>
              {currentTema ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
