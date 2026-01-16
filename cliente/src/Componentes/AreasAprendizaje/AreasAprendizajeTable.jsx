import React from "react";
import {
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaEye,
} from "react-icons/fa";
import {
  BadgeClasses,
  IconClasses,
  TableClasses,
} from "../Tablas/EstilosTablas.js";
import { TablaEntradas } from "../Tablas/Tablas.jsx";

export const AreasAprendizajeTable = ({
  areas = [],
  isLoading,
  onEdit,
  onDelete,
  cambioEstados,
  onView,
}) => {
  const columns = [
    {
      name: "Nombre del Área",
      selector: (row) => row.nombre_area,
      sortable: true,
    },
    {
      name: "Componentes asociados",
      selector: (row) =>
        (row.componentes ?? [])
          .map((componente) => componente.nombre_componente)
          .join(", ") || "Sin componentes",
      sortable: false,
      wrap: true,
    },
    {
      name: "Estado",
      cell: (row) => (
        <span
          className={`${BadgeClasses.base} ${
            row.estado_area === "activo"
              ? BadgeClasses.active
              : BadgeClasses.inactive
          }`}
        >
          {row.estado_area}
        </span>
      ),
      sortable: true,
      selector: (row) => row.estado_area,
      width: "100px",
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className={TableClasses.actionGroup}>
          <button
            onClick={() => onView(row)}
            className={`${TableClasses.actionButton} ${TableClasses.viewButton}`}
            title="Ver"
          >
            <FaEye className={IconClasses} />
          </button>
          <button
            onClick={() => cambioEstados(row)}
            className={`${TableClasses.actionButton} ${
              row.estado_area === "activo"
                ? TableClasses.toggleOn
                : TableClasses.toggleOff
            }`}
            title={row.estado_area === "activo" ? "Desactivar" : "Activar"}
          >
            {row.estado_area === "activo" ? (
              <FaToggleOn className={IconClasses} />
            ) : (
              <FaToggleOff className={IconClasses} />
            )}
          </button>
          <button
            onClick={() => onEdit(row)}
            className={`${TableClasses.actionButton} ${TableClasses.editButton}`}
            title="Editar"
          >
            <FaEdit className={IconClasses} />
          </button>
          <button
            onClick={() => onDelete(row.id_area_aprendizaje)}
            className={`${TableClasses.actionButton} ${TableClasses.deleteButton}`}
            title="Eliminar"
          >
            <FaTrash className={IconClasses} />
          </button>
        </div>
      ),
    },
  ];

  const obtenerNombresComponentes = (item) =>
    (item.componentes ?? [])
      .map((componente) => componente.nombre_componente)
      .join(", ");

  const filterConfig = {
    placeholder: "Buscar por área o componente...",
    matcher: (item, normalizedValue) => {
      const nombre = item.nombre_area?.toLowerCase() ?? "";
      const componentes = obtenerNombresComponentes(item).toLowerCase();
      return (
        nombre.includes(normalizedValue) ||
        componentes.includes(normalizedValue)
      );
    },
  };
  return (
    <TablaEntradas
      columns={columns}
      isLoading={isLoading}
      data={areas}
      filterConfig={filterConfig}
    />
  );
};
