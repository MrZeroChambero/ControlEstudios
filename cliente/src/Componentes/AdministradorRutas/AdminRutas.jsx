import React from "react";
import { useNavigate } from "react-router-dom";

export const AdminRutas = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Administrador de Rutas (Modo Prueba)
      </h1>
      <p className="text-lg text-gray-600 mb-10 text-center max-w-2xl">
        Utiliza estos botones para navegar rápidamente entre las diferentes
        secciones de la aplicación durante el desarrollo y las pruebas.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        {/* Botones de Navegación */}
        <button
          onClick={() => handleNavigation("/dashboard")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Ir a Dashboard
        </button>
        <button
          onClick={() => handleNavigation("/estudiantes")}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Gestionar Estudiantes
        </button>
        <button
          onClick={() => handleNavigation("/representantes")}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Gestionar Representantes
        </button>
        <button
          onClick={() => handleNavigation("/grados")}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Gestionar Grados
        </button>
        <button
          onClick={() => handleNavigation("/usuarios")}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Gestionar Usuarios
        </button>
        <button
          onClick={() => handleNavigation("/personas")}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Gestionar Personas
        </button>
        <button
          onClick={() => handleNavigation("/login")}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Volver a Login
        </button>
        <button
          onClick={() => handleNavigation("/respaldos")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Gestión de respaldos
        </button>
        <button
          onClick={() => handleNavigation("/planificacion-academica")}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Planificación académica
        </button>
      </div>
    </div>
  );
};
