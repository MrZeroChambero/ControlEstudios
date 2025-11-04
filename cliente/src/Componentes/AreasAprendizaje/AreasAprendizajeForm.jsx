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

export const AreasAprendizajeForm = ({
  onSubmit,
  onCancel,
  currentArea,
  formData,
  componentes,
  funciones,
  datosFormulario,
  modoVer = false,
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="mb-4">
        <label className={formStyles.label} htmlFor="nombre_area">
          Nombre del Área
        </label>
        {modoVer ? (
          <p className="text-gray-900">{formData.nombre_area}</p>
        ) : (
          <input
            type="text"
            name="nombre_area"
            value={formData.nombre_area}
            onChange={datosFormulario}
            className={formStyles.input}
            autoComplete="off"
            required
            placeholder="Ingrese el nombre del área"
          />
        )}
      </div>
      <div className="mb-4">
        <label className={formStyles.label} htmlFor="fk_componente">
          Componente
        </label>
        {modoVer ? (
          <p className="text-gray-900">
            {componentes.find((c) => c.id_componente == formData.fk_componente)
              ?.nombre_componente || "N/A"}
          </p>
        ) : (
          <select
            name="fk_componente"
            value={formData.fk_componente}
            onChange={datosFormulario}
            className={formStyles.input}
            required
            autoComplete="off"
          >
            <option value="">Seleccione un componente</option>
            {componentes.map((componente) => (
              <option
                key={componente.id_componente}
                value={componente.id_componente}
              >
                {componente.nombre_componente}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="mb-6">
        <label className={formStyles.label} htmlFor="fk_funcion">
          Función
        </label>
        {modoVer ? (
          <p className="text-gray-900">
            {funciones.find((f) => f.id_funcion_personal == formData.fk_funcion)
              ?.nombre || "N/A"}
          </p>
        ) : (
          <select
            name="fk_funcion"
            value={formData.fk_funcion}
            onChange={datosFormulario}
            className={formStyles.input}
            autoComplete="off"
            required
          >
            <option value="">Seleccione una función</option>
            {funciones.map((funcion) => (
              <option
                key={funcion.id_funcion_personal}
                value={funcion.id_funcion_personal}
              >
                {funcion.nombre} - {funcion.tipo}
              </option>
            ))}
          </select>
        )}
      </div>
      {!modoVer && (
        <div className={formStyles.buttonContainer}>
          <button
            type="button"
            onClick={onCancel}
            className={formStyles.cancelButton}
          >
            Cancelar
          </button>
          <button type="submit" className={formStyles.submitButton}>
            {currentArea ? "Actualizar" : "Guardar"}
          </button>
        </div>
      )}
    </form>
  );
};
