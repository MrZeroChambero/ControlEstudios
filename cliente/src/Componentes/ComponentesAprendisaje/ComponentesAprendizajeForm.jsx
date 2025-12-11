import React from "react";
import { componentesFormClasses } from "../EstilosCliente/EstilosClientes";

const obtenerNombreArea = (areas, fkArea, nombreAreaFallback) => {
  if (!fkArea) {
    return nombreAreaFallback || "Sin área asignada";
  }

  const encontrada = areas.find((area) => String(area.id) === String(fkArea));
  return encontrada?.nombre || nombreAreaFallback || "Sin área asignada";
};

export const ComponentesAprendizajeForm = ({
  onSubmit,
  onCancel,
  formData,
  handleInputChange,
  isViewMode,
  currentComponente,
  areas,
}) => {
  const nombreArea = obtenerNombreArea(
    areas,
    formData.fk_area,
    currentComponente?.nombre_area
  );

  return (
    <form onSubmit={onSubmit} autoComplete="off">
      <div className={componentesFormClasses.group}>
        <label className={componentesFormClasses.label} htmlFor="fk_area">
          Área de aprendizaje
        </label>
        {isViewMode ? (
          <p className={componentesFormClasses.readOnly}>{nombreArea}</p>
        ) : (
          <select
            id="fk_area"
            name="fk_area"
            className={componentesFormClasses.select}
            value={formData.fk_area}
            onChange={handleInputChange}
            required
          >
            <option value="">Selecciona un área</option>
            {areas.map((area) => (
              <option key={area.id} value={String(area.id)}>
                {area.nombre}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className={componentesFormClasses.group}>
        <label
          className={componentesFormClasses.label}
          htmlFor="nombre_componente"
        >
          Nombre del componente
        </label>
        <input
          id="nombre_componente"
          type="text"
          name="nombre_componente"
          value={formData.nombre_componente}
          onChange={handleInputChange}
          className={componentesFormClasses.input}
          autoComplete="off"
          maxLength={100}
          required
          readOnly={isViewMode}
        />
      </div>

      <div className={componentesFormClasses.group}>
        <label className={componentesFormClasses.label} htmlFor="especialista">
          Especialista responsable
        </label>
        <input
          id="especialista"
          type="text"
          name="especialista"
          value={formData.especialista}
          onChange={handleInputChange}
          className={componentesFormClasses.input}
          autoComplete="off"
          maxLength={50}
          required
          readOnly={isViewMode}
        />
      </div>

      <div className={componentesFormClasses.group}>
        <label className={componentesFormClasses.label} htmlFor="evalua">
          ¿Evalúa?
        </label>
        {isViewMode ? (
          <p className={componentesFormClasses.readOnly}>
            {formData.evalua === "si" ? "Sí evalúa" : "No evalúa"}
          </p>
        ) : (
          <select
            id="evalua"
            name="evalua"
            className={componentesFormClasses.select}
            value={formData.evalua}
            onChange={handleInputChange}
            required
          >
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        )}
      </div>

      <div className={componentesFormClasses.group}>
        <span className={componentesFormClasses.label}>
          Estado del componente
        </span>
        <p className={componentesFormClasses.readOnly}>
          {currentComponente?.estado_componente === "inactivo"
            ? "Inactivo"
            : "Activo"}
        </p>
      </div>

      {!isViewMode && (
        <div className={componentesFormClasses.actions}>
          <button
            type="button"
            onClick={onCancel}
            className={componentesFormClasses.secondaryButton}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={componentesFormClasses.primaryButton}
          >
            Guardar
          </button>
        </div>
      )}
    </form>
  );
};
