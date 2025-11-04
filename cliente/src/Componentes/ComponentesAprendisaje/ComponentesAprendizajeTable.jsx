import React, { useState } from "react";
import DataTable from "react-data-table-component";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";

export const ComponentesAprendizajeTable = ({
  componentes,
  isLoading,
  onEdit,
  onDelete,
  onStatusChange,
  onView,
}) => {
  const [filterText, setFilterText] = useState("");

  const filteredItems = componentes.filter(
    (item) =>
      item.nombre_componente &&
      item.nombre_componente.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    {
      name: "ID Componente",
      selector: (row) => row.id_componente,
      sortable: true,
      width: "150px",
    },
    {
      name: "Nombre del Componente",
      selector: (row) => row.nombre_componente,
      sortable: true,
      grow: 2,
    },
    {
      name: "Estado",
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs font-bold rounded-full ${
            row.estado == "activo"
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {row.estado == 1 ? "Activo" : "Inactivo"}
        </span>
      ),
      sortable: true,
      selector: (row) => row.estado,
      width: "120px",
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(row)}
            className="text-blue-500 hover:text-blue-700"
            title="Ver"
          >
            <FaEye />
          </button>
          <button
            onClick={() => onEdit(row)}
            className="text-yellow-500 hover:text-yellow-700"
            title="Editar"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(row.id_componente)}
            className="text-red-500 hover:text-red-700"
            title="Eliminar"
          >
            <FaTrash />
          </button>
          <button
            onClick={() => onStatusChange(row.id_componente)}
            className={`text-2xl ${
              row.estado == "activo"
                ? "text-green-500 hover:text-green-600"
                : "text-gray-400 hover:text-gray-500"
            }`}
            title={row.estado == "activo" ? "Desactivar" : "Activar"}
          >
            {row.estado == "activo" ? <FaToggleOn /> : <FaToggleOff />}
          </button>
        </div>
      ),
      width: "150px",
    },
  ];

  const subHeaderComponent = (
    <input
      type="text"
      placeholder="Buscar por nombre..."
      className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md"
      onChange={(e) => setFilterText(e.target.value)}
      value={filterText}
    />
  );

  return (
    <DataTable
      columns={columns}
      data={filteredItems}
      progressPending={isLoading}
      progressComponent={
        <p className="text-center text-gray-500 py-4">
          Cargando componentes...
        </p>
      }
      noDataComponent={
        <p className="text-center text-gray-500 py-4">
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
