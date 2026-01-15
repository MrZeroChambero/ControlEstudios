import React from "react";
import VentanaModal from "../EstilosCliente/VentanaModal";
import { PersonaForm } from "./PersonaForm";
import { personaModalClasses } from "./personaEstilos";

export const PersonaModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentPersona,
  formData,
  handleInputChange,
  errors,
}) => {
  const titulo = currentPersona ? "Editar Persona" : "Crear Persona";

  return (
    <VentanaModal
      isOpen={isOpen}
      onClose={onClose}
      title={titulo}
      size="lg"
      bodyClassName={personaModalClasses.body}
    >
      <PersonaForm
        onSubmit={onSubmit}
        onCancel={onClose}
        formData={formData}
        handleInputChange={handleInputChange}
        errors={errors}
      />
    </VentanaModal>
  );
};
