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

export const ContenidosModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentContenido,
  formData,
  areas,
  datosFormulario,
  modo,
}) => {
  if (!isOpen) return null;

  const titulo =
    modo === "ver"
      ? "Ver Contenido"
      : currentContenido
      ? "Editar Contenido"
      : "Crear Contenido";

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start z-50 overflow-y-auto py-10">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{titulo}</h2>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className={formStyles.label} htmlFor="nombre">
              Nombre del Contenido
            </label>
            {modo === "ver" ? (
              <p className="text-gray-900">{formData.nombre}</p>
            ) : (
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={datosFormulario}
                className={formStyles.input}
                autoComplete="off"
                required
                placeholder="Ingrese el nombre del contenido"
              />
            )}
          </div>
          <div className="mb-4">
            <label className={formStyles.label} htmlFor="fk_area_aprendizaje">
              Área de Aprendizaje
            </label>
            {modo === "ver" ? (
              <p className="text-gray-900">
                {areas.find(
                  (a) => a.id_area_aprendizaje == formData.fk_area_aprendizaje
                )?.nombre_area || "N/A"}
              </p>
            ) : (
              <select
                name="fk_area_aprendizaje"
                value={formData.fk_area_aprendizaje}
                onChange={datosFormulario}
                className={formStyles.input}
                required
                autoComplete="off"
              >
                <option value="">Seleccione un área</option>
                {areas.map((area) => (
                  <option
                    key={area.id_area_aprendizaje}
                    value={area.id_area_aprendizaje}
                  >
                    {area.nombre_area}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="mb-4">
            <label className={formStyles.label} htmlFor="nivel">
              Nivel
            </label>
            {modo === "ver" ? (
              <p className="text-gray-900">{formData.nivel}</p>
            ) : (
              <select
                name="nivel"
                value={formData.nivel}
                onChange={datosFormulario}
                className={formStyles.input}
                required
                autoComplete="off"
              >
                <option value="">Seleccione un nivel</option>
                <option value="primero">Primero</option>
                <option value="segundo">Segundo</option>
                <option value="tercero">Tercero</option>
                <option value="cuarto">Cuarto</option>
                <option value="quinto">Quinto</option>
                <option value="sexto">Sexto</option>
              </select>
            )}
          </div>
          <div className="mb-4">
            <label className={formStyles.label} htmlFor="orden_contenido">
              Orden
            </label>
            {modo === "ver" ? (
              <p className="text-gray-900">{formData.orden_contenido}</p>
            ) : (
              <input
                type="number"
                name="orden_contenido"
                value={formData.orden_contenido}
                onChange={datosFormulario}
                className={formStyles.input}
                autoComplete="off"
                required
                min="1"
                placeholder="Orden del contenido"
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
                placeholder="Descripción del contenido (opcional)"
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
                {currentContenido ? "Actualizar" : "Guardar"}
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
