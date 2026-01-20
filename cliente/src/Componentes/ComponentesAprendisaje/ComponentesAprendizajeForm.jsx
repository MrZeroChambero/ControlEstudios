import React from "react";
import { componentesFormClasses } from "./componentesAprendizajeEstilos";

const tipoDocenteOpciones = [
  { value: "Docente de aula", label: "Docente de aula" },
  { value: "Docente especialista", label: "Docente especialista" },
];
const Grupo = [
  { value: "Completo", label: "Completo" },
  { value: "Sub Grupo", label: "Sub Grupo" },
];
const obtenerNombreArea = (areas, fkArea, nombreAreaFallback) => {
  if (!fkArea) {
    return nombreAreaFallback || "Sin área asignada";
  }

  const encontrada = areas.find((area) => String(area.id) === String(fkArea));
  return encontrada?.nombre || nombreAreaFallback || "Sin área asignada";
};

const normalizarEspecialistaValor = (valor) => {
  if (!valor) {
    return "";
  }

  const valorString = String(valor).trim();
  const base = valorString.toLowerCase();

  // Mapeo exacto según enum del backend

  if (base === "si" || base === "sí" || base.includes("especial")) {
    return "Docente especialista";
  }

  // Valor por defecto según backend
  return "Docente de aula";
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
  const especialistaNormalizado = normalizarEspecialistaValor(
    formData.especialista
  );

  React.useEffect(() => {
    if (isViewMode) {
      return;
    }

    if (
      especialistaNormalizado &&
      especialistaNormalizado !== formData.especialista
    ) {
      handleInputChange({
        target: { name: "especialista", value: especialistaNormalizado },
      });
    }
  }, [
    especialistaNormalizado,
    formData.especialista,
    handleInputChange,
    isViewMode,
  ]);

  return (
    <form onSubmit={onSubmit} autoComplete="off">
      <div className={componentesFormClasses.group}>
        <label className={componentesFormClasses.label} htmlFor="fk_area">
          Área de aprendizaje
        </label>
        {isViewMode ? (
          <div className={componentesFormClasses.readOnly}>
            {nombreArea || "Sin área asignada"}
          </div>
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
        {isViewMode ? (
          <div className={componentesFormClasses.readOnly}>
            {formData.nombre_componente || "Sin nombre asignado"}
          </div>
        ) : (
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
          />
        )}
      </div>

      <div name="especialista" className={componentesFormClasses.group}>
        <label className={componentesFormClasses.label} htmlFor="especialista">
          Tipo de docente responsable
        </label>
        {isViewMode ? (
          <div className={componentesFormClasses.readOnly}>
            {especialistaNormalizado || "Sin tipo asignado"}
          </div>
        ) : (
          <select
            id="especialista"
            name="especialista"
            className={componentesFormClasses.select}
            value={especialistaNormalizado}
            onChange={handleInputChange}
            required
          >
            <option value="">Selecciona el tipo de docente</option>
            {tipoDocenteOpciones.map((opcion) => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <div name="evalua" className={componentesFormClasses.group}>
        <label className={componentesFormClasses.label} htmlFor="evalua">
          ¿Evalúa?
        </label>
        {isViewMode ? (
          <div className={componentesFormClasses.readOnly}>
            {formData.evalua === "si" ? "Sí evalúa" : "No evalúa"}
          </div>
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

      <div name="grupo" className={componentesFormClasses.group}>
        <label className={componentesFormClasses.label} htmlFor="grupo">
          ¿Cómo se trabajará el componente?
        </label>
        {isViewMode ? (
          <div className={componentesFormClasses.readOnly}>
            {formData.grupo || "Sin asignar"}
          </div>
        ) : (
          <select
            id="grupo"
            name="grupo"
            className={componentesFormClasses.select}
            value={formData.grupo}
            onChange={handleInputChange}
            required
          >
            <option value="">Selecciona como se trabajará el componente</option>
            {Grupo.map((opcion) => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
        )}
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
