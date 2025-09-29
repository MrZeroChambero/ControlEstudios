import React from "react";
import { UsuarioForm } from "./UsuarioForm";

export const UsuarioModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
  formData,
  handleInputChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start z-50 overflow-y-auto py-10">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">
          {currentUser ? "Editar Usuario" : "Crear Usuario"}
        </h2>
        <UsuarioForm
          onSubmit={onSubmit}
          onCancel={onClose}
          currentUser={currentUser}
          formData={formData}
          handleInputChange={handleInputChange}
        />
      </div>
    </div>
  );
};
