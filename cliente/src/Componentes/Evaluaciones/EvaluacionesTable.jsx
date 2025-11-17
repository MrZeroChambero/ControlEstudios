import React, { useState } from "react";
import DataTable from "react-data-table-component";
import {
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaEye,
} from "react-icons/fa";

export const EvaluacionesTable = ({
  evaluaciones,
  isLoading,
  onEdit,
  onDelete,
  cambioEstados,
  onView,
}) => {
  const [filterText, setFilterText] = useState("");

  const filteredItems = evaluaciones.filter(
    (item) =>
      item.nombre_evaluacion.toLowerCase().includes(filterText.toLowerCase()) ||
      (item.descripcion &&
        item.descripcion.toLowerCase().includes(filterText.toLowerCase()))
  );

  const columns = [
    {
      name: "ID",
      selector: (row) => row.id_evaluacion,
      sortable: true,
      width: "80px",
    },
    {
      name: "Nombre de la Evaluación",
      selector: (row) => row.nombre_evaluacion,
      sortable: true,
      wrap: true,
    },
    {
      name: "Descripción",
      selector: (row) => row.descripcion || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: "Estado",
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs font-bold rounded-full ${
            row.estado === "activo"
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {row.estado}
        </span>
      ),
      sortable: true,
      selector: (row) => row.estado,
      width: "100px",
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className="flex space-x-2 justify-center">
          <button
            onClick={() => onView(row)}
            className="text-blue-500 hover:text-blue-700 text-lg"
            title="Ver"
          >
            <FaEye />
          </button>
          <button
            onClick={() => cambioEstados(row)}
            className={`text-2xl ${
              row.estado === "activo"
                ? "text-green-500 hover:text-green-600"
                : "text-gray-400 hover:text-gray-500"
            }`}
            title={row.estado === "activo" ? "Desactivar" : "Activar"}
          >
            {row.estado === "activo" ? <FaToggleOn /> : <FaToggleOff />}
          </button>
          <button
            onClick={() => onEdit(row)}
            className="text-yellow-500 hover:text-yellow-700 text-lg"
            title="Editar"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(row.id_evaluacion)}
            className="text-red-500 hover:text-red-700 text-lg"
            title="Eliminar"
          >
            <FaTrash />
          </button>
        </div>
      ),
      width: "200px",
    },
  ];

  const subHeaderComponent = (
    <input
      type="text"
      placeholder="Buscar por nombre o descripción..."
      className="w-1/4 p-2 border border-gray-300 rounded-md"
      onChange={(e) => setFilterText(e.target.value)}
      value={filterText}
    />
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
        fontWeight: "bold",
        fontSize: "14px",
        backgroundColor: "#f8fafc",
      },
    },
    cells: {
      style: {
        whiteSpace: "normal",
        wordBreak: "break-word",
      },
    },
  };

  return (
    <div className="overflow-x-auto">
      <DataTable
        columns={columns}
        customStyles={customStyles}
        data={filteredItems}
        progressPending={isLoading}
        progressComponent={
          <p className="text-center text-gray-500">Cargando evaluaciones...</p>
        }
        noDataComponent={
          <p className="text-center text-gray-500">
            No hay evaluaciones para mostrar.
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
