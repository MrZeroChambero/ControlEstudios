import React from "react";

const estilos = {
  label: "block text-gray-700 text-sm font-bold mb-2",
  input:
    "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
  error: "text-red-500 text-xs italic mt-1",
  buttonRow: "flex items-center justify-end mt-6",
  cancelBtn:
    "bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mr-2",
  submitBtn:
    "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg",
};

/**
 * EstudiantePersonaForm
 * Props:
 *  - formData: objeto controlado
 *  - onChange: function(event)
 *  - onSubmit: function(event)
 *  - onCancel: function()
 *  - errors: objeto de errores
 *
 * Nota: el campo tipo_persona es fijo a "estudiante".
 */
const EstudiantePersonaForm = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  errors = {},
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e);
      }}
      noValidate
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={estilos.label}>Primer Nombre</label>
          <input
            name="primer_nombre"
            value={formData.primer_nombre}
            onChange={onChange}
            className={estilos.input}
            required
          />
          {errors.primer_nombre && (
            <p className={estilos.error}>{errors.primer_nombre}</p>
          )}
        </div>

        <div>
          <label className={estilos.label}>Segundo Nombre</label>
          <input
            name="segundo_nombre"
            value={formData.segundo_nombre}
            onChange={onChange}
            className={estilos.input}
          />
        </div>

        <div>
          <label className={estilos.label}>Primer Apellido</label>
          <input
            name="primer_apellido"
            value={formData.primer_apellido}
            onChange={onChange}
            className={estilos.input}
            required
          />
          {errors.primer_apellido && (
            <p className={estilos.error}>{errors.primer_apellido}</p>
          )}
        </div>

        <div>
          <label className={estilos.label}>Segundo Apellido</label>
          <input
            name="segundo_apellido"
            value={formData.segundo_apellido}
            onChange={onChange}
            className={estilos.input}
          />
        </div>

        <div>
          <label className={estilos.label}>Cédula</label>
          <input
            name="cedula"
            value={formData.cedula}
            onChange={onChange}
            className={estilos.input}
          />
          {errors.cedula && <p className={estilos.error}>{errors.cedula}</p>}
        </div>

        <div>
          <label className={estilos.label}>Fecha de Nacimiento</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={onChange}
            className={estilos.input}
            required
          />
          {errors.fecha_nacimiento && (
            <p className={estilos.error}>{errors.fecha_nacimiento}</p>
          )}
        </div>

        <div>
          <label className={estilos.label}>Género</label>
          <select
            name="genero"
            value={formData.genero}
            onChange={onChange}
            className={estilos.input}
            required
          >
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div>
          <label className={estilos.label}>Nacionalidad</label>
          <input
            name="nacionalidad"
            value={formData.nacionalidad}
            onChange={onChange}
            className={estilos.input}
            required
          />
          {errors.nacionalidad && (
            <p className={estilos.error}>{errors.nacionalidad}</p>
          )}
        </div>

        <div>
          <label className={estilos.label}>Teléfono Principal</label>
          <input
            name="telefono_principal"
            value={formData.telefono_principal}
            onChange={onChange}
            className={estilos.input}
            required
          />
          {errors.telefono_principal && (
            <p className={estilos.error}>{errors.telefono_principal}</p>
          )}
        </div>

        <div>
          <label className={estilos.label}>Teléfono Secundario</label>
          <input
            name="telefono_secundario"
            value={formData.telefono_secundario}
            onChange={onChange}
            className={estilos.input}
          />
          {errors.telefono_secundario && (
            <p className={estilos.error}>{errors.telefono_secundario}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className={estilos.label}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            className={estilos.input}
          />
          {errors.email && <p className={estilos.error}>{errors.email}</p>}
        </div>

        <div className="md:col-span-2">
          <label className={estilos.label}>Dirección</label>
          <textarea
            name="direccion"
            value={formData.direccion}
            onChange={onChange}
            className={estilos.input}
            required
          />
          {errors.direccion && (
            <p className={estilos.error}>{errors.direccion}</p>
          )}
        </div>
      </div>

      <input type="hidden" name="tipo_persona" value="estudiante" />

      <div className={estilos.buttonRow}>
        <button type="button" onClick={onCancel} className={estilos.cancelBtn}>
          Cancelar
        </button>
        <button type="submit" className={estilos.submitBtn}>
          Guardar persona
        </button>
      </div>
    </form>
  );
};

export default EstudiantePersonaForm;
