import React from "react";
import { formClasses } from "./componentesAprendizajeStyles";

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
    <form onSubmit={onSubmit}>
      <div className={formClasses.group}>
        <label className={formClasses.label} htmlFor="fk_area">
          Área de aprendizaje
        </label>
        {isViewMode ? (
          <p className={formClasses.readOnly}>{nombreArea}</p>
        ) : (
          <select
            id="fk_area"
            name="fk_area"
            className={formClasses.select}
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

      <div className={formClasses.group}>
        <label className={formClasses.label} htmlFor="nombre_componente">
          Nombre del componente
        </label>
        <input
          id="nombre_componente"
          type="text"
          name="nombre_componente"
          value={formData.nombre_componente}
          onChange={handleInputChange}
          className={formClasses.input}
          autoComplete="off"
          maxLength={100}
          required
          readOnly={isViewMode}
        />
      </div>

      <div className={formClasses.group}>
        <label className={formClasses.label} htmlFor="especialista">
          Especialista responsable
        </label>
        <input
          id="especialista"
          type="text"
          name="especialista"
          value={formData.especialista}
          onChange={handleInputChange}
          className={formClasses.input}
          autoComplete="off"
          maxLength={50}
          required
          readOnly={isViewMode}
        />
      </div>

      <div className={formClasses.group}>
        <label className={formClasses.label} htmlFor="evalua">
          ¿Evalúa?
        </label>
        {isViewMode ? (
          <p className={formClasses.readOnly}>
            {formData.evalua === "si" ? "Sí evalúa" : "No evalúa"}
          </p>
        ) : (
          <select
            id="evalua"
            name="evalua"
            className={formClasses.select}
            value={formData.evalua}
            onChange={handleInputChange}
            required
          >
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        )}
      </div>

      <div className={formClasses.group}>
        <span className={formClasses.label}>Estado del componente</span>
        <p className={formClasses.readOnly}>
          {currentComponente?.estado_componente === "inactivo"
            ? "Inactivo"
            : "Activo"}
        </p>
      </div>

      {!isViewMode && (
        <div className={formClasses.actions}>
          <button
            type="button"
            onClick={onCancel}
            className={formClasses.secondaryButton}
          >
            Cancelar
          </button>
          <button type="submit" className={formClasses.primaryButton}>
            Guardar
          </button>
        </div>
      )}
    </form>
  );
};
