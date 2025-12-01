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
  contenidosIconClasses,
} from "../EstilosCliente/EstilosClientes";

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
      name: "ID",
      selector: (row) => row.id_area_aprendizaje,
      sortable: true,
    },
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
            <FaEye className={contenidosIconClasses.base} />
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
              <FaToggleOn className="h-5 w-5" />
            ) : (
              <FaToggleOff className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => onEdit(row)}
            className={`${areasTableClasses.actionButton} ${areasTableClasses.editButton}`}
            title="Editar"
          >
            <FaEdit className={contenidosIconClasses.base} />
          </button>
          <button
            onClick={() => onDelete(row.id_area_aprendizaje)}
            className={`${areasTableClasses.actionButton} ${areasTableClasses.deleteButton}`}
            title="Eliminar"
          >
            <FaTrash className={contenidosIconClasses.base} />
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
    <div className={areasTableClasses.wrapper}>
      <DataTable
        columns={columns}
        customStyles={customStyles}
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
