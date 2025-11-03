import React, { useState } from "react";
import DataTable from "react-data-table-component";
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";

export const PersonalTable = ({
  items,
  isLoading,
  onEdit,
  onDelete,
  cambioEstados,
}) => {
  const [filterText, setFilterText] = useState("");

  const getNombreCompleto = (item) => {
    return `${item.primer_nombre || ""} ${item.segundo_nombre || ""} ${
      item.primer_apellido || ""
    } ${item.segundo_apellido || ""}`
      .replace(/\s+/g, " ")
      .trim();
  };

  const filteredItems = items.filter(
    (item) =>
      getNombreCompleto(item).toLowerCase().includes(filterText.toLowerCase()) ||
      (item.cedula && item.cedula.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.cargo && item.cargo.toLowerCase().includes(filterText.toLowerCase()))
  );

  const columns = [
    {
      name: "ID",
      selector: (row) => row.id_personal,
      sortable: true,
    },
    {
      name: "Persona",
      selector: (row) => getNombreCompleto(row) || row.id_persona,
      sortable: true,
    },
    {
      name: "Cédula",
      selector: (row) => row.cedula || "-",
      sortable: true,
    },
    {
      name: "Género",
      selector: (row) => row.genero || "N/A",
      sortable: true,
      width: "100px",
    },
    {
      name: "Cargo",
      selector: (row) => row.cargo,
      sortable: true,
    },
    {
      name: "Código RAC",
      selector: (row) => row.codigo_rac || "-",
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
            className="mr-2 text-yellow-500"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(row.id_personal)}
            className="text-red-500"
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
      placeholder="Buscar..."
      className="w-1/4 p-2 border border-gray-300 rounded-md"
      onChange={(e) => setFilterText(e.target.value)}
      value={filterText}
    />
  );

  const customStyles = {
    table: {
      style: {
        width: '100%',
        tableLayout: 'auto',
      },
    },
    headCells: {
      style: {
        whiteSpace: 'normal',
      },
    },
    cells: {
      style: {
        whiteSpace: 'normal',
      },
    },
  };

  return (
    <div className="overflow-x-auto">
      <DataTable
        columns={columns}
        data={filteredItems}
        customStyles={customStyles}
        progressPending={isLoading}
        progressComponent={<p>Cargando...</p>}
        noDataComponent={<p>No hay registros</p>}
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

