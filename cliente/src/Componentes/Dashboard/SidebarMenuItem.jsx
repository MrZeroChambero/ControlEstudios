import React from "react";
import { MdArrowRight } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { dashboardMenuItemClasses } from "./dashboardEstilos";

export const SidebarMenuItem = ({
  title,
  icon,
  subItems = [],
  isOpen,
  onToggle,
}) => {
  const navigate = useNavigate();

  const handleSubItemClick = (item) => {
    // Ahora item es un objeto, navegamos usando item.path
    navigate(`/${item.path}`);
    console.log(`Navegando a: /${item.path}`);
  };

  return (
    <div>
      <button onClick={onToggle} className={dashboardMenuItemClasses.button}>
        <div className={dashboardMenuItemClasses.titleWrapper}>
          {icon}
          <span>{title}</span>
        </div>
        <MdArrowRight
          className={`${dashboardMenuItemClasses.arrow} ${
            isOpen ? "rotate-90" : "rotate-0"
          }`}
        />
      </button>
      {isOpen && (
        <div className={dashboardMenuItemClasses.content}>
          {subItems.map((item) => (
            <button
              key={item.path} // Usar path como clave única
              className={dashboardMenuItemClasses.subItem}
              onClick={() => handleSubItemClick(item)}
            >
              {item.name} {/* Mostrar el nombre */}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
