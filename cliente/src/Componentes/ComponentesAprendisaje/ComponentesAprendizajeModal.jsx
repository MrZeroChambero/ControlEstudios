import React from "react";
import { ComponentesAprendizajeForm } from "./ComponentesAprendizajeForm";
import VentanaModal from "../EstilosCliente/VentanaModal";

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
    <VentanaModal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      size="lg"
      contentClassName="max-w-3xl"
    >
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
