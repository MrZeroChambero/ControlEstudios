import React from "react";
import { estudiantesFormClasses } from "../EstilosCliente/EstilosClientes";

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
  const classes = estudiantesFormClasses;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e);
      }}
      noValidate
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className={classes.group}>
          <label className={classes.label}>Primer Nombre</label>
          <input
            name="primer_nombre"
            value={formData.primer_nombre || ""}
            onChange={onChange}
            className={classes.input}
            required
          />
          {errors.primer_nombre && (
            <p className={classes.error}>{errors.primer_nombre}</p>
          )}
        </div>

        <div className={classes.group}>
          <label className={classes.label}>Segundo Nombre</label>
          <input
            name="segundo_nombre"
            value={formData.segundo_nombre || ""}
            onChange={onChange}
            className={classes.input}
          />
        </div>

        <div className={classes.group}>
          <label className={classes.label}>Primer Apellido</label>
          <input
            name="primer_apellido"
            value={formData.primer_apellido || ""}
            onChange={onChange}
            className={classes.input}
            required
          />
          {errors.primer_apellido && (
            <p className={classes.error}>{errors.primer_apellido}</p>
          )}
        </div>

        <div className={classes.group}>
          <label className={classes.label}>Segundo Apellido</label>
          <input
            name="segundo_apellido"
            value={formData.segundo_apellido || ""}
            onChange={onChange}
            className={classes.input}
          />
        </div>

        <div className={classes.group}>
          <label className={classes.label}>Cédula</label>
          <input
            name="cedula"
            value={formData.cedula || ""}
            onChange={onChange}
            className={classes.input}
          />
          {errors.cedula && <p className={classes.error}>{errors.cedula}</p>}
        </div>

        <div className={classes.group}>
          <label className={classes.label}>Fecha de Nacimiento</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento || ""}
            onChange={onChange}
            className={classes.input}
            required
          />
          {errors.fecha_nacimiento && (
            <p className={classes.error}>{errors.fecha_nacimiento}</p>
          )}
        </div>

        <div className={classes.group}>
          <label className={classes.label}>Género</label>
          <select
            name="genero"
            value={formData.genero}
            onChange={onChange}
            className={classes.select}
            required
          >
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div className={classes.group}>
          <label className={classes.label}>Nacionalidad</label>
          <input
            name="nacionalidad"
            value={formData.nacionalidad || ""}
            onChange={onChange}
            className={classes.input}
            required
          />
          {errors.nacionalidad && (
            <p className={classes.error}>{errors.nacionalidad}</p>
          )}
        </div>

        <div className={classes.group}>
          <label className={classes.label}>Teléfono Principal</label>
          <input
            name="telefono_principal"
            value={formData.telefono_principal || ""}
            onChange={onChange}
            className={classes.input}
            required
          />
          {errors.telefono_principal && (
            <p className={classes.error}>{errors.telefono_principal}</p>
          )}
        </div>

        <div className={classes.group}>
          <label className={classes.label}>Teléfono Secundario</label>
          <input
            name="telefono_secundario"
            value={formData.telefono_secundario || ""}
            onChange={onChange}
            className={classes.input}
          />
          {errors.telefono_secundario && (
            <p className={classes.error}>{errors.telefono_secundario}</p>
          )}
        </div>

        <div className={`md:col-span-2 ${classes.group}`}>
          <label className={classes.label}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={onChange}
            className={classes.input}
          />
          {errors.email && <p className={classes.error}>{errors.email}</p>}
        </div>

        <div className={`md:col-span-2 ${classes.group}`}>
          <label className={classes.label}>Dirección</label>
          <textarea
            name="direccion"
            value={formData.direccion || ""}
            onChange={onChange}
            className={classes.textArea}
            required
          />
          {errors.direccion && (
            <p className={classes.error}>{errors.direccion}</p>
          )}
        </div>
      </div>

      <input type="hidden" name="tipo_persona" value="estudiante" />

      <div className={classes.actions}>
        <button
          type="button"
          onClick={onCancel}
          className={classes.cancelButton}
        >
          Cancelar
        </button>
        <button type="submit" className={classes.primaryButton}>
          Guardar persona
        </button>
      </div>
    </form>
  );
};

export default EstudiantePersonaForm;
