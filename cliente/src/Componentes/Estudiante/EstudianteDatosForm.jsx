import React from "react";

const estilos = {
  label: "block text-gray-700 text-sm font-bold mb-2",
  input:
    "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
  error: "text-red-500 text-xs italic mt-1",
  actions: "flex justify-between items-center mt-6",
  backBtn:
    "bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg",
  cancelBtn:
    "bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg mr-3",
  submitBtn:
    "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg",
};

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
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e);
      }}
      noValidate
    >
      <div className="mb-4">
        <label className={estilos.label}>Nombre completo</label>
        <input
          type="text"
          value={nombreCompleto}
          readOnly
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100"
        />
        <input type="hidden" name="id_persona" value={idPersona} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={estilos.label}>Cédula escolar</label>
          <input
            name="cedula_escolar"
            value={datos.cedula_escolar}
            onChange={onChange}
            className={estilos.input}
          />
          {errors.cedula_escolar && (
            <p className={estilos.error}>{errors.cedula_escolar}</p>
          )}
        </div>

        <div>
          <label className={estilos.label}>Fecha ingreso a la escuela</label>
          <input
            type="date"
            name="fecha_ingreso_escuela"
            value={datos.fecha_ingreso_escuela}
            onChange={onChange}
            className={estilos.input}
            required
          />
          {errors.fecha_ingreso_escuela && (
            <p className={estilos.error}>{errors.fecha_ingreso_escuela}</p>
          )}
        </div>

        <div>
          <label className={estilos.label}>Vive con padres</label>
          <select
            name="vive_con_padres"
            value={datos.vive_con_padres}
            onChange={onChange}
            className={estilos.input}
          >
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </div>

        <div>
          <label className={estilos.label}>Orden de nacimiento</label>
          <input
            name="orden_nacimiento"
            value={datos.orden_nacimiento}
            onChange={onChange}
            className={estilos.input}
          />
        </div>

        <div>
          <label className={estilos.label}>Tiempo de gestación (semanas)</label>
          <input
            name="tiempo_gestacion"
            value={datos.tiempo_gestacion}
            onChange={onChange}
            className={estilos.input}
          />
        </div>

        <div>
          <label className={estilos.label}>Embarazo deseado</label>
          <select
            name="embarazo_deseado"
            value={datos.embarazo_deseado}
            onChange={onChange}
            className={estilos.input}
          >
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </div>

        <div>
          <label className={estilos.label}>Tipo de parto</label>
          <select
            name="tipo_parto"
            value={datos.tipo_parto}
            onChange={onChange}
            className={estilos.input}
          >
            <option value="normal">Normal</option>
            <option value="cesaria">Cesárea</option>
          </select>
        </div>

        <div>
          <label className={estilos.label}>Control esfínteres</label>
          <select
            name="control_esfinteres"
            value={datos.control_esfinteres}
            onChange={onChange}
            className={estilos.input}
          >
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>

      <div className={estilos.actions}>
        <button type="button" onClick={onBack} className={estilos.backBtn}>
          Volver a persona
        </button>
        <div>
          <button
            type="button"
            onClick={onCancel}
            className={estilos.cancelBtn}
          >
            Cancelar
          </button>
          <button type="submit" className={estilos.submitBtn}>
            Crear estudiante
          </button>
        </div>
      </div>
    </form>
  );
};

export default EstudianteDatosForm;
