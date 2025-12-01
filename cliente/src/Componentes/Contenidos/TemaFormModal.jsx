import React, { useMemo } from "react";
import {
  temaFormClasses,
  contenidosFormClasses,
} from "../EstilosCliente/EstilosClientes";

export const TemaFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentTema,
  formData,
  onChange,
  contenido,
}) => {
  const titulo = currentTema ? "Editar tema" : "Agregar tema";

  const contenidoSeleccionado = useMemo(() => {
    if (!contenido) {
      return "Sin contenido seleccionado";
    }

    const nombre =
      contenido.nombre_contenido ?? contenido.nombre ?? "Contenido";
    return `${nombre} · ID ${contenido.id_contenido}`;
  }, [contenido]);

  if (!isOpen) {
    return null;
  }

  const manejarSubmit = (evento) => {
    if (!contenido || !contenido.id_contenido) {
      evento.preventDefault();
      return;
    }

    onSubmit(evento);
  };

  return (
    <div className={temaFormClasses.overlay}>
      <div className={temaFormClasses.content}>
        <h2 className={temaFormClasses.title}>{titulo}</h2>
        <form onSubmit={manejarSubmit}>
          <div className={temaFormClasses.group}>
            <label className={temaFormClasses.label}>Contenido asociado</label>
            <input
              type="text"
              value={contenidoSeleccionado}
              className={temaFormClasses.input}
              readOnly
              disabled
            />
            <p className={temaFormClasses.helper}>
              El tema se vincula automáticamente al contenido seleccionado.
            </p>
          </div>

          <div className={temaFormClasses.group}>
            <label className={temaFormClasses.label} htmlFor="nombre_tema">
              Nombre del tema
            </label>
            <input
              id="nombre_tema"
              type="text"
              name="nombre_tema"
              value={formData.nombre_tema}
              onChange={onChange}
              className={temaFormClasses.input}
              autoComplete="off"
              placeholder="Ej. Introducción a los ecosistemas"
              required
            />
            <p className={contenidosFormClasses.helper}>
              Mínimo 3 caracteres. Se permiten letras, números y espacios.
            </p>
          </div>

          <div className={temaFormClasses.actions}>
            <button
              type="button"
              onClick={onClose}
              className={temaFormClasses.secondaryButton}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={temaFormClasses.primaryButton}
              disabled={!contenido || !contenido.id_contenido}
            >
              {currentTema ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
