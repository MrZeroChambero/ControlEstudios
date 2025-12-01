import React, { useState } from "react";
import DataTable from "react-data-table-component";
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

export const PersonalTable = ({
  personal,
  isLoading,
  onEdit,
  onDelete,
  cambioEstados,
  onView,
}) => {
  const [filterText, setFilterText] = useState("");

  const filteredItems = personal.filter(
    (item) =>
      item.primer_nombre.toLowerCase().includes(filterText.toLowerCase()) ||
      item.primer_apellido.toLowerCase().includes(filterText.toLowerCase()) ||
      item.cedula.toLowerCase().includes(filterText.toLowerCase()) ||
      (item.nombre_cargo &&
        item.nombre_cargo.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.nombre_funcion &&
        item.nombre_funcion.toLowerCase().includes(filterText.toLowerCase()))
  );

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
    if (normalized === "administrativo") return typePill.administrativo;
    if (normalized === "docente") return typePill.docente;
    if (normalized === "obrero") return typePill.obrero;
    if (normalized === "especialista") return typePill.especialista;
    return typePill.default;
  };

  const columns = [
    {
      name: "ID",
      selector: (row) => row.id_personal,
      sortable: true,
      width: "80px",
    },
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
      selector: (row) => row.nombre_cargo,
      sortable: true,
      wrap: true,
    },
    {
      name: "Función",
      selector: (row) => row.nombre_funcion,
      sortable: true,
      wrap: true,
    },
    {
      name: "Tipo",
      cell: (row) => (
        <span className={resolveTipoPill(row.tipo_cargo)}>
          {row.tipo_cargo || "—"}
        </span>
      ),
      sortable: true,
      width: "120px",
    },
    {
      name: "Estado Persona",
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
      name: "Estado Personal",
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

  const subHeaderComponent = (
    <div className={personalTableClasses.filterContainer}>
      <input
        type="text"
        placeholder="Buscar por nombre, cédula, cargo o función..."
        className={personalTableClasses.filterInput}
        onChange={(e) => setFilterText(e.target.value)}
        value={filterText}
      />
    </div>
  );

  const customStyles = {
    table: {
      style: {
        width: "100%",
        tableLayout: "auto",
      },
    },
    headCells: {
      style: {
        whiteSpace: "normal",
      },
    },
    cells: {
      style: {
        whiteSpace: "normal",
      },
    },
  };

  return (
    <div className={personalTableClasses.wrapper}>
      <DataTable
        columns={columns}
        data={filteredItems}
        customStyles={customStyles}
        progressPending={isLoading}
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
        pagination
        paginationComponentOptions={{
          rowsPerPageText: "Filas por página:",
          rangeSeparatorText: "de",
        }}
        subHeader
        subHeaderComponent={subHeaderComponent}
        striped
        highlightOnHover
        responsive
      />
    </div>
  );
};
