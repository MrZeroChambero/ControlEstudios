import React from "react";
import { personaFormClasses } from "./personaEstilos";

export const PersonaForm = ({
  onSubmit,
  onCancel,
  formData,
  handleInputChange,
  errors,
}) => {
  const buildFieldClass = (baseClass, fieldName) => {
    let classes = baseClass;
    if (errors[fieldName]) {
      classes += ` ${personaFormClasses.inputError}`;
    } else if (formData[fieldName] && formData[fieldName].trim() !== "") {
      classes += ` ${personaFormClasses.inputSuccess}`;
    }
    return classes;
  };
  const getInputClass = (fieldName) =>
    buildFieldClass(personaFormClasses.input, fieldName);
  const getTextAreaClass = (fieldName) =>
    buildFieldClass(personaFormClasses.textArea, fieldName);
  return (
    <form
      onSubmit={onSubmit}
      autoComplete="off"
      className={personaFormClasses.form}
    >
      <div className={personaFormClasses.grid}>
        <div className={personaFormClasses.column}>
          <div className={personaFormClasses.field}>
            <label className={personaFormClasses.label} htmlFor="primer_nombre">
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
              <p className={personaFormClasses.errorMessage}>
                {errors.primer_nombre}
              </p>
            )}
          </div>
          <div className={personaFormClasses.field}>
            <label
              className={personaFormClasses.label}
              htmlFor="segundo_nombre"
            >
              Segundo Nombre
            </label>
            <input
              type="text"
              name="segundo_nombre"
              value={formData.segundo_nombre}
              onChange={handleInputChange}
              className={personaFormClasses.input}
            />
          </div>
          <div className={personaFormClasses.field}>
            <label
              className={personaFormClasses.label}
              htmlFor="primer_apellido"
            >
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
              <p className={personaFormClasses.errorMessage}>
                {errors.primer_apellido}
              </p>
            )}
          </div>
          <div className={personaFormClasses.field}>
            <label
              className={personaFormClasses.label}
              htmlFor="segundo_apellido"
            >
              Segundo Apellido
            </label>
            <input
              type="text"
              name="segundo_apellido"
              value={formData.segundo_apellido}
              onChange={handleInputChange}
              className={personaFormClasses.input}
            />
          </div>
          <div className={personaFormClasses.field}>
            <label className={personaFormClasses.label} htmlFor="cedula">
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
              <p className={personaFormClasses.errorMessage}>{errors.cedula}</p>
            )}
          </div>
          <div className={personaFormClasses.field}>
            <label
              className={personaFormClasses.label}
              htmlFor="fecha_nacimiento"
            >
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
              <p className={personaFormClasses.errorMessage}>
                {errors.fecha_nacimiento}
              </p>
            )}
          </div>
        </div>

        <div className={personaFormClasses.column}>
          <div className={personaFormClasses.field}>
            <label className={personaFormClasses.label} htmlFor="genero">
              Género
            </label>
            <select
              name="genero"
              value={formData.genero}
              onChange={handleInputChange}
              className={personaFormClasses.select}
              required
            >
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className={personaFormClasses.field}>
            <label className={personaFormClasses.label} htmlFor="nacionalidad">
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
              <p className={personaFormClasses.errorMessage}>
                {errors.nacionalidad}
              </p>
            )}
          </div>
          <div className={personaFormClasses.field}>
            <label
              className={personaFormClasses.label}
              htmlFor="telefono_principal"
            >
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
              <p className={personaFormClasses.errorMessage}>
                {errors.telefono_principal}
              </p>
            )}
          </div>
          <div className={personaFormClasses.field}>
            <label
              className={personaFormClasses.label}
              htmlFor="telefono_secundario"
            >
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
              <p className={personaFormClasses.errorMessage}>
                {errors.telefono_secundario}
              </p>
            )}
          </div>
          <div className={personaFormClasses.field}>
            <label className={personaFormClasses.label} htmlFor="email">
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
              <p className={personaFormClasses.errorMessage}>{errors.email}</p>
            )}
          </div>
          <div className={personaFormClasses.field}>
            <label className={personaFormClasses.label} htmlFor="tipo_persona">
              Tipo de Persona
            </label>
            <select
              name="tipo_persona"
              value={formData.tipo_persona}
              onChange={handleInputChange}
              className={personaFormClasses.select}
            >
              <option value="">(Ninguno)</option>
              <option value="estudiante">Estudiante</option>
              <option value="representante">Representante</option>
              <option value="personal">Personal</option>
            </select>
          </div>
        </div>
      </div>

      <div className={personaFormClasses.field}>
        <label className={personaFormClasses.label} htmlFor="direccion">
          Dirección
        </label>
        <textarea
          name="direccion"
          value={formData.direccion}
          onChange={handleInputChange}
          className={getTextAreaClass("direccion")}
          required
        />
        {errors.direccion && (
          <p className={personaFormClasses.errorMessage}>{errors.direccion}</p>
        )}
      </div>

      <div className={personaFormClasses.actions}>
        <button
          type="button"
          onClick={onCancel}
          className={personaFormClasses.cancelButton}
        >
          Cancelar
        </button>
        <button type="submit" className={personaFormClasses.submitButton}>
          Guardar
        </button>
      </div>
    </form>
  );
};
