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

export const UsuariosModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentUsuario,
  formData,
  datosFormulario,
  personal,
  modo,
}) => {
  if (!isOpen) return null;

  const titulo = currentUsuario ? "Editar Usuario" : "Crear Usuario";

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start z-50 overflow-y-auto py-10">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">{titulo}</h2>
        <form onSubmit={onSubmit}>
          {/* Selección de Personal */}
          <div className="mb-4">
            <label className={formStyles.label} htmlFor="fk_personal">
              Personal *
            </label>
            <select
              name="fk_personal"
              value={formData.fk_personal}
              onChange={datosFormulario}
              className={formStyles.input}
              required
              autoComplete="off"
              disabled={!!currentUsuario} // No se puede cambiar el personal en edición
            >
              <option value="">Seleccione un personal</option>
              {personal.map((persona) => (
                <option key={persona.id_personal} value={persona.id_personal}>
                  {persona.primer_nombre} {persona.primer_apellido} -
                  {persona.cedula} -{persona.nombre_cargo || "Sin cargo"} - (
                  {persona.tipo_funcion || "Sin función"})
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-600 mt-1">
              Solo se muestran personal activo con funciones de Docente,
              Especialista o Administrativo que no tengan usuario asignado
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={formStyles.label} htmlFor="nombre_usuario">
                Nombre de Usuario *
              </label>
              <input
                type="text"
                name="nombre_usuario"
                value={formData.nombre_usuario}
                onChange={datosFormulario}
                className={formStyles.input}
                autoComplete="off"
                required
                placeholder="Nombre de usuario"
              />
            </div>
            <div>
              <label className={formStyles.label} htmlFor="rol">
                Rol *
              </label>
              <select
                name="rol"
                value={formData.rol}
                onChange={datosFormulario}
                className={formStyles.input}
                required
                autoComplete="off"
              >
                <option value="">Seleccione un rol</option>
                <option value="Administrador">Administrador</option>
                <option value="Docente">Docente</option>
                <option value="Secretaria">Secretaria</option>
                <option value="Representante">Representante</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className={formStyles.label} htmlFor="contrasena">
              {currentUsuario
                ? "Nueva Contraseña (dejar en blanco para no cambiar)"
                : "Contraseña *"}
            </label>
            <input
              type="password"
              name="contrasena"
              value={formData.contrasena}
              onChange={datosFormulario}
              className={formStyles.input}
              autoComplete="new-password"
              required={!currentUsuario}
              placeholder={currentUsuario ? "Nueva contraseña" : "Contraseña"}
            />
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
              {currentUsuario ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
