import React from "react";
import { useNavigate } from "react-router-dom";
import { MdCloudOff } from "react-icons/md";

export const ServerErrorPage = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    // Navega a la página de login para que el usuario pueda intentar la acción de nuevo.
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-center p-4">
      <MdCloudOff className="text-red-500 text-9xl mb-6" />
      <h1 className="text-5xl font-bold text-gray-800 mb-4">
        Error de Conexión
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">
        No hemos podido establecer comunicación con el servidor. Por favor,
        verifica tu conexión a internet o inténtalo de nuevo más tarde.
      </p>
      <button
        onClick={handleRetry}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
      >
        Volver a Intentar
      </button>
    </div>
  );
};
