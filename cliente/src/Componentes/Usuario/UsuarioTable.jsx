import React, { useState } from "react";
import DataTable from "react-data-table-component";
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";

export const UsuarioTable = ({
  usuarios,
  isLoading,
  onEdit,
  onDelete,
  cambioEstados,
}) => {
  const [filterText, setFilterText] = useState("");

  const filteredItems = usuarios.filter(
    (item) =>
      item.nombre_usuario.toLowerCase().includes(filterText.toLowerCase()) ||
      item.rol.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    {
      name: "ID",
      selector: (row) => row.id_usuario,
      sortable: true,
    },
    {
      name: "Nombre de Usuario",
      selector: (row) => row.nombre_usuario,
      sortable: true,
    },
    {
      name: "Rol",
      selector: (row) => row.rol,
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
            className="text-yellow-500 hover:text-yellow-700 mr-2"
            title="Editar"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(row.id_usuario)}
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
        customStyles={customStyles}
        data={filteredItems}
        progressPending={isLoading}
        progressComponent={<p className="text-center text-gray-500">Cargando usuarios...</p>}
        noDataComponent={<p className="text-center text-gray-500">No hay usuarios para mostrar.</p>}
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

