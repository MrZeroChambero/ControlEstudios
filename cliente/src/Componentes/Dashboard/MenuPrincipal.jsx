import React from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "./sidebar.jsx"; // Asegurate de que el nombre de archivo Sidebar.jsx tenga la 'S' mayuscula

export const MenuPrincipal = ({ Formulario }) => {
  const location = useLocation();
  const rutasSinDashboard = ["/login", "/recuperar-clave", "/server-error"];
  const pathname = location.pathname.toLowerCase();
  const ocultarDashboard = rutasSinDashboard.some(
    (ruta) => ruta.toLowerCase() === pathname
  );

  // Renderizado condicional
  if (ocultarDashboard) {
    // Si la ruta esta en la lista, solo renderiza el componente 'Formulario'
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
