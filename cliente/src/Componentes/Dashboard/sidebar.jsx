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
  MdArrowRight,
} from "react-icons/md";
import { SidebarMenuItem } from "./SidebarMenuItem";

export const Sidebar = () => {
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [usuario, setUsuario] = useState("");
  const [nivel, setNivel] = useState("");
  const [urlFoto, setUrlFoto] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Leer los datos del localStorage
    const storedUsuario = localStorage.getItem("usuario");
    const storedNivel = localStorage.getItem("nivel");
    const storedUrlFoto = localStorage.getItem("url_foto");

    // Actualizar el estado del componente
    if (storedUsuario) {
      setUsuario(storedUsuario);
    }
    if (storedNivel) {
      setNivel(storedNivel);
    }
    if (storedUrlFoto) {
      setUrlFoto(storedUrlFoto);
    }
  }, []);

  const menuSections = {
    Entrada: [
      "Registro de estudiantes",
      "Registro de personal",
      "Registro de representantes",
      "Registro de áreas de aprendizaje y temas",
      "Registros de asistencia de estudiantes",
      "Registro de competencias",
      "Registro de indicadores",
      "Registro de evaluaciones",
    ],
    Proceso: [
      "Gestión de grados y secciones",
      "Inscripción",
      "Planificación Académica",
      "Gestión de rendimiento académico",
      "Gestión de horarios",
    ],
    Salidas: [
      "Certificados de matrícula y estudios",
      "Certificado de educación primaria",
      "Informe descriptivo del desempeño escolar",
      "Sábana escolar",
      "Constancia de prosecución",
      "Reportes de asistencia por estudiante/sección",
      "Directorios del personal y listados de clases",
      "Reportes demográficos y de salud escolar",
      "Planillas de inscripción digitalizadas",
      "Constancias de estudio digitalizadas",
      "Certificación de funciones para el personal",
      "Horarios",
      "Planificación Académica",
    ],
    Servicios: [
      "Copias de seguridad",
      "Restauración de base de datos",
      "Creación de perfiles de usuario",
      "Auditoría",
      "Configuración de años escolares",
      "Creación de cédula escolar",
    ],
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

  const handleLogout = async () => {
    try {
      // Llama al endpoint del backend para invalidar la sesión y la cookie.
      // Es importante enviar 'withCredentials' para que la cookie se envíe.
      await axios.post(
        "http://localhost:8080/controlestudios/servidor/cerrar-sesion",
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor:", error);
      // Continuamos con la limpieza local incluso si el servidor falla
    } finally {
      localStorage.clear(); // Limpia todos los datos de usuario del localStorage
      navigate("/login"); // Redirige al usuario a la página de login
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-gray-300 flex flex-col overflow-y-auto">
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
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-lg text-sm font-medium transition-colors hover:bg-red-600 hover:text-white focus:outline-none"
          >
            {menuIcons["Cerrar sesión"]}
            <span>Cerrar sesión</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
