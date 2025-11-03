import React from "react";
import { PersonalForm } from "./PersonalForm";

export const PersonalModal = ({
  isOpen,
  onClose,
  onSubmit,
  personas,
  planteles,
  formData,
  setFormData,
  currentItem,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-start z-50 py-10">
      <div className="bg-white p-6 rounded w-full max-w-3xl">
        <h2 className="text-xl font-bold mb-4">
          {currentItem ? "Editar Personal" : "Crear Personal"}
        </h2>
        <form onSubmit={onSubmit}>
          <PersonalForm
            formData={formData}
            setFormData={setFormData}
            personas={personas}
            planteles={planteles}
          />
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
