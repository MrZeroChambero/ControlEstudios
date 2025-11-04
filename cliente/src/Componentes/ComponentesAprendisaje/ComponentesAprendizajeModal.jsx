import React from 'react';
import { ComponentesAprendizajeForm } from './ComponentesAprendizajeForm';

export const ComponentesAprendizajeModal = ({ isOpen, onClose, onSubmit, currentComponente, formData, handleInputChange, isViewMode }) => {
  if (!isOpen) return null;

  const getTitle = () => {
    if (isViewMode) return 'Ver Detalles del Componente';
    return currentComponente ? 'Editar Componente de Aprendizaje' : 'Crear Componente de Aprendizaje';
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start z-50 overflow-y-auto py-10">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">{getTitle()}</h2>
        <ComponentesAprendizajeForm
          onSubmit={onSubmit}
          onCancel={onClose}
          formData={formData}
          handleInputChange={handleInputChange}
          isViewMode={isViewMode}
        />
      </div>
    </div>
  );
};
