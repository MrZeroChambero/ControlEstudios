import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MdAccountCircle,
  MdInput,
  MdMenu,
  MdReport,
  MdSupport,
  MdLogout,
} from "react-icons/md";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { menuSections } from "./configuracion";
import {
  filtrarPorNivel,
  obtenerNivelesUsuario,
  interpretarNivelesEntrada,
} from "../../utils/nivelesUsuario";

export const Sidebar = () => {
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [usuario, setUsuario] = useState("");
  const [nivel, setNivel] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsuario = localStorage.getItem("usuario");
    const storedNivel = localStorage.getItem("nivel");

    if (storedUsuario) {
      setUsuario(storedUsuario);
    }
    if (storedNivel) {
      setNivel(storedNivel);
    }
  }, []);

  const nivelesUsuario = nivel
    ? interpretarNivelesEntrada(nivel)
    : obtenerNivelesUsuario();

  const seccionesFiltradas = Object.entries(menuSections).map(
    ([section, items]) => ({
      nombre: section,
      items: filtrarPorNivel(items, nivelesUsuario),
    })
  );

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

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8080/controlestudios/servidor/cerrar-sesion",
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor:", error);
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-gray-300 flex flex-col h-full">
      {/* Cabecera y Perfil */}
      <div className="p-6 bg-gray-800 flex items-center space-x-4">
        <div className="flex-shrink-0">
          <MdAccountCircle className="h-10 w-10 text-white rounded-full bg-blue-500 p-1" />
        </div>
        <div>
          <div className="font-semibold text-white">{usuario || "Usuario"}</div>
          <div className="text-xs text-gray-400">{nivel || "Nivel 5"}</div>
        </div>
      </div>

      {/* Enlaces del menú con secciones */}
      <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto sidebar-scroll">
        {seccionesFiltradas.map(({ nombre, items }) => {
          if (!items.length) {
            return null;
          }
          return (
            <SidebarMenuItem
              key={nombre}
              title={nombre}
              icon={menuIcons[nombre]}
              subItems={items}
              isOpen={openDropdowns[nombre]}
              onToggle={() => toggleDropdown(nombre)}
            />
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          {menuIcons["Cerrar sesión"]}
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};
