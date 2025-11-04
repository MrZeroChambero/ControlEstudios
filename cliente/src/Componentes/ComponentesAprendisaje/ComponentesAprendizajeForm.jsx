import React from 'react';

const formStyles = {
  label: "block text-gray-700 text-sm font-bold mb-2",
  input: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
  buttonContainer: "flex items-center justify-end",
  cancelButton: "bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mr-2",
  submitButton: "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg",
};

export const ComponentesAprendizajeForm = ({ onSubmit, onCancel, formData, handleInputChange, isViewMode }) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="mb-4">
        <label className={formStyles.label} htmlFor="nombre_componente">
          Nombre del Componente
        </label>
        <input
          type="text"
          name="nombre_componente"
          value={formData.nombre_componente}
          onChange={handleInputChange}
          className={formStyles.input}
          autoComplete="off"
          required
          readOnly={isViewMode}
        />
      </div>
      {!isViewMode && (
        <div className={formStyles.buttonContainer}>
          <button
            type="button"
            onClick={onCancel}
            className={formStyles.cancelButton}
          >
            Cancelar
          </button>
          <button type="submit" className={formStyles.submitButton}>
            Guardar
          </button>
        </div>
      )}
    </form>
  );
};
