import React from "react";
import {
  contenidosModalClasses,
  contenidosFormClasses,
} from "../EstilosCliente/EstilosClientes";

export const ContenidosModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentContenido,
  formData,
  componentes,
  grados,
  datosFormulario,
  modo,
  formatearGrado,
}) => {
  if (!isOpen) {
    return null;
  }

  const titulo =
    modo === "ver"
      ? "Detalle del Contenido"
      : currentContenido
      ? "Editar Contenido"
      : "Registrar Contenido";

  const componenteSeleccionado = componentes.find(
    (item) => item.id?.toString() === formData.fk_componente?.toString()
  );

  return (
    <div className={contenidosModalClasses.overlay}>
      <div className={contenidosModalClasses.content}>
        <div className={contenidosModalClasses.header}>
          <h2 className={contenidosModalClasses.title}>{titulo}</h2>
          <button
            type="button"
            onClick={onClose}
            className={contenidosModalClasses.closeButton}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className={contenidosFormClasses.group}>
            <label
              className={contenidosFormClasses.label}
              htmlFor="nombre_contenido"
            >
              Nombre del Contenido
            </label>
            {modo === "ver" ? (
              <div className={contenidosFormClasses.readOnly}>
                {formData.nombre_contenido || "Sin definir"}
              </div>
            ) : (
              <input
                type="text"
                id="nombre_contenido"
                name="nombre_contenido"
                value={formData.nombre_contenido}
                onChange={datosFormulario}
                className={contenidosFormClasses.input}
                autoComplete="off"
                required
                placeholder="Ej. Comprensión lectora de textos narrativos"
              />
            )}
          </div>

          <div className={contenidosFormClasses.group}>
            <label
              className={contenidosFormClasses.label}
              htmlFor="fk_componente"
            >
              Componente de Aprendizaje
            </label>
            {modo === "ver" ? (
              <div className={contenidosFormClasses.readOnly}>
                {componenteSeleccionado?.etiqueta || "Sin asignar"}
              </div>
            ) : (
              <select
                id="fk_componente"
                name="fk_componente"
                value={formData.fk_componente}
                onChange={datosFormulario}
                className={contenidosFormClasses.select}
                required
              >
                <option value="">Seleccione un componente</option>
                {componentes.map((componente) => (
                  <option key={componente.id} value={componente.id}>
                    {componente.etiqueta}
                  </option>
                ))}
              </select>
            )}
            <p className={contenidosFormClasses.helper}>
              Seleccione el componente curricular al que pertenece este
              contenido.
            </p>
          </div>

          <div className={contenidosFormClasses.group}>
            <label className={contenidosFormClasses.label} htmlFor="grado">
              Grado sugerido
            </label>
            {modo === "ver" ? (
              <div className={contenidosFormClasses.readOnly}>
                {formatearGrado(formData.grado) || "General"}
              </div>
            ) : (
              <select
                id="grado"
                name="grado"
                value={formData.grado}
                onChange={datosFormulario}
                className={contenidosFormClasses.select}
                required
              >
                <option value="">Seleccione un grado</option>
                {grados.map((grado) => (
                  <option key={grado.valor} value={grado.valor}>
                    {grado.etiqueta}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className={contenidosFormClasses.group}>
            <label
              className={contenidosFormClasses.label}
              htmlFor="descripcion"
            >
              Descripción (opcional)
            </label>
            {modo === "ver" ? (
              <div className={contenidosFormClasses.readOnly}>
                {formData.descripcion && formData.descripcion.trim() !== ""
                  ? formData.descripcion
                  : "Sin descripción"}
              </div>
            ) : (
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={datosFormulario}
                className={contenidosFormClasses.textArea}
                rows={3}
                placeholder="Añada detalles que ayuden al docente a contextualizar este contenido."
              />
            )}
          </div>

          {modo !== "ver" ? (
            <div className={contenidosFormClasses.actions}>
              <button
                type="button"
                onClick={onClose}
                className={contenidosFormClasses.secondaryButton}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={contenidosFormClasses.primaryButton}
              >
                {currentContenido ? "Actualizar" : "Guardar"}
              </button>
            </div>
          ) : (
            <div className={contenidosFormClasses.actions}>
              <button
                type="button"
                onClick={onClose}
                className={contenidosFormClasses.secondaryButton}
              >
                Cerrar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
