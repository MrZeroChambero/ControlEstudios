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
  areasTableClasses,
  areasBadgeClasses,
  areasIconClasses,
} from "./areasAprendizajeEstilos";
import { dataTableBaseStyles } from "../EstilosCliente/EstilosClientes";

export const AreasAprendizajeTable = ({
  areas,
  isLoading,
  onEdit,
  onDelete,
  cambioEstados,
  onView,
}) => {
  const [filterText, setFilterText] = useState("");

  const filterValue = filterText.toLowerCase();
  const obtenerNombresComponentes = (item) =>
    (item.componentes ?? [])
      .map((componente) => componente.nombre_componente)
      .join(", ");

  const filteredItems = areas.filter((item) => {
    const nombresComponentes = obtenerNombresComponentes(item);
    return (
      item.nombre_area.toLowerCase().includes(filterValue) ||
      nombresComponentes.toLowerCase().includes(filterValue)
    );
  });

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
          className={`${areasBadgeClasses.base} ${
            row.estado_area === "activo"
              ? areasBadgeClasses.active
              : areasBadgeClasses.inactive
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
        <div className={areasTableClasses.actionGroup}>
          <button
            onClick={() => onView(row)}
            className={`${areasTableClasses.actionButton} ${areasTableClasses.viewButton}`}
            title="Ver"
          >
            <FaEye className={areasIconClasses.base} />
          </button>
          <button
            onClick={() => cambioEstados(row)}
            className={`${areasTableClasses.actionButton} ${
              row.estado_area === "activo"
                ? areasTableClasses.toggleOn
                : areasTableClasses.toggleOff
            }`}
            title={row.estado_area === "activo" ? "Desactivar" : "Activar"}
          >
            {row.estado_area === "activo" ? (
              <FaToggleOn className={areasIconClasses.base} />
            ) : (
              <FaToggleOff className={areasIconClasses.base} />
            )}
          </button>
          <button
            onClick={() => onEdit(row)}
            className={`${areasTableClasses.actionButton} ${areasTableClasses.editButton}`}
            title="Editar"
          >
            <FaEdit className={areasIconClasses.base} />
          </button>
          <button
            onClick={() => onDelete(row.id_area_aprendizaje)}
            className={`${areasTableClasses.actionButton} ${areasTableClasses.deleteButton}`}
            title="Eliminar"
          >
            <FaTrash className={areasIconClasses.base} />
          </button>
        </div>
      ),
    },
  ];

  const subHeaderComponent = (
    <div className={areasTableClasses.filterWrapper}>
      <input
        type="text"
        placeholder="Buscar por nombre o componente..."
        className={areasTableClasses.filterInput}
        onChange={(e) => setFilterText(e.target.value)}
        value={filterText}
      />
    </div>
  );

  return (
    <div className={areasTableClasses.wrapper}>
      <DataTable
        columns={columns}
        customStyles={dataTableBaseStyles}
        data={filteredItems}
        progressPending={isLoading}
        progressComponent={
          <p className={areasTableClasses.helperText}>
            Cargando áreas de aprendizaje...
          </p>
        }
        noDataComponent={
          <p className={areasTableClasses.helperText}>
            No hay áreas de aprendizaje para mostrar.
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
