import React from "react";
import { areasFormClasses } from "../EstilosCliente/EstilosClientes";

export const AreasAprendizajeForm = ({
  onSubmit,
  onCancel,
  currentArea,
  formData,
  datosFormulario,
  modoVer = false,
}) => {
  return (
    <form onSubmit={onSubmit} autoComplete="off">
      <div className={areasFormClasses.group}>
        <label className={areasFormClasses.label} htmlFor="nombre_area">
          Nombre del Área
        </label>
        {modoVer ? (
          <div className={areasFormClasses.readOnly}>
            {formData.nombre_area}
          </div>
        ) : (
          <input
            type="text"
            name="nombre_area"
            value={formData.nombre_area}
            onChange={datosFormulario}
            className={areasFormClasses.input}
            autoComplete="off"
            required
            placeholder="Ingrese el nombre del área"
          />
        )}
      </div>
      {modoVer && currentArea && (
        <div className={areasFormClasses.infoGroup}>
          <label className={areasFormClasses.label} htmlFor="estado_area">
            Estado
          </label>
          <div className={areasFormClasses.readOnly}>
            {currentArea.estado_area ?? "Desconocido"}
          </div>
        </div>
      )}
      {!modoVer && (
        <div className={areasFormClasses.actions}>
          <button
            type="button"
            onClick={onCancel}
            className={areasFormClasses.secondaryButton}
          >
            Cancelar
          </button>
          <button type="submit" className={areasFormClasses.primaryButton}>
            {currentArea ? "Actualizar" : "Guardar"}
          </button>
        </div>
      )}
    </form>
  );
};
