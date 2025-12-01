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
  estudiantesTableClasses,
  estadoGenericoClases,
  contenidosIconClasses,
} from "../EstilosCliente/EstilosClientes";

const EstudianteTabla = ({
  estudiantes = [],
  isCargando = false,
  info = "No se encontraron estudiantes para mostrar",
  onEditar,
  cambioEstados,
  onEliminar,
  onVer,
}) => {
  const [filterText, setFilterText] = useState("");

  const filteredItems = estudiantes.filter((item) =>
    `${item.primer_nombre} ${item.segundo_nombre} ${item.primer_apellido} ${item.segundo_apellido}`
      .toLowerCase()
      .includes(filterText.toLowerCase())
  );

  const columns = [
    {
      name: "Nombre",
      selector: (row) =>
        `${row.primer_nombre || ""} ${row.segundo_nombre || ""}`.trim(),
      sortable: true,
    },
    {
      name: "Apellidos",
      selector: (row) =>
        `${row.primer_apellido || ""} ${row.segundo_apellido || ""}`.trim(),
      sortable: true,
    },
    {
      name: "Género",
      selector: (row) => row.genero || "N/A",
      sortable: true,
      width: "100px",
    },
    {
      name: "Estado",
      selector: (row) => row.estado || "activo",
      sortable: true,
      width: "140px",
      cell: (row) => {
        const estado = row.estado === "inactivo" ? "inactivo" : "activo";
        const label = estado === "activo" ? "Activo" : "Inactivo";
        const estadoClass =
          estado === "activo"
            ? estadoGenericoClases.active
            : estadoGenericoClases.inactive;
        return (
          <span className={`${estadoGenericoClases.base} ${estadoClass}`}>
            {label}
          </span>
        );
      },
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className={estudiantesTableClasses.actionGroup}>
          {onVer && (
            <button
              onClick={() => onVer(row)}
              className={`${estudiantesTableClasses.actionButton} ${estudiantesTableClasses.viewButton}`}
              title="Ver"
            >
              <FaEye className={contenidosIconClasses.base} />
            </button>
          )}
          <button
            onClick={() => cambioEstados(row)}
            className={`${estudiantesTableClasses.actionButton} ${
              row.estado === "activo"
                ? estudiantesTableClasses.toggleOn
                : estudiantesTableClasses.toggleOff
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
            onClick={() => onEditar && onEditar(row)}
            className={`${estudiantesTableClasses.actionButton} ${estudiantesTableClasses.editButton}`}
            title="Editar"
          >
            <FaEdit className={contenidosIconClasses.base} />
          </button>
          <button
            onClick={() =>
              onEliminar && onEliminar(row.id_estudiante || row.id)
            }
            className={`${estudiantesTableClasses.actionButton} ${estudiantesTableClasses.deleteButton}`}
            title="Eliminar"
          >
            <FaTrash className={contenidosIconClasses.base} />
          </button>
        </div>
      ),
    },
  ];

  const subHeaderComponent = (
    <div className={estudiantesTableClasses.filterContainer}>
      <input
        type="text"
        placeholder="Buscar por nombre o apellido"
        className={estudiantesTableClasses.filterInput}
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
    <div className={estudiantesTableClasses.wrapper}>
      <DataTable
        columns={columns}
        data={filteredItems}
        customStyles={customStyles}
        progressPending={isCargando}
        progressComponent={
          <p className={estudiantesTableClasses.helperText}>
            Cargando estudiantes...
          </p>
        }
        noDataComponent={
          <p className={estudiantesTableClasses.helperText}>{info}</p>
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

export default EstudianteTabla;
