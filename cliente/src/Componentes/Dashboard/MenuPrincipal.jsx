import React from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "./sidebar.jsx"; // Asegúrate de que el nombre de archivo Sidebar.jsx tenga la 'S' mayúscula

export const MenuPrincipal = ({ Formulario }) => {
  const location = useLocation();
  // 2. Verificar si la ruta es '/login'
  const isLoginPage = location.pathname === "/login";

  // Renderizado condicional
  if (isLoginPage) {
    // 3. Si es /login, solo renderiza el componente 'App' (FormularioComponente)
    return <Formulario />;
  }
  return (
    <div className="font-sans flex h-screen bg-gray-100 text-gray-800">
      <Sidebar />

      {/* Contenido Principal */}
      <main className="flex-1 p-8 overflow-y-auto space-y-8">
        {/* Aquí es donde se utiliza la prop 'Formulario' */}
        <Formulario />
      </main>
    </div>
  );
};
