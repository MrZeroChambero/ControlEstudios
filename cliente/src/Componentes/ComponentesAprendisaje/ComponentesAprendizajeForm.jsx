import React from "react";
import { componentesFormClasses } from "../EstilosCliente/EstilosClientes";

const tipoDocenteOpciones = [
  { value: "Docente de aula", label: "Docente de aula" },
  { value: "Docente especialista", label: "Docente especialista" },
  { value: "Docente de cultura", label: "Docente de cultura" },
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

  const base = String(valor).toLowerCase();
  const coincidencia = tipoDocenteOpciones.find(
    (opcion) => opcion.value.toLowerCase() === base
  );

  if (coincidencia) {
    return coincidencia.value;
  }

  if (base.includes("cultur")) {
    return "Docente de cultura";
  }

  if (base === "si" || base.includes("especial")) {
    return "Docente especialista";
  }

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

      <div className={componentesFormClasses.group}>
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

      <div className={componentesFormClasses.group}>
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

      <div className={componentesFormClasses.group}>
        <span className={componentesFormClasses.label}>
          Estado del componente
        </span>
        <div className={componentesFormClasses.readOnly}>
          {currentComponente?.estado_componente === "inactivo"
            ? "Inactivo"
            : "Activo"}
        </div>
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
