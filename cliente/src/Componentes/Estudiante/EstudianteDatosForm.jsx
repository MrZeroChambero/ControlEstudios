import React from "react";
import { estudiantesFormClasses } from "../EstilosCliente/EstilosClientes";

/**
 * EstudianteDatosForm
 * Props:
 *  - datos: objeto controlado
 *  - onChange: function(event)
 *  - onSubmit: function(event)
 *  - onBack: function()
 *  - onCancel: function()
 *  - errors: objeto de errores
 *  - nombreCompleto: string (mostrar arriba)
 *  - idPersona: number|string (hidden)
 */
const EstudianteDatosForm = ({
  datos,
  onChange,
  onSubmit,
  onBack,
  onCancel,
  errors = {},
  nombreCompleto = "",
  idPersona = "",
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
      <div className={classes.group}>
        <label className={classes.label}>Nombre completo</label>
        <input
          type="text"
          value={nombreCompleto}
          readOnly
          className={classes.readOnly}
        />
        <input type="hidden" name="id_persona" value={idPersona} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className={classes.group}>
          <label className={classes.label}>Cédula escolar</label>
          <input
            name="cedula_escolar"
            value={datos.cedula_escolar || ""}
            onChange={onChange}
            className={classes.input}
          />
          {errors.cedula_escolar && (
            <p className={classes.error}>{errors.cedula_escolar}</p>
          )}
        </div>

        <div className={classes.group}>
          <label className={classes.label}>Fecha ingreso a la escuela</label>
          <input
            type="date"
            name="fecha_ingreso_escuela"
            value={datos.fecha_ingreso_escuela || ""}
            onChange={onChange}
            className={classes.input}
            required
          />
          {errors.fecha_ingreso_escuela && (
            <p className={classes.error}>{errors.fecha_ingreso_escuela}</p>
          )}
        </div>

        <div className={classes.group}>
          <label className={classes.label}>Vive con padres</label>
          <select
            name="vive_con_padres"
            value={datos.vive_con_padres}
            onChange={onChange}
            className={classes.select}
          >
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </div>

        <div className={classes.group}>
          <label className={classes.label}>Orden de nacimiento</label>
          <input
            name="orden_nacimiento"
            value={datos.orden_nacimiento || ""}
            onChange={onChange}
            className={classes.input}
          />
        </div>

        <div className={classes.group}>
          <label className={classes.label}>Tiempo de gestación (semanas)</label>
          <input
            name="tiempo_gestacion"
            value={datos.tiempo_gestacion || ""}
            onChange={onChange}
            className={classes.input}
          />
        </div>

        <div className={classes.group}>
          <label className={classes.label}>Embarazo deseado</label>
          <select
            name="embarazo_deseado"
            value={datos.embarazo_deseado}
            onChange={onChange}
            className={classes.select}
          >
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </div>

        <div className={classes.group}>
          <label className={classes.label}>Tipo de parto</label>
          <select
            name="tipo_parto"
            value={datos.tipo_parto}
            onChange={onChange}
            className={classes.select}
          >
            <option value="normal">Normal</option>
            <option value="cesaria">Cesárea</option>
          </select>
        </div>

        <div className={classes.group}>
          <label className={classes.label}>Control esfínteres</label>
          <select
            name="control_esfinteres"
            value={datos.control_esfinteres}
            onChange={onChange}
            className={classes.select}
          >
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button type="button" onClick={onBack} className={classes.backButton}>
          Volver a persona
        </button>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={classes.cancelButton}
          >
            Cancelar
          </button>
          <button type="submit" className={classes.primaryButton}>
            Crear estudiante
          </button>
        </div>
      </div>
    </form>
  );
};

export default EstudianteDatosForm;
