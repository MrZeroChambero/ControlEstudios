import React from "react";
import { AreasAprendizajeForm } from "./AreasAprendizajeForm";

export const AreasAprendizajeModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentArea,
  componentes,
  funciones,
  formData,
  datosFormulario,
  modo,
}) => {
  if (!isOpen) return null;

  const titulo =
    modo === "ver"
      ? "Ver Área de Aprendizaje"
      : currentArea
      ? "Editar Área de Aprendizaje"
      : "Crear Área de Aprendizaje";

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start z-50 overflow-y-auto py-10">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{titulo}</h2>
        <AreasAprendizajeForm
          onSubmit={onSubmit}
          onCancel={onClose}
          currentArea={currentArea}
          formData={formData}
          componentes={componentes}
          funciones={funciones}
          datosFormulario={datosFormulario}
          modoVer={modo === "ver"}
        />
        {modo === "ver" && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
