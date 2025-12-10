import React from "react";
import {
  FiShield,
  FiUserCheck,
  FiBookOpen,
  FiUsers,
  FiHome,
  FiClipboard,
  FiCheckCircle,
} from "react-icons/fi";

export const pasosInscripcion = [
  {
    id: "precondiciones",
    name: "precondiciones",
    titulo: "Precondiciones",
    descripcion: "Verifica que el año escolar tenga todo listo.",
    icono: <FiShield />,
  },
  {
    id: "estudiante",
    name: "estudiante",
    titulo: "Estudiante",
    descripcion: "Selecciona al estudiante elegible.",
    icono: <FiUserCheck />,
  },
  {
    id: "aula",
    name: "grado_y_seccion",
    titulo: "Grado y sección",
    descripcion: "Asigna la sección disponible.",
    icono: <FiBookOpen />,
  },
  {
    id: "representante",
    name: "representante",
    titulo: "Representante",
    descripcion: "Define quién firmará la inscripción.",
    icono: <FiUsers />,
  },
  {
    id: "familia",
    name: "datos_del_hogar",
    titulo: "Datos del hogar",
    descripcion: "Captura la información socioeconómica.",
    icono: <FiHome />,
  },
  {
    id: "documentos",
    name: "compromisos",
    titulo: "Compromisos",
    descripcion: "Confirma documentos y participación.",
    icono: <FiClipboard />,
  },
  {
    id: "resumen",
    name: "resumen",
    titulo: "Resumen",
    descripcion: "Revisa y confirma la inscripción.",
    icono: <FiCheckCircle />,
  },
];
