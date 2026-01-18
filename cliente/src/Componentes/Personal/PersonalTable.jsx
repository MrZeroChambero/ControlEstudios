import React from "react";
import {
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaEye,
} from "react-icons/fa";
import {
  personalTableClasses,
  personalBadgeClasses,
  estadoGenericoClases,
  contenidosIconClasses,
} from "../EstilosCliente/EstilosClientes";
import { TablaEntradas } from "../Tablas/Tablas.jsx";

export const PersonalTable = ({
  personal = [],
  isLoading,
  onEdit,
  onDelete,
  cambioEstados,
  onView,
}) => {
  const resolveEstadoBadge = (estado, fallback = "") => {
    const normalized = (estado || fallback || "").toString().toLowerCase();
    const base = estadoGenericoClases.base;
    if (normalized === "activo") {
      return `${base} ${estadoGenericoClases.active}`;
    }
    if (normalized === "incompleto") {
      return `${base} ${personalBadgeClasses.incompleto}`;
    }
    if (normalized === "licencia") {
      return `${base} ${personalBadgeClasses.licencia}`;
    }
    return `${base} ${estadoGenericoClases.inactive}`;
  };

  const resolveTipoPill = (tipo) => {
    const normalized = (tipo || "").toString().toLowerCase();
    const { typePill } = personalTableClasses;
    if (normalized.includes("administrativ")) return typePill.administrativo;
    if (normalized.includes("obrero")) return typePill.obrero;
    if (normalized.includes("especialist") || normalized.includes("de cultura"))
      return typePill.especialista;
    if (normalized.includes("docente")) return typePill.docente;
    return typePill.default;
  };

  const columns = [
    {
      name: "Nombre Completo",
      selector: (row) =>
        `${row.primer_nombre} ${row.segundo_nombre || ""} ${
          row.primer_apellido
        } ${row.segundo_apellido || ""}`,
      sortable: true,
      wrap: true,
    },
    {
      name: "Cédula",
      selector: (row) => row.cedula,
      sortable: true,
      wrap: true,
    },
    {
      name: "Cargo",
      selector: (row) =>
        row.nombre_cargo || row.nombre_funcion || row.funcion || "",
      sortable: true,
      wrap: true,
    },
    {
      name: "Estado",
      cell: (row) => (
        <span
          className={resolveEstadoBadge(row.estado, row.estado_persona_nombre)}
        >
          {row.estado_persona_nombre || row.estado || "—"}
        </span>
      ),
      sortable: true,
      width: "140px",
    },
    {
      name: "Condición",
      cell: (row) => (
        <span
          className={resolveEstadoBadge(
            row.estado_personal,
            row.estado_personal_nombre
          )}
        >
          {row.estado_personal_nombre || row.estado_personal || "—"}
        </span>
      ),
      sortable: true,
      width: "140px",
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className={personalTableClasses.actionGroup}>
          <button
            onClick={() => onView(row)}
            className={`${personalTableClasses.actionButton} ${personalTableClasses.viewButton}`}
            title="Ver"
          >
            <FaEye className={contenidosIconClasses.base} />
          </button>
          <button
            onClick={() => cambioEstados(row)}
            className={`${personalTableClasses.actionButton} ${
              row.estado === "activo"
                ? personalTableClasses.toggleOn
                : personalTableClasses.toggleOff
            }`}
            title={
              row.estado === "activo"
                ? "Desactivar (persona)"
                : "Activar (persona)"
            }
          >
            {row.estado === "activo" ? (
              <FaToggleOn className={contenidosIconClasses.base} />
            ) : (
              <FaToggleOff className={contenidosIconClasses.base} />
            )}
          </button>
          <button
            onClick={() => onEdit(row)}
            className={`${personalTableClasses.actionButton} ${personalTableClasses.editButton}`}
            title="Editar"
          >
            <FaEdit className={contenidosIconClasses.base} />
          </button>
          <button
            onClick={() => onDelete(row.id_personal)}
            className={`${personalTableClasses.actionButton} ${personalTableClasses.deleteButton}`}
            title="Eliminar"
          >
            <FaTrash className={contenidosIconClasses.base} />
          </button>
        </div>
      ),
      width: "220px",
    },
  ];

  const filterConfig = {
    placeholder: "Buscar por nombre, cédula, cargo o función...",
    wrapperClassName: personalTableClasses.filterContainer,
    inputClassName: personalTableClasses.filterInput,
    matcher: (item, term) => {
      const campos = [
        item.primer_nombre,
        item.primer_apellido,
        item.cedula,
        item.nombre_cargo || item.nombre_funcion || item.funcion,
        item.nombre_funcion || item.nombre_cargo || item.funcion,
      ];
      return campos.some(
        (campo) => campo && campo.toLowerCase().includes(term)
      );
    },
  };

  return (
    <div className={personalTableClasses.wrapper}>
      <TablaEntradas
        columns={columns}
        isLoading={isLoading}
        data={personal}
        filterConfig={filterConfig}
        progressComponent={
          <p className={personalTableClasses.helperText}>
            Cargando personal...
          </p>
        }
        noDataComponent={
          <p className={personalTableClasses.helperText}>
            No hay personal para mostrar.
          </p>
        }
        dataTableProps={{
          responsive: true,
        }}
      />
    </div>
  );
};
