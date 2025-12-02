import React from "react";
import { ComponentesAprendizajeForm } from "./ComponentesAprendizajeForm";
import { componentesModalClasses } from "../EstilosCliente/EstilosClientes";

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
    <div className={componentesModalClasses.overlay}>
      <div className={componentesModalClasses.content}>
        <div className={componentesModalClasses.header}>
          <h2 className={componentesModalClasses.title}>{getTitle()}</h2>
          <button
            type="button"
            onClick={onClose}
            className={componentesModalClasses.closeButton}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
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
