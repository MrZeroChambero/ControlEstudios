import React, { useMemo } from "react";
import {
  temaFormClasses,
  contenidosFormClasses,
} from "../EstilosCliente/EstilosClientes";
import VentanaModal from "../EstilosCliente/VentanaModal";

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

  const manejarSubmit = (evento) => {
    if (!contenido || !contenido.id_contenido) {
      evento.preventDefault();
      return;
    }

    onSubmit(evento);
  };

  return (
    <VentanaModal
      isOpen={isOpen}
      onClose={onClose}
      title={titulo}
      size="sm"
      contentClassName="max-w-md"
      bodyClassName="space-y-4"
    >
      <form onSubmit={manejarSubmit} className="space-y-5">
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
    </VentanaModal>
  );
};
