import React from "react";
import { ComponentesAprendizajeForm } from "./ComponentesAprendizajeForm";
import { modalClasses } from "./componentesAprendizajeStyles";

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

  return (
    <div className={modalClasses.overlay}>
      <div className={modalClasses.content}>
        <h2 className={modalClasses.title}>{getTitle()}</h2>
        <ComponentesAprendizajeForm
          onSubmit={onSubmit}
          onCancel={onClose}
          formData={formData}
          handleInputChange={handleInputChange}
          isViewMode={isViewMode}
          currentComponente={currentComponente}
          areas={areas}
        />
      </div>
    </div>
  );
};
