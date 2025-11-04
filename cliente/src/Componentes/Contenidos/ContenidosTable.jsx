import React, { useState } from "react";
import DataTable from "react-data-table-component";
import {
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaEye,
  FaList,
} from "react-icons/fa";

export const ContenidosTable = ({
  contenidos,
  isLoading,
  onEdit,
  onDelete,
  cambioEstados,
  onView,
  onViewTemas,
}) => {
  const [filterText, setFilterText] = useState("");

  const filteredItems = contenidos.filter(
    (item) =>
      item.nombre.toLowerCase().includes(filterText.toLowerCase()) ||
      (item.nombre_area &&
        item.nombre_area.toLowerCase().includes(filterText.toLowerCase())) ||
      item.nivel.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    {
      name: "ID",
      selector: (row) => row.id_contenido,
      sortable: true,
    },
    {
      name: "Nombre",
      selector: (row) => row.nombre,
      sortable: true,
    },
    {
      name: "Área de Aprendizaje",
      selector: (row) => row.nombre_area,
      sortable: true,
    },
    {
      name: "Nivel",
      selector: (row) => row.nivel,
      sortable: true,
    },
    {
      name: "Orden",
      selector: (row) => row.orden_contenido,
      sortable: true,
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
        <div className="text-center">
          <button
            onClick={() => onViewTemas(row)}
            className="text-purple-500 hover:text-purple-700 mr-2"
            title="Ver Temas"
          >
            <FaList />
          </button>
          <button
            onClick={() => onView(row)}
            className="text-blue-500 hover:text-blue-700 mr-2"
            title="Ver"
          >
            <FaEye />
          </button>
          <button
            onClick={() => cambioEstados(row)}
            className={`text-2xl mr-2 ${
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
            className="text-yellow-500 hover:text-yellow-700 mr-2"
            title="Editar"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(row.id_contenido)}
            className="text-red-500 hover:text-red-700"
            title="Eliminar"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const subHeaderComponent = (
    <input
      type="text"
      placeholder="Buscar por nombre, área o nivel..."
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
      },
    },
    cells: {
      style: {
        whiteSpace: "normal",
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
          <p className="text-center text-gray-500">Cargando contenidos...</p>
        }
        noDataComponent={
          <p className="text-center text-gray-500">
            No hay contenidos para mostrar.
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
