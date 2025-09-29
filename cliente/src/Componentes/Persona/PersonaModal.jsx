import React from "react";
import { PersonaForm } from "./PersonaForm";

export const PersonaModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentPersona,
  formData,
  handleInputChange,
  errors,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start z-50 overflow-y-auto py-10">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-6">
          {currentPersona ? "Editar Persona" : "Crear Persona"}
        </h2>
        <PersonaForm
          onSubmit={onSubmit}
          onCancel={onClose}
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
        />
      </div>
    </div>
  );
};
