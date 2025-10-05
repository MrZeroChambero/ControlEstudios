import React from "react";

// Extracción de clases de Tailwind para mejorar la legibilidad y mantenibilidad
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

export const UsuarioForm = ({
  onSubmit,
  onCancel,
  currentUser,
  formData,
  personas,
  datosFormulario,
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="mb-4">
        <label className={formStyles.label} htmlFor="id_persona">
          Persona
        </label>
        <select
          name="id_persona"
          value={formData.id_persona}
          onChange={datosFormulario}
          className={formStyles.input}
          required
          autoComplete="off"
        >
          <option value="">Seleccione una persona</option>
          {personas.map((persona) => (
            <option key={persona.id_persona} value={persona.id_persona}>
              {`${persona.primer_nombre} ${persona.primer_apellido} - ${persona.cedula}`}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className={formStyles.label} htmlFor="nombre_usuario">
          Nombre de Usuario
        </label>
        <input
          type="text"
          name="nombre_usuario"
          value={formData.nombre_usuario}
          onChange={datosFormulario}
          className={formStyles.input}
          autoComplete="off"
          required
        />
      </div>
      <div className="mb-4">
        <label className={formStyles.label} htmlFor="contrasena">
          Contraseña
        </label>
        <input
          type="password"
          name="contrasena"
          value={formData.contrasena}
          onChange={datosFormulario}
          className={formStyles.input}
          placeholder={currentUser ? "Dejar en blanco para no cambiar" : ""}
          autoComplete="off"
          required={!currentUser}
        />
      </div>
      <div className="mb-6">
        <label className={formStyles.label} htmlFor="rol">
          Rol
        </label>
        <select
          name="rol"
          value={formData.rol}
          onChange={datosFormulario}
          className={formStyles.input}
          autoComplete="off"
          required
        >
          <option value="">elijar un rol</option>
          <option value="Administrador">Administrador</option>
          <option value="Docente">Docente</option>
          <option value="Secretaria">Secretaria</option>
          <option value="Representante">Representante</option>
        </select>
      </div>
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
    </form>
  );
};
