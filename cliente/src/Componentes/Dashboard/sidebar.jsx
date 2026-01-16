import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MdAccountCircle,
  MdAssignmentAdd,
  MdWorkOutline,
  MdDescription,
  MdSettings,
  MdLogout,
} from "react-icons/md";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { menuSections } from "./configuracion";
import {
  dashboardSidebarClasses,
  dashboardMenuItemClasses,
} from "./dashboardEstilos";
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
    Entrada: (
      <MdAssignmentAdd
        className={`${dashboardMenuItemClasses.icon} text-blue-300`}
      />
    ),
    Proceso: (
      <MdWorkOutline
        className={`${dashboardMenuItemClasses.icon} text-amber-300`}
      />
    ),
    Salidas: (
      <MdDescription
        className={`${dashboardMenuItemClasses.icon} text-emerald-300`}
      />
    ),
    Servicios: (
      <MdSettings
        className={`${dashboardMenuItemClasses.icon} text-purple-300`}
      />
    ),
    "Cerrar sesión": (
      <MdLogout className={`${dashboardMenuItemClasses.icon} text-rose-300`} />
    ),
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
    <div className={dashboardSidebarClasses.container}>
      {/* Cabecera y Perfil */}
      <div className={dashboardSidebarClasses.header}>
        <div className="flex-shrink-0">
          <MdAccountCircle className={dashboardSidebarClasses.avatar} />
        </div>
        <div>
          <div className={dashboardSidebarClasses.username}>
            {usuario || "Usuario"}
          </div>
          <div className={dashboardSidebarClasses.level}>
            {nivel || "Nivel 5"}
          </div>
        </div>
      </div>

      {/* Enlaces del menú con secciones */}
      <nav className={dashboardSidebarClasses.nav}>
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
      <div className={dashboardSidebarClasses.footer}>
        <button
          onClick={handleLogout}
          className={dashboardSidebarClasses.logoutButton}
        >
          {menuIcons["Cerrar sesión"]}
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};
