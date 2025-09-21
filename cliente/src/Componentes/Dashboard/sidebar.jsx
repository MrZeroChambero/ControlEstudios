import React, { useState } from "react";
import {
  MdAccountCircle,
  MdInput,
  MdMenu,
  MdReport,
  MdSupport,
  MdLogout,
  MdArrowRight,
} from "react-icons/md";
import { SidebarMenuItem } from "./SidebarMenuItem";

export const Sidebar = () => {
  const [openDropdowns, setOpenDropdowns] = useState({});

  const menuSections = {
    Entrada: ["Botones de acción", "Formularios"],
    Proceso: ["Validación de datos", "Automatización"],
    Salidas: ["Informes", "Archivos exportables"],
    Servicios: ["API", "Notificaciones"],
  };

  const menuIcons = {
    Entrada: <MdInput className="w-5 h-5 mr-3" />,
    Proceso: <MdMenu className="w-5 h-5 mr-3" />,
    Salidas: <MdReport className="w-5 h-5 mr-3" />,
    Servicios: <MdSupport className="w-5 h-5 mr-3" />,
    "Cerrar sesión": <MdLogout className="w-5 h-5 mr-3" />,
  };

  const toggleDropdown = (section) => {
    setOpenDropdowns((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  return (
    <div className="w-64 bg-gray-900 text-gray-300 flex flex-col overflow-y-auto">
      {/* Cabecera y Perfil */}
      <div className="p-6 bg-gray-800 flex items-center space-x-4">
        <div className="flex-shrink-0">
          <MdAccountCircle className="h-10 w-10 text-white rounded-full bg-blue-500 p-1" />
        </div>
        <div>
          <div className="font-semibold text-white">Usuario Demo</div>
          <div className="text-xs text-gray-400">Nivel 5</div>
        </div>
      </div>

      {/* Enlaces del menú con secciones */}
      <nav className="flex-1 mt-6 px-4 space-y-2">
        {Object.keys(menuSections).map((section) => (
          <SidebarMenuItem
            key={section}
            title={section}
            icon={menuIcons[section]}
            subItems={menuSections[section]}
            isOpen={openDropdowns[section]}
            onToggle={() => toggleDropdown(section)}
          />
        ))}
        <div className="mt-4">
          <button className="w-full flex items-center p-3 rounded-lg text-sm font-medium transition-colors hover:bg-gray-700 focus:outline-none">
            {menuIcons["Cerrar sesión"]}
            <span>Cerrar sesión</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
