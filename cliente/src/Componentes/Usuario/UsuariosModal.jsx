import React from "react";
import VentanaModal from "../EstilosCliente/VentanaModal";

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
  preguntas,
  onPreguntaChange,
  onAgregarPregunta,
  onEliminarPregunta,
}) => {
  const titulo = currentUsuario ? "Editar Usuario" : "Crear Usuario";

  return (
    <VentanaModal
      isOpen={isOpen}
      onClose={onClose}
      title={titulo}
      size="lg"
      bodyClassName="space-y-6"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
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
            disabled={!!currentUsuario}
          >
            <option value="">Seleccione un personal</option>
            {personal.map((persona) => (
              <option key={persona.id_personal} value={persona.id_personal}>
                {persona.primer_nombre} {persona.primer_apellido} -
                {persona.cedula} -{persona.nombre_cargo || "Sin cargo"} - (
                {persona.tipo_funcion || "Sin funcion"})
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-600">
            Solo se muestran personal activo con funciones de Docente,
            Especialista o Administrativo que no tengan usuario asignado
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <option value="Director">Director</option>
              <option value="Docente">Docente</option>
              <option value="Secretaria">Secretaria</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={formStyles.label} htmlFor="contrasena">
              {currentUsuario
                ? "Nueva Contrasena (dejar en blanco para no cambiar)"
                : "Contrasena *"}
            </label>
            <input
              type="password"
              name="contrasena"
              value={formData.contrasena}
              onChange={datosFormulario}
              className={formStyles.input}
              autoComplete="new-password"
              required={!currentUsuario}
              placeholder={currentUsuario ? "Nueva contrasena" : "Contrasena"}
            />
          </div>
          <div>
            <label
              className={formStyles.label}
              htmlFor="confirmacion_contrasena"
            >
              {currentUsuario
                ? "Confirmar nueva contrasena"
                : "Confirmar contrasena *"}
            </label>
            <input
              type="password"
              name="confirmacion_contrasena"
              value={formData.confirmacion_contrasena}
              onChange={datosFormulario}
              className={formStyles.input}
              autoComplete="new-password"
              required={!currentUsuario}
              placeholder={
                currentUsuario
                  ? "Confirma la nueva contrasena"
                  : "Repite la contrasena"
              }
            />
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-800">
              Preguntas de Seguridad
            </h3>
            <button
              type="button"
              onClick={onAgregarPregunta}
              className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              Anadir pregunta
            </button>
          </div>
          <p className="text-sm text-slate-500">
            Debes registrar al menos 3 preguntas con su respuesta. Estas se
            utilizaran para recuperar el acceso a la cuenta.
          </p>

          <div className="space-y-4">
            {preguntas.map((item, index) => (
              <div
                key={item.id ?? index}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    Pregunta {index + 1}
                  </span>
                  {preguntas.length > 3 ? (
                    <button
                      type="button"
                      onClick={() => onEliminarPregunta(index)}
                      className="text-sm font-semibold text-rose-600 transition hover:text-rose-700"
                    >
                      Quitar
                    </button>
                  ) : null}
                </div>

                <label className="block text-sm font-semibold text-slate-700">
                  Pregunta
                </label>
                <input
                  type="text"
                  value={item.pregunta}
                  onChange={(e) =>
                    onPreguntaChange(index, "pregunta", e.target.value)
                  }
                  className={formStyles.input}
                  placeholder="Ej: Cual es el nombre de tu primera mascota?"
                />

                <label className="mt-3 block text-sm font-semibold text-slate-700">
                  Respuesta
                </label>
                <input
                  type="password"
                  value={item.respuesta}
                  onChange={(e) =>
                    onPreguntaChange(index, "respuesta", e.target.value)
                  }
                  className={formStyles.input}
                  placeholder="Escribe una respuesta facil de recordar"
                />

                <label className="mt-3 block text-sm font-semibold text-slate-700">
                  Confirmar respuesta
                </label>
                <input
                  type="password"
                  value={item.confirmacion}
                  onChange={(e) =>
                    onPreguntaChange(index, "confirmacion", e.target.value)
                  }
                  className={formStyles.input}
                  placeholder="Repite la respuesta para confirmar"
                />
              </div>
            ))}
          </div>
        </section>

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
    </VentanaModal>
  );
};
