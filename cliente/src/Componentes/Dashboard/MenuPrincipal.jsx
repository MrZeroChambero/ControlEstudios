import React from "react";
import { Sidebar } from "./sidebar.jsx"; // Asegúrate de que el nombre de archivo Sidebar.jsx tenga la 'S' mayúscula

export const MenuPrincipal = ({ Formulario }) => {
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
