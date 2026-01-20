import React from "react";
import { ComponentesAprendizajeForm } from "./ComponentesAprendizajeForm";
import VentanaModal from "../EstilosCliente/VentanaModal";
import {
  componentesStatusClasses,
  componentesTypePillBase,
} from "./componentesAprendizajeEstilos";

export const ComponentesAprendizajeModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentComponente,
  formData,
  handleInputChange,
  isViewMode,
  areas,
}) => {
  if (!isOpen) return null;

  const getTitle = () => {
    if (isViewMode) return "Ver detalles del componente";
    return currentComponente
      ? "Editar componente de aprendizaje"
      : "Crear componente de aprendizaje";
  };

  const tipoDocentePills = {
    aula: "bg-blue-100 text-blue-700",
    especialista: "bg-purple-100 text-purple-700",
  };

  const renderMetadatos = () => {
    if (!isViewMode || !currentComponente) {
      return null;
    }

    const codigo = currentComponente.tipo_docente || "aula";
    const tipoLabel = currentComponente.especialista || "Docente de aula";
    const requiere = currentComponente.requiere_especialista === true;

    return (
      <div className="rounded-3xl border border-slate-100 bg-slate-50/60 p-5 shadow-inner">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tipo de docente
            </p>
            <span
              className={`${componentesTypePillBase} ${
                tipoDocentePills[codigo] || tipoDocentePills.aula
              }`}
            >
              {tipoLabel}
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              ¿Requiere especialista?
            </p>
            <span
              className={`${componentesStatusClasses.base} ${
                requiere
                  ? componentesStatusClasses.evalYes
                  : componentesStatusClasses.evalNo
              }`}
            >
              {requiere
                ? "Sí, asignar especialista"
                : "No, lo imparte el titular"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <VentanaModal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      size={isViewMode ? "lg" : "md"}
      bodyClassName={isViewMode ? "space-y-6" : "space-y-4"}
      contentClassName="max-w-3xl"
    >
      {renderMetadatos()}
      <ComponentesAprendizajeForm
        onSubmit={onSubmit}
        onCancel={onClose}
        formData={formData}
        handleInputChange={handleInputChange}
        isViewMode={isViewMode}
        currentComponente={currentComponente}
        areas={areas}
      />
    </VentanaModal>
  );
};
