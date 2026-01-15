import React, { useState } from "react";
import DataTableSeguro from "../../utilidades/DataTableSeguro";
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";
import {
  personasTableClasses,
  contenidosIconClasses,
  dataTableBaseStyles,
} from "../EstilosCliente/EstilosClientes";

export const PersonaTable = ({
  personas,
  isLoading,
  onEdit,
  onDelete,
  cambioEstados,
}) => {
  const [filterText, setFilterText] = useState("");

  const getNombreCompleto = (persona) => {
    return `${persona.primer_nombre} ${persona.segundo_nombre || ""} ${
      persona.primer_apellido
    } ${persona.segundo_apellido || ""}`
      .replace(/\s+/g, " ")
      .trim();
  };

  const filteredItems = personas.filter(
    (item) =>
      getNombreCompleto(item)
        .toLowerCase()
        .includes(filterText.toLowerCase()) ||
      (item.cedula &&
        item.cedula.toLowerCase().includes(filterText.toLowerCase()))
  );

  const columns = [
    {
      name: "Nombre Completo",
      selector: (row) => getNombreCompleto(row),
      sortable: true,
    },
    {
      name: "Cédula",
      selector: (row) => row.cedula || "N/A",
      sortable: true,
    },
    {
      name: "Género",
      selector: (row) => row.genero || "N/A",
      sortable: true,
      width: "100px",
    },
    {
      name: "Teléfono",
      selector: (row) => row.telefono_principal,
      sortable: true,
    },
    {
      name: "Tipo",
      selector: (row) => row.tipo_persona || "No asignado",
      sortable: true,
      format: (row) => (
        <span className="capitalize">{row.tipo_persona || "No asignado"}</span>
      ),
    },
    {
      name: "Estado",
      cell: (row) => (
        <span
          className={`${personasTableClasses.statusChip.base} ${
            row.estado === "activo"
              ? personasTableClasses.statusChip.activo
              : personasTableClasses.statusChip.inactivo
          }`}
        >
          {row.estado || "—"}
        </span>
      ),
      sortable: true,
      selector: (row) => row.estado,
      width: "110px",
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className={personasTableClasses.actionGroup}>
          <button
            onClick={() => cambioEstados(row)}
            className={`${personasTableClasses.actionButton} ${
              row.estado === "activo"
                ? personasTableClasses.toggleOn
                : personasTableClasses.toggleOff
            }`}
            title={row.estado === "activo" ? "Desactivar" : "Activar"}
          >
            {row.estado === "activo" ? (
              <FaToggleOn className={contenidosIconClasses.base} />
            ) : (
              <FaToggleOff className={contenidosIconClasses.base} />
            )}
          </button>
          <button
            onClick={() => onEdit(row)}
            className={`${personasTableClasses.actionButton} ${personasTableClasses.editButton}`}
            title="Editar"
          >
            <FaEdit className={contenidosIconClasses.base} />
          </button>
          <button
            onClick={() => onDelete(row.id_persona)}
            className={`${personasTableClasses.actionButton} ${personasTableClasses.deleteButton}`}
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
    <div className={personasTableClasses.filterContainer}>
      <input
        type="text"
        placeholder="Buscar por nombre o cédula..."
        className={personasTableClasses.filterInput}
        onChange={(e) => setFilterText(e.target.value)}
        value={filterText}
      />
    </div>
  );

  return (
    <div className={personasTableClasses.wrapper}>
      <DataTableSeguro
        columns={columns}
        data={filteredItems}
        customStyles={dataTableBaseStyles}
        progressPending={isLoading}
        progressComponent={
          <p className={personasTableClasses.helperText}>
            Cargando personas...
          </p>
        }
        noDataComponent={
          <p className={personasTableClasses.helperText}>
            No hay personas para mostrar.
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
      />
    </div>
  );
};
