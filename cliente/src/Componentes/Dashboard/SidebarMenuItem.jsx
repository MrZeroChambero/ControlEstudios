import React from "react";
import { MdArrowRight } from "react-icons/md";
import { useNavigate } from "react-router-dom";

// Función para convertir el texto del menú a una URL amigable (slug)
const toUrlSlug = (text) => {
  const a =
    "àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;";
  const b =
    "aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------";
  const p = new RegExp(a.split("").join("|"), "g");

  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Reemplaza espacios con -
    .replace(p, (c) => b.charAt(a.indexOf(c))) // Reemplaza caracteres especiales
    .replace(/&/g, "-y-") // Reemplaza & con '-y-'
    .replace(/[^\w-]+/g, "") // Elimina todos los caracteres no alfanuméricos
    .replace(/--+/g, "-") // Reemplaza múltiples - con uno solo
    .replace(/^-+/, "") // Quita - del inicio
    .replace(/-+$/, ""); // Quita - del final
};

export const SidebarMenuItem = ({
  title,
  icon,
  subItems,
  isOpen,
  onToggle,
}) => {
  const navigate = useNavigate();

  const handleSubItemClick = (item) => {
    const path = toUrlSlug(item);
    // Navegamos a una ruta dentro del dashboard, por ejemplo /dashboard/registro-de-estudiantes
    navigate(`/${path}`);
    console.log(`Navegando a: /${path}`);
  };

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors hover:bg-gray-700 focus:outline-none"
      >
        <div className="flex items-center">
          {icon}
          <span>{title}</span>
        </div>
        <MdArrowRight
          className={`w-4 h-4 transform transition-transform ${
            isOpen ? "rotate-90" : "rotate-0"
          }`}
        />
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1">
          {subItems.map((item) => (
            <button
              key={item}
              className="w-full p-2 text-sm text-left rounded-lg transition-colors hover:bg-gray-700 focus:outline-none"
              onClick={() => handleSubItemClick(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
