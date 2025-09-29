import React from "react";

// Estilos reutilizables para el formulario
const formStyles = {
  label: "block text-gray-700 text-sm font-bold mb-2",
  input:
    "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
  inputError: "border-red-500",
  inputSuccess: "border-green-500",
  errorMessage: "text-red-500 text-xs italic mt-1",
  grid: "grid grid-cols-1 md:grid-cols-2 gap-4",
  buttonContainer: "flex items-center justify-end mt-6",
  cancelButton:
    "bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mr-2",
  submitButton:
    "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg",
};

export const PersonaForm = ({
  onSubmit,
  onCancel,
  formData,
  handleInputChange,
  errors,
}) => {
  // Función para determinar la clase del input
  const getInputClass = (fieldName) => {
    let classes = formStyles.input;
    if (errors[fieldName]) {
      classes += ` ${formStyles.inputError}`;
    } else if (formData[fieldName] && formData[fieldName].trim() !== "") {
      // Opcional: añadir clase de éxito si el campo tiene valor y no hay error
      // classes += ` ${formStyles.inputSuccess}`;
    }
    return classes;
  };
  return (
    <form onSubmit={onSubmit}>
      <div className={formStyles.grid}>
        {/* Columna 1 */}
        <div>
          <div className="mb-4">
            <label className={formStyles.label} htmlFor="primer_nombre">
              Primer Nombre
            </label>
            <input
              type="text"
              name="primer_nombre"
              value={formData.primer_nombre}
              onChange={handleInputChange}
              className={getInputClass("primer_nombre")}
              required
            />
            {errors.primer_nombre && (
              <p className={formStyles.errorMessage}>{errors.primer_nombre}</p>
            )}
          </div>
          <div className="mb-4">
            <label className={formStyles.label} htmlFor="segundo_nombre">
              Segundo Nombre
            </label>
            <input
              type="text"
              name="segundo_nombre"
              value={formData.segundo_nombre}
              onChange={handleInputChange}
              className={formStyles.input}
            />
          </div>
          <div className="mb-4">
            <label className={formStyles.label} htmlFor="primer_apellido">
              Primer Apellido
            </label>
            <input
              type="text"
              name="primer_apellido"
              value={formData.primer_apellido}
              onChange={handleInputChange}
              className={getInputClass("primer_apellido")}
              required
            />
            {errors.primer_apellido && (
              <p className={formStyles.errorMessage}>
                {errors.primer_apellido}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className={formStyles.label} htmlFor="segundo_apellido">
              Segundo Apellido
            </label>
            <input
              type="text"
              name="segundo_apellido"
              value={formData.segundo_apellido}
              onChange={handleInputChange}
              className={formStyles.input}
            />
          </div>
          <div className="mb-4">
            <label className={formStyles.label} htmlFor="cedula">
              Cédula
            </label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleInputChange}
              className={getInputClass("cedula")}
            />
            {errors.cedula && (
              <p className={formStyles.errorMessage}>{errors.cedula}</p>
            )}
          </div>
          <div className="mb-4">
            <label className={formStyles.label} htmlFor="fecha_nacimiento">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleInputChange}
              className={getInputClass("fecha_nacimiento")}
              required
            />
            {errors.fecha_nacimiento && (
              <p className={formStyles.errorMessage}>
                {errors.fecha_nacimiento}
              </p>
            )}
          </div>
        </div>

        {/* Columna 2 */}
        <div>
          <div className="mb-4">
            <label className={formStyles.label} htmlFor="genero">
              Género
            </label>
            <select
              name="genero"
              value={formData.genero}
              onChange={handleInputChange}
              className={formStyles.input}
              required
            >
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="mb-4">
            <label className={formStyles.label} htmlFor="nacionalidad">
              Nacionalidad
            </label>
            <input
              type="text"
              name="nacionalidad"
              value={formData.nacionalidad}
              onChange={handleInputChange}
              className={getInputClass("nacionalidad")}
              required
            />
            {errors.nacionalidad && (
              <p className={formStyles.errorMessage}>{errors.nacionalidad}</p>
            )}
          </div>
          <div className="mb-4">
            <label className={formStyles.label} htmlFor="telefono_principal">
              Teléfono Principal
            </label>
            <input
              type="tel"
              name="telefono_principal"
              value={formData.telefono_principal}
              onChange={handleInputChange}
              className={getInputClass("telefono_principal")}
              required
            />
            {errors.telefono_principal && (
              <p className={formStyles.errorMessage}>
                {errors.telefono_principal}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className={formStyles.label} htmlFor="telefono_secundario">
              Teléfono Secundario
            </label>
            <input
              type="tel"
              name="telefono_secundario"
              value={formData.telefono_secundario}
              onChange={handleInputChange}
              className={`${getInputClass(
                "telefono_secundario"
              )} [appearance:textfield]`}
            />
            {errors.telefono_secundario && (
              <p className={formStyles.errorMessage}>
                {errors.telefono_secundario}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className={formStyles.label} htmlFor="email">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={getInputClass("email")}
            />
            {errors.email && (
              <p className={formStyles.errorMessage}>{errors.email}</p>
            )}
          </div>
          <div className="mb-4">
            <label className={formStyles.label} htmlFor="tipo_persona">
              Tipo de Persona
            </label>
            <select
              name="tipo_persona"
              value={formData.tipo_persona}
              onChange={handleInputChange}
              className={formStyles.input}
            >
              <option value="">(Ninguno)</option>
              <option value="estudiante">Estudiante</option>
              <option value="representante">Representante</option>
              <option value="personal">Personal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dirección (ocupa todo el ancho) */}
      <div className="mb-4">
        <label className={formStyles.label} htmlFor="direccion">
          Dirección
        </label>
        <textarea
          name="direccion"
          value={formData.direccion}
          onChange={handleInputChange}
          className={getInputClass("direccion")}
          required
        />
        {errors.direccion && (
          <p className={formStyles.errorMessage}>{errors.direccion}</p>
        )}
      </div>

      {/* Botones */}
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
