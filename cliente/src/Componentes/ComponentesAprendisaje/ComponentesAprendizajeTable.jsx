import React, { useState } from "react";
import DataTable from "react-data-table-component";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import {
  tableClasses,
  statusClasses,
  iconClasses,
} from "./componentesAprendizajeStyles";

export const ComponentesAprendizajeTable = ({
  componentes,
  isLoading,
  onEdit,
  onDelete,
  onStatusChange,
  onView,
}) => {
  const [filterText, setFilterText] = useState("");

  const filtro = filterText.trim().toLowerCase();
  const filteredItems = componentes.filter((item) => {
    if (filtro === "") {
      return true;
    }

    const campos = [
      item.nombre_componente,
      item.nombre_area,
      item.especialista,
    ];

    return campos.some(
      (campo) => campo && campo.toLowerCase().includes(filtro)
    );
  });

  const columns = [
    {
      name: "ID Componente",
      selector: (row) => row.id_componente,
      sortable: true,
      width: "150px",
    },
    {
      name: "Área",
      selector: (row) => row.nombre_area || "Sin área",
      sortable: true,
      grow: 1.5,
      wrap: true,
    },
    {
      name: "Nombre del Componente",
      selector: (row) => row.nombre_componente,
      sortable: true,
      grow: 2,
    },
    {
      name: "Especialista",
      selector: (row) => row.especialista || "N/A",
      sortable: true,
      grow: 1.5,
      wrap: true,
    },
    {
      name: "Evalúa",
      cell: (row) => (
        <span
          className={`${statusClasses.base} ${
            row.evalua === "si" ? statusClasses.evalYes : statusClasses.evalNo
          }`}
        >
          {row.evalua === "si" ? "Sí evalúa" : "No evalúa"}
        </span>
      ),
      sortable: true,
      selector: (row) => row.evalua,
      width: "150px",
    },
    {
      name: "Estado",
      cell: (row) => (
        <span
          className={`${statusClasses.base} ${
            row.estado_componente === "activo"
              ? statusClasses.active
              : statusClasses.inactive
          }`}
        >
          {row.estado_componente === "activo" ? "Activo" : "Inactivo"}
        </span>
      ),
      sortable: true,
      selector: (row) => row.estado_componente,
      width: "120px",
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className={tableClasses.actionGroup}>
          <button
            onClick={() => onView(row)}
            className={`${tableClasses.actionButton} ${tableClasses.viewButton}`}
            title="Ver"
          >
            <FaEye className={iconClasses.base} />
          </button>
          <button
            onClick={() => onEdit(row)}
            className={`${tableClasses.actionButton} ${tableClasses.editButton}`}
            title="Editar"
          >
            <FaEdit className={iconClasses.base} />
          </button>
          <button
            onClick={() => onDelete(row.id_componente)}
            className={`${tableClasses.actionButton} ${tableClasses.deleteButton}`}
            title="Eliminar"
          >
            <FaTrash className={iconClasses.base} />
          </button>
          <button
            onClick={() => onStatusChange(row.id_componente)}
            className={`${tableClasses.actionButton} ${
              row.estado_componente === "activo"
                ? tableClasses.toggleOn
                : tableClasses.toggleOff
            }`}
            title={
              row.estado_componente === "activo" ? "Desactivar" : "Activar"
            }
          >
            {row.estado_componente === "activo" ? (
              <FaToggleOn className={iconClasses.base} />
            ) : (
              <FaToggleOff className={iconClasses.base} />
            )}
          </button>
        </div>
      ),
      width: "150px",
    },
  ];

  const subHeaderComponent = (
    <div className={tableClasses.filterContainer}>
      <input
        type="text"
        placeholder="Buscar por nombre, área o especialista"
        className={tableClasses.filterInput}
        onChange={(e) => setFilterText(e.target.value)}
        value={filterText}
      />
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={filteredItems}
      progressPending={isLoading}
      progressComponent={
        <p className={tableClasses.helperText}>Cargando componentes...</p>
      }
      noDataComponent={
        <p className={tableClasses.helperText}>
          No hay componentes para mostrar.
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
  );
};
